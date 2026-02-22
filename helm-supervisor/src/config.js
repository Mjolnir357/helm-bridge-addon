const fs = require('fs');
const path = require('path');

function loadConfig() {
  let options = {};
  const optionsPath = '/data/options.json';
  
  if (fs.existsSync(optionsPath)) {
    options = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
  } else {
    options = {
      helm_url: process.env.HELM_URL || '',
      api_key: process.env.HELM_API_KEY || '',
      sync_interval: parseInt(process.env.SYNC_INTERVAL || '60'),
      collect_device_states: true,
      collect_performance_metrics: true,
      collect_addon_status: true,
      log_level: process.env.LOG_LEVEL || 'info',
    };
  }

  const supervisorToken = process.env.SUPERVISOR_TOKEN || '';
  const supervisorUrl = process.env.SUPERVISOR_API || 'http://supervisor';
  const haUrl = process.env.HA_URL || 'http://supervisor/core';

  return {
    helmUrl: options.helm_url,
    apiKey: options.api_key,
    syncInterval: options.sync_interval || 60,
    collectDeviceStates: options.collect_device_states !== false,
    collectPerformanceMetrics: options.collect_performance_metrics !== false,
    collectAddonStatus: options.collect_addon_status !== false,
    logLevel: options.log_level || 'info',
    supervisorToken,
    supervisorUrl,
    haUrl,
    instanceId: generateInstanceId(),
  };
}

function generateInstanceId() {
  const idPath = '/data/instance-id';
  if (fs.existsSync(idPath)) {
    return fs.readFileSync(idPath, 'utf8').trim();
  }
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'helm-sv-';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  try {
    fs.mkdirSync(path.dirname(idPath), { recursive: true });
    fs.writeFileSync(idPath, id);
  } catch (e) {
    // running outside HA, just use generated
  }
  return id;
}

module.exports = { loadConfig };
