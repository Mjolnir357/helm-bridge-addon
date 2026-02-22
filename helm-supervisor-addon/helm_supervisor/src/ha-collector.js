const http = require('http');
const https = require('https');

class HACollector {
  constructor(config) {
    this.config = config;
    this.supervisorUrl = config.supervisorUrl;
    this.haUrl = config.haUrl;
    this.token = config.supervisorToken;
  }

  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const req = client.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  async getSystemInfo() {
    try {
      const [hostInfo, supervisorInfo, coreInfo] = await Promise.all([
        this.request(`${this.supervisorUrl}/host/info`).catch(() => null),
        this.request(`${this.supervisorUrl}/supervisor/info`).catch(() => null),
        this.request(`${this.supervisorUrl}/core/info`).catch(() => null),
      ]);

      return {
        haVersion: coreInfo?.data?.data?.version || 'unknown',
        supervisorVersion: supervisorInfo?.data?.data?.version || 'unknown',
        osVersion: hostInfo?.data?.data?.operating_system || 'unknown',
        hostname: hostInfo?.data?.data?.hostname || 'unknown',
        arch: supervisorInfo?.data?.data?.arch || 'unknown',
      };
    } catch (error) {
      console.error('[Collector] Failed to get system info:', error.message);
      return null;
    }
  }

  async getPerformanceMetrics() {
    try {
      const [hostStats, supervisorStats, coreInfo] = await Promise.all([
        this.request(`${this.supervisorUrl}/host/info`).catch(() => null),
        this.request(`${this.supervisorUrl}/supervisor/stats`).catch(() => null),
        this.request(`${this.supervisorUrl}/core/info`).catch(() => null),
      ]);

      const stats = supervisorStats?.data?.data || {};
      const host = hostStats?.data?.data || {};
      const core = coreInfo?.data?.data || {};

      let entityCount = 0;
      let automationCount = 0;
      try {
        const states = await this.request(`${this.haUrl}/api/states`);
        if (Array.isArray(states?.data)) {
          entityCount = states.data.length;
          automationCount = states.data.filter(s => s.entity_id?.startsWith('automation.')).length;
        }
      } catch (e) {}

      let addonCount = 0;
      try {
        const addons = await this.request(`${this.supervisorUrl}/addons`);
        addonCount = addons?.data?.data?.addons?.length || 0;
      } catch (e) {}

      return {
        cpuPercent: stats.cpu_percent?.toString() || '0',
        memoryUsedMb: Math.round((stats.memory_usage || 0) / 1024 / 1024),
        memoryTotalMb: Math.round((stats.memory_limit || 0) / 1024 / 1024),
        diskUsedGb: host.disk_used?.toString() || '0',
        diskTotalGb: host.disk_total?.toString() || '0',
        networkRxBytes: (stats.network_rx || 0).toString(),
        networkTxBytes: (stats.network_tx || 0).toString(),
        uptime: 0,
        addonCount,
        entityCount,
        automationCount,
        recordedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Collector] Failed to get performance metrics:', error.message);
      return null;
    }
  }

  async getLogs() {
    try {
      const [coreLogs, supervisorLogs] = await Promise.all([
        this.request(`${this.supervisorUrl}/core/logs`).catch(() => null),
        this.request(`${this.supervisorUrl}/supervisor/logs`).catch(() => null),
      ]);

      const logs = [];
      
      const parseTimestamp = (line) => {
        const isoMatch = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/);
        if (isoMatch) {
          const parsed = new Date(isoMatch[1]);
          if (!isNaN(parsed.getTime())) return parsed.toISOString();
        }
        return new Date().toISOString();
      };

      const parseLogs = (raw, source) => {
        if (!raw || !raw.data || typeof raw.data !== 'string') return;
        const lines = raw.data.split('\n').filter(l => l.trim());
        const recent = lines.slice(-50);

        for (const line of recent) {
          let level = 'info';
          if (line.includes('ERROR') || line.includes('error')) level = 'error';
          else if (line.includes('WARNING') || line.includes('warn')) level = 'warning';
          else if (line.includes('DEBUG')) level = 'debug';

          logs.push({
            level,
            source,
            message: line.substring(0, 2000),
            loggedAt: parseTimestamp(line),
          });
        }
      };

      parseLogs(coreLogs, 'core');
      parseLogs(supervisorLogs, 'supervisor');

      return logs;
    } catch (error) {
      console.error('[Collector] Failed to get logs:', error.message);
      return [];
    }
  }

  async getAddonStatuses() {
    try {
      const response = await this.request(`${this.supervisorUrl}/addons`);
      const addons = response?.data?.data?.addons || [];

      const detailResults = await Promise.all(
        addons.map(addon =>
          this.request(`${this.supervisorUrl}/addons/${addon.slug}/info`)
            .then(detail => ({ slug: addon.slug, data: detail?.data?.data }))
            .catch(() => ({ slug: addon.slug, data: null }))
        )
      );

      const detailMap = {};
      for (const result of detailResults) {
        detailMap[result.slug] = result.data;
      }

      return addons.map(addon => {
        const addonInfo = detailMap[addon.slug];
        return {
          slug: addon.slug,
          name: addon.name || addon.slug,
          version: addon.version || addonInfo?.version || 'unknown',
          state: addon.state || addonInfo?.state || 'unknown',
          description: addon.description || addonInfo?.description || '',
          installError: addonInfo?.boot === 'manual' && addonInfo?.state === 'stopped'
            ? 'Add-on stopped (manual boot)' : null,
          lastStarted: addonInfo?.last_boot || null,
          recordedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error('[Collector] Failed to get addon statuses:', error.message);
      return [];
    }
  }

  async getDeviceStates() {
    try {
      const response = await this.request(`${this.haUrl}/api/states`);
      if (!Array.isArray(response?.data)) return [];

      return response.data.map(entity => ({
        entityId: entity.entity_id,
        entityName: entity.attributes?.friendly_name || entity.entity_id,
        domain: entity.entity_id.split('.')[0],
        state: entity.state,
        attributes: entity.attributes || {},
        lastChanged: entity.last_changed,
        recordedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('[Collector] Failed to get device states:', error.message);
      return [];
    }
  }

  async getErrors() {
    try {
      const response = await this.request(`${this.supervisorUrl}/resolution/info`);
      const resolution = response?.data?.data || {};
      
      const errors = [];
      
      if (resolution.issues && Array.isArray(resolution.issues)) {
        for (const issue of resolution.issues) {
          errors.push({
            errorType: issue.type || 'unknown',
            source: issue.context || 'system',
            message: `${issue.type}: ${issue.reference || 'No details'}`,
            context: issue,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          });
        }
      }

      if (resolution.unhealthy && Array.isArray(resolution.unhealthy)) {
        for (const item of resolution.unhealthy) {
          errors.push({
            errorType: 'unhealthy',
            source: typeof item === 'string' ? item : 'system',
            message: `System unhealthy: ${typeof item === 'string' ? item : JSON.stringify(item)}`,
            context: { unhealthy: item },
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          });
        }
      }

      return errors;
    } catch (error) {
      console.error('[Collector] Failed to get errors:', error.message);
      return [];
    }
  }
}

module.exports = { HACollector };
