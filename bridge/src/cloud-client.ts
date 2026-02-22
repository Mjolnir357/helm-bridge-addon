import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { BridgeConfig } from './config';
import { CredentialStore } from './credential-store';
import { HEARTBEAT_INTERVAL_MS, PROTOCOL_VERSION } from '../../packages/protocol/src/constants';
import type {
  AuthenticateMessage,
  AuthResultMessage,
  HeartbeatMessage,
  FullSyncMessage,
  StateBatchMessage,
  CommandMessage,
  CommandAckMessage,
  CommandResultMessage,
  CloudToBridgeMessage,
  DiagnosticLogEntry,
  BridgeLogsMessage,
  RequestLogsMessage,
} from '../../packages/protocol/src/messages';
import type { HAArea, HADevice, HAEntity, HAService } from '../../packages/protocol/src/entities';
import type { StateChangedEvent } from '../../packages/protocol/src/sync';

import type { DiagnosticSnapshot } from './diagnostic-logger';

export interface CloudClientEvents {
  connected: () => void;
  disconnected: (code: number, reason: string) => void;
  authenticated: (tenantId: string) => void;
  auth_failed: (error: string) => void;
  command: (command: CommandMessage) => void;
  request_full_sync: (reason?: string) => void;
  request_logs: (message: RequestLogsMessage) => void;
  error: (error: Error) => void;
}

export class CloudClient extends EventEmitter {
  private config: BridgeConfig;
  private credentialStore: CredentialStore;
  private ws: WebSocket | null = null;
  private authenticated = false;
  private tenantId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private shouldReconnect = true;
  private lastEventAt: Date | null = null;
  private haVersion: string = 'unknown';
  private entityCount: number = 0;
  private uptime: number = 0;
  private startTime: Date = new Date();
  private reconnectCount: number = 0;

  constructor(config: BridgeConfig, credentialStore: CredentialStore) {
    super();
    this.config = config;
    this.credentialStore = credentialStore;
  }

  private getWebSocketUrl(): string {
    const httpUrl = this.config.cloudUrl;
    const wsUrl = httpUrl.replace(/^http/, 'ws');
    return `${wsUrl}/ws/bridge`;
  }

