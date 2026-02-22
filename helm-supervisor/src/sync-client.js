const http = require('http');
const https = require('https');

class SyncClient {
  constructor(config) {
    this.helmUrl = config.helmUrl;
    this.apiKey = config.apiKey;
    this.instanceId = config.instanceId;
  }

  async sendData(endpoint, data) {
    if (!this.helmUrl || !this.apiKey) {
      console.warn('[Sync] No Helm URL or API key configured, skipping sync');
      return false;
    }

    const url = `${this.helmUrl}/api/supervisor/${endpoint}`;
    
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const payload = JSON.stringify({
          instanceId: this.instanceId,
          ...data,
        });

        const reqOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Supervisor-Key': this.apiKey,
            'Content-Length': Buffer.byteLength(payload),
          },
        };

        const req = client.request(reqOptions, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[Sync] ${endpoint}: OK`);
              resolve(true);
            } else {
              console.error(`[Sync] ${endpoint}: ${res.statusCode} - ${body}`);
              resolve(false);
            }
          });
        });

        req.on('error', (err) => {
          console.error(`[Sync] ${endpoint} error:`, err.message);
          resolve(false);
        });

        req.setTimeout(15000, () => {
          req.destroy();
          console.error(`[Sync] ${endpoint}: timeout`);
          resolve(false);
        });

        req.write(payload);
        req.end();
      } catch (error) {
        console.error(`[Sync] ${endpoint} error:`, error.message);
        resolve(false);
      }
    });
  }

  async syncHeartbeat(systemInfo) {
    return this.sendData('heartbeat', { systemInfo });
  }

  async syncLogs(logs) {
    if (!logs.length) return true;
    return this.sendData('logs', { logs });
  }

  async syncMetrics(metrics) {
    if (!metrics) return true;
    return this.sendData('metrics', { metrics });
  }

  async syncErrors(errors) {
    if (!errors.length) return true;
    return this.sendData('errors', { errors });
  }

  async syncDeviceStates(states) {
    if (!states.length) return true;
    const limitedStates = states.slice(0, 500);
    return this.sendData('device-states', { states: limitedStates });
  }

  async syncAddonStatuses(statuses) {
    if (!statuses.length) return true;
    return this.sendData('addon-status', { statuses });
  }
}

module.exports = { SyncClient };
