import WebSocket from 'ws';
import { BridgeConfig } from './config';
import { HAState } from './ha-rest-client';
import { EventEmitter } from 'events';

export interface HAWebSocketMessage {
  id?: number;
  type: string;
  success?: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
  };
  event?: unknown;
  message?: string;
  [key: string]: unknown;
}

export interface HAStateChangedEvent {
  event_type: 'state_changed';
  data: {
    entity_id: string;
    old_state: HAState | null;
    new_state: HAState | null;
  };
  origin: string;
  time_fired: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HAWSClientEvents {
  connected: () => void;
  disconnected: (code: number, reason: string) => void;
  error: (error: Error) => void;
  state_changed: (event: HAStateChangedEvent) => void;
  authenticated: () => void;
  auth_failed: (message: string) => void;
}

export class HAWebSocketClient extends EventEmitter {
  private config: BridgeConfig;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private authenticated = false;
  private eventSubscriptionId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private shouldReconnect = true;
  private pendingResponses = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }>();

  constructor(config: BridgeConfig) {
    super();
    this.config = config;
  }

  private getWebSocketUrl(): string {
    const httpUrl = this.config.haUrl;
    const wsUrl = httpUrl.replace(/^http/, 'ws');
    
    // For Supervisor environment (http://supervisor/core), use /websocket
    // For direct HA access (http://host:8123), use /api/websocket
    if (httpUrl.includes('supervisor/core') || httpUrl.includes('supervisor:80/core')) {
      return `${wsUrl}/websocket`;
    }
    return `${wsUrl}/api/websocket`;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWebSocketUrl();
        console.log('🔌 Connecting to HA WebSocket:', url);
        
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
          console.log('📡 HA WebSocket connected');
          this.reconnectAttempts = 0;
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString()) as HAWebSocketMessage;
            this.handleMessage(message, resolve, reject);
          } catch (error) {
            console.error('Failed to parse HA WebSocket message:', error);
          }
        });

        this.ws.on('close', (code, reason) => {
          console.log(`🔌 HA WebSocket closed: ${code} - ${reason.toString()}`);
          this.authenticated = false;
          this.eventSubscriptionId = null;
          this.emit('disconnected', code, reason.toString());
          
          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        });

        this.ws.on('error', (error) => {
          console.error('❌ HA WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(
    message: HAWebSocketMessage,
    connectResolve?: (value: void) => void,
    connectReject?: (error: Error) => void
  ): void {
    switch (message.type) {
      case 'auth_required':
        this.sendAuth();
        break;

      case 'auth_ok':
        console.log('✅ HA WebSocket authenticated');
        this.authenticated = true;
        this.emit('authenticated');
        this.subscribeToEvents();
        if (connectResolve) connectResolve();
        break;

      case 'auth_invalid':
        const authError = new Error(`HA auth failed: ${message.message}`);
        console.error('❌ HA WebSocket auth failed:', message.message);
        this.emit('auth_failed', message.message as string);
        if (connectReject) connectReject(authError);
        break;

      case 'event':
        this.handleEvent(message);
        break;

      case 'result':
        this.handleResult(message);
        break;

      default:
        break;
    }
  }

  private sendAuth(): void {
    this.send({
      type: 'auth',
      access_token: this.config.haToken,
    });
  }

  private async subscribeToEvents(): Promise<void> {
    const id = this.getNextId();
    this.eventSubscriptionId = id;
    
    this.send({
      id,
      type: 'subscribe_events',
      event_type: 'state_changed',
    });
    
    console.log('📭 Subscribed to state_changed events');
  }

  private handleEvent(message: HAWebSocketMessage): void {
    const event = message.event as HAStateChangedEvent;
    if (event && event.event_type === 'state_changed') {
      this.emit('state_changed', event);
    }
  }

  private handleResult(message: HAWebSocketMessage): void {
    const id = message.id;
    if (id && this.pendingResponses.has(id)) {
      const { resolve, reject } = this.pendingResponses.get(id)!;
      this.pendingResponses.delete(id);
      
      if (message.success) {
        resolve(message.result);
      } else {
        reject(new Error(message.error?.message as string || 'Unknown error'));
      }
    }
  }

  private getNextId(): number {
    return this.messageId++;
  }

  private send(message: HAWebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  async sendCommand<T>(type: string, data: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.authenticated) {
        reject(new Error('Not authenticated'));
        return;
      }

      const id = this.getNextId();
      this.pendingResponses.set(id, { 
        resolve: resolve as (value: unknown) => void, 
        reject 
      });

      this.send({
        id,
        type,
        ...data,
      });

      setTimeout(() => {
        if (this.pendingResponses.has(id)) {
          this.pendingResponses.delete(id);
          reject(new Error('Command timeout'));
        }
      }, 30000);
    });
  }

  async callService(domain: string, service: string, serviceData: Record<string, unknown> = {}): Promise<unknown> {
    return this.sendCommand('call_service', {
      domain,
      service,
      service_data: serviceData,
    });
  }

  async getAreas(): Promise<unknown[]> {
    return this.sendCommand<unknown[]>('config/area_registry/list');
  }

  async getDevices(): Promise<unknown[]> {
    return this.sendCommand<unknown[]>('config/device_registry/list');
  }

  async getEntities(): Promise<unknown[]> {
    return this.sendCommand<unknown[]>('config/entity_registry/list');
  }

  async getStates(): Promise<unknown[]> {
    return this.sendCommand<unknown[]>('get_states');
  }

  async getServices(): Promise<Record<string, unknown>> {
    return this.sendCommand<Record<string, unknown>>('get_services');
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;

    console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnect failed:', error);
      }
    }, delay);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.authenticated = false;
    this.pendingResponses.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.authenticated;
  }
}