  async connect(): Promise<void> {
    if (!this.credentialStore.isPaired()) {
      console.log('⚠️ Cannot connect to cloud: not paired');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const url = this.getWebSocketUrl();
        console.log('☁️ Connecting to Cloud:', url);

        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
          console.log('📡 Cloud WebSocket connected');
          this.reconnectAttempts = 0;
          this.emit('connected');
          this.sendAuth();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString()) as CloudToBridgeMessage;
            this.handleMessage(message, resolve, reject);
          } catch (error) {
            console.error('Failed to parse cloud message:', error);
          }
        });

        this.ws.on('close', (code, reason) => {
          console.log(`☁️ Cloud WebSocket closed: ${code} - ${reason.toString()}`);
          this.authenticated = false;
          this.stopHeartbeat();
          this.emit('disconnected', code, reason.toString());

          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        });

        this.ws.on('error', (error) => {
          console.error('❌ Cloud WebSocket error:', error);
          this.emit('error', error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(
    message: CloudToBridgeMessage,
    connectResolve?: (value: void) => void,
    connectReject?: (error: Error) => void
  ): void {
    switch (message.type) {
      case 'auth_result':
        this.handleAuthResult(message as AuthResultMessage, connectResolve, connectReject);
        break;

      case 'command':
        this.handleCommand(message as CommandMessage);
        break;

      case 'request_full_sync':
        console.log('📊 Cloud requested full sync:', message.reason);
        this.emit('request_full_sync', message.reason);
        break;

      case 'request_heartbeat':
        this.sendHeartbeat();
        break;

      case 'disconnect':
        console.log('🔌 Cloud requested disconnect:', message.reason);
        this.shouldReconnect = false;
        
        if (message.reason === 'user_disconnected' || message.reason === 'user_reset') {
          console.log('🗑️ Clearing local credentials (user disconnected from cloud UI)...');
          this.credentialStore.clear();
          console.log('');
          console.log('⚠️ Bridge was disconnected from Helm Cloud.');
          console.log('   Restart the add-on to generate a new pairing code.');
          console.log('');
        }
        
        this.disconnect();
        break;

      case 'request_logs':
        console.log('📋 Cloud requested diagnostic logs');
        this.emit('request_logs', message as RequestLogsMessage);
        break;

      default:
        console.log('Unknown cloud message type:', (message as any).type);
    }
  }

  private sendAuth(): void {
    const credential = this.credentialStore.get();
    if (!credential) {
      console.error('No credentials available');
      return;
    }

    const message: AuthenticateMessage = {
      type: 'authenticate',
      bridgeId: this.config.bridgeId,
      bridgeCredential: credential.bridgeCredential,
      protocolVersion: this.config.protocolVersion,
    };

    this.send(message);
  }

  private handleAuthResult(
    message: AuthResultMessage,
    connectResolve?: (value: void) => void,
    connectReject?: (error: Error) => void
  ): void {
    if (message.success) {
      this.authenticated = true;
      this.tenantId = message.tenantId!;
      console.log(`✅ Authenticated with cloud, tenant: ${this.tenantId}`);
      this.emit('authenticated', this.tenantId);
      this.startHeartbeat();
      if (connectResolve) connectResolve();
    } else {
      console.error('❌ Cloud auth failed:', message.error);
      
      // If auth failed due to revoked/invalid credential, clear local credentials
      const error = message.error || 'Unknown error';
      if (error.toLowerCase().includes('revoked') || error.toLowerCase().includes('invalid')) {
        console.log('🗑️ Clearing local credentials due to auth failure...');
        this.credentialStore.clear();
        console.log('');
        console.log('⚠️ Your bridge credentials were revoked or are invalid.');
        console.log('   Please restart the add-on to generate a new pairing code.');
        console.log('');
        this.shouldReconnect = false;
      }
      
      this.emit('auth_failed', error);
      if (connectReject) connectReject(new Error(error));
    }
  }

  private handleCommand(message: CommandMessage): void {
    console.log(`🎮 Received command: ${message.commandType} (${message.cmdId})`);
    
    if (message.requiresAck) {
      this.sendCommandAck(message.cmdId);
    }

    this.emit('command', message);
  }

  private sendCommandAck(cmdId: string): void {
    const ack: CommandAckMessage = {
      type: 'command_ack',
      cmdId,
      status: 'acknowledged',
      receivedAt: new Date().toISOString(),
    };
    this.send(ack);
  }

  sendCommandResult(
    cmdId: string,
    status: 'completed' | 'failed' | 'expired',
    result?: { changedEntities?: string[]; haResponse?: Record<string, unknown> },
    error?: { code: string; message: string; details?: Record<string, unknown> }
  ): void {
    const message: CommandResultMessage = {
      type: 'command_result',
      cmdId,
      status,
      completedAt: new Date().toISOString(),
      result,
      error,
    };
    this.send(message);
  }

  sendFullSync(data: {
    areas: HAArea[];
    devices: HADevice[];
    entities: HAEntity[];
    services: HAService[];
  }): void {
    const message: FullSyncMessage = {
      type: 'full_sync',
      data: {
        syncedAt: new Date().toISOString(),
        haVersion: this.haVersion,
        ...data,
      },
    };
    this.send(message);
    console.log(`📤 Sent full sync: ${data.entities.length} entities`);
  }

  sendStateBatch(changes: StateChangedEvent[]): void {
    if (changes.length === 0) return;

    const message: StateBatchMessage = {
      type: 'state_batch',
      data: {
        batchId: crypto.randomUUID(),
        batchedAt: new Date().toISOString(),
        events: changes,
        isOverflow: false,
      },
    };
    this.send(message);
  }

  sendDiagnosticLogs(logs: DiagnosticLogEntry[], diagnostics?: DiagnosticSnapshot): void {
    if (!this.authenticated) return;

    const message: BridgeLogsMessage = {
      type: 'bridge_logs',
      bridgeId: this.config.bridgeId,
      sentAt: new Date().toISOString(),
      logs,
      ...(diagnostics ? { diagnostics } : {}),
    };
    this.send(message);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendHeartbeat(): void {
    if (!this.authenticated) return;

    const message: HeartbeatMessage = {
      type: 'heartbeat',
      bridgeId: this.config.bridgeId,
      timestamp: new Date().toISOString(),
      bridgeVersion: process.env.BRIDGE_VERSION || '1.0.0',
      protocolVersion: this.config.protocolVersion,
      haVersion: this.haVersion,
      haConnected: true,
      cloudConnected: true,
      lastEventAt: this.lastEventAt?.toISOString() ?? null,
      entityCount: this.entityCount,
      reconnectCount: this.reconnectCount,
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
    };
    this.send(message);
  }

  private send(message: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max cloud reconnect attempts reached');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      60000
    );
    this.reconnectAttempts++;
    this.reconnectCount++;

    console.log(`⏳ Reconnecting to cloud in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Cloud reconnect failed:', error);
      }
    }, delay);
  }

  updateStats(haVersion: string, entityCount: number, lastEventAt: Date | null): void {
    this.haVersion = haVersion;
    this.entityCount = entityCount;
    this.lastEventAt = lastEventAt;
  }

  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.authenticated = false;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.authenticated;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }
}
