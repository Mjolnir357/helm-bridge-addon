const { loadConfig } = require('./config');
const { HACollector } = require('./ha-collector');
const { SyncClient } = require('./sync-client');

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

let config;
let collector;
let syncClient;
let syncTimer = null;
let cycleCount = 0;

function log(level, ...args) {
  if (LOG_LEVELS[level] >= LOG_LEVELS[config?.logLevel || 'info']) {
    const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
    console.log(prefix, ...args);
  }
}

async function runSyncCycle() {
  cycleCount++;
  log('info', `Starting sync cycle #${cycleCount}...`);

  try {
    const systemInfo = await collector.getSystemInfo();
    if (systemInfo) {
      await syncClient.syncHeartbeat(systemInfo);
      log('debug', 'Heartbeat sent');
    }

    const logs = await collector.getLogs();
    if (logs.length > 0) {
      await syncClient.syncLogs(logs);
      log('debug', `Synced ${logs.length} log entries`);
    }

    if (config.collectPerformanceMetrics) {
      const metrics = await collector.getPerformanceMetrics();
      if (metrics) {
        await syncClient.syncMetrics(metrics);
        log('debug', 'Performance metrics synced');
      }
    }

    const errors = await collector.getErrors();
    if (errors.length > 0) {
      await syncClient.syncErrors(errors);
      log('debug', `Synced ${errors.length} errors`);
    }

    if (config.collectDeviceStates) {
      const states = await collector.getDeviceStates();
      if (states.length > 0) {
        await syncClient.syncDeviceStates(states);
        log('debug', `Synced ${states.length} device states`);
      }
    }

    if (config.collectAddonStatus) {
      const statuses = await collector.getAddonStatuses();
      if (statuses.length > 0) {
        await syncClient.syncAddonStatuses(statuses);
        log('debug', `Synced ${statuses.length} addon statuses`);
      }
    }

    log('info', `Sync cycle #${cycleCount} complete`);
  } catch (error) {
    log('error', `Sync cycle #${cycleCount} failed:`, error.message);
  }
}

async function main() {
  console.log('==============================================');
  console.log('  Helm Supervisor v1.0.0');
  console.log('  Monitoring & Diagnostics Collector');
  console.log('==============================================');

  config = loadConfig();
  
  log('info', `Instance ID: ${config.instanceId}`);
  log('info', `Helm URL: ${config.helmUrl || '(not configured)'}`);
  log('info', `Sync interval: ${config.syncInterval}s`);
  log('info', `Device states: ${config.collectDeviceStates}`);
  log('info', `Performance metrics: ${config.collectPerformanceMetrics}`);
  log('info', `Add-on status: ${config.collectAddonStatus}`);

  if (!config.helmUrl || !config.apiKey) {
    log('warn', 'Helm URL or API key not configured. Running in local-only mode.');
    log('warn', 'Configure helm_url and api_key in the add-on settings to enable sync.');
  }

  collector = new HACollector(config);
  syncClient = new SyncClient(config);

  await runSyncCycle();

  syncTimer = setInterval(runSyncCycle, config.syncInterval * 1000);

  process.on('SIGTERM', () => {
    log('info', 'Received SIGTERM, shutting down...');
    if (syncTimer) clearInterval(syncTimer);
    process.exit(0);
  });

  process.on('SIGINT', () => {
    log('info', 'Received SIGINT, shutting down...');
    if (syncTimer) clearInterval(syncTimer);
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
