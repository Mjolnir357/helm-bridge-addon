import { HEARTBEAT_INTERVAL_MS, PROTOCOL_VERSION } from '../../packages/protocol/src/constants';

export interface BridgeConfig {
  haUrl: string;
  haToken: string;
  cloudUrl: string;
  bridgeId: string;
  credentialPath: string;
  heartbeatInterval: number;
  protocolVersion: string;
}

export function loadConfig(): BridgeConfig {
  const haUrl = process.env.HA_URL || process.env.SUPERVISOR_URL || 'http://supervisor/core';
  const haToken = process.env.HA_TOKEN || process.env.SUPERVISOR_TOKEN || '';
  const cloudUrl = process.env.CLOUD_URL || 'https://helm.replit.app';
  const bridgeId = process.env.BRIDGE_ID || generateBridgeId();
  const credentialPath = process.env.CREDENTIAL_PATH || '/data/credentials.json';
  
  if (!haToken) {
    console.error('❌ HA_TOKEN environment variable is required');
    process.exit(1);
  }
  
  return {
    haUrl: haUrl.replace(/\/$/, ''),
    haToken,
    cloudUrl: cloudUrl.replace(/\/$/, ''),
    bridgeId,
    credentialPath,
    heartbeatInterval: HEARTBEAT_INTERVAL_MS,
    protocolVersion: PROTOCOL_VERSION,
  };
}

function generateBridgeId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'helm-bridge-';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function getHAVersion(): Promise<string> {
  return Promise.resolve('unknown');
}
