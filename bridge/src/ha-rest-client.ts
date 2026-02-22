import { BridgeConfig } from './config';
import type { HAArea, HADevice, HAEntity, HAService } from '../../packages/protocol/src/entities';

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HAConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  location_name: string;
  time_zone: string;
  components: string[];
  config_dir: string;
  version: string;
  state: string;
}

export interface HAAreaRegistry {
  area_id: string;
  name: string;
  picture: string | null;
  aliases: string[];
  floor_id: string | null;
  icon: string | null;
  labels: string[];
}

export interface HADeviceRegistry {
  id: string;
  name: string | null;
  name_by_user: string | null;
  manufacturer: string | null;
  model: string | null;
  model_id: string | null;
  area_id: string | null;
  identifiers: Array<[string, string]>;
  connections: Array<[string, string]>;
  sw_version: string | null;
  hw_version: string | null;
  configuration_url: string | null;
  disabled_by: string | null;
  entry_type: string | null;
  via_device_id: string | null;
}

export interface HAEntityRegistry {
  entity_id: string;
  name: string | null;
  icon: string | null;
  platform: string;
  device_id: string | null;
  area_id: string | null;
  disabled_by: string | null;
  hidden_by: string | null;
  unique_id: string;
  translation_key: string | null;
  options: Record<string, unknown> | null;
  categories: Record<string, string>;
  labels: string[];
}

export interface HAServiceDomain {
  domain: string;
  services: Record<string, {
    name: string;
    description: string;
    fields: Record<string, {
      name?: string;
      description?: string;
      required?: boolean;
      example?: unknown;
      selector?: unknown;
    }>;
    target?: {
      entity?: { domain?: string[] };
      device?: { integration?: string[] };
      area?: Record<string, unknown>;
    };
  }>;
}

export class HARestClient {
  private config: BridgeConfig;
  private haVersion: string = 'unknown';

  constructor(config: BridgeConfig) {
    this.config = config;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.haUrl}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.config.haToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HA API error: ${response.status} ${response.statusText} - ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async getConfig(): Promise<HAConfig> {
    const config = await this.request<HAConfig>('/api/config');
    this.haVersion = config.version;
    return config;
  }

  async getVersion(): Promise<string> {
    if (this.haVersion === 'unknown') {
      const config = await this.getConfig();
      return config.version;
    }
    return this.haVersion;
  }

  async getStates(): Promise<HAState[]> {
    return this.request<HAState[]>('/api/states');
  }

  async getState(entityId: string): Promise<HAState> {
    return this.request<HAState>(`/api/states/${entityId}`);
  }

  async getServices(): Promise<HAServiceDomain[]> {
    return this.request<HAServiceDomain[]>('/api/services');
  }

  async callService(domain: string, service: string, data: {
    entity_id?: string | string[];
    [key: string]: unknown;
  }): Promise<HAState[]> {
    return this.request<HAState[]>(`/api/services/${domain}/${service}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.getConfig();
      return true;
    } catch (error) {
      console.error('HA connection check failed:', error);
      return false;
    }
  }

  mapAreaToProtocol(area: Partial<HAAreaRegistry> & { area_id: string; name: string }): HAArea {
    return {
      id: area.area_id,
      name: area.name,
      picture: area.picture ?? undefined,
    };
  }

  mapDeviceToProtocol(device: Partial<HADeviceRegistry> & { id: string }): HADevice {
    return {
      id: device.id,
      name: device.name_by_user || device.name || null,
      manufacturer: device.manufacturer ?? null,
      model: device.model ?? null,
      areaId: device.area_id ?? null,
      identifiers: device.identifiers ?? [],
      swVersion: device.sw_version ?? null,
      hwVersion: device.hw_version ?? null,
      configurationUrl: device.configuration_url ?? null,
    };
  }

  mapStateToProtocol(state: Partial<HAState> & { entity_id: string; state: string }, entityRegistry?: Partial<HAEntityRegistry>): HAEntity {
    const domain = state.entity_id.split('.')[0];
    return {
      entityId: state.entity_id,
      domain,
      friendlyName: (state.attributes?.friendly_name as string) ?? null,
      deviceId: entityRegistry?.device_id ?? null,
      areaId: entityRegistry?.area_id ?? null,
      state: state.state,
      attributes: state.attributes ?? {},
      lastChanged: state.last_changed ?? new Date().toISOString(),
      lastUpdated: state.last_updated ?? new Date().toISOString(),
    };
  }

  mapServiceToProtocol(serviceDomain: { domain: string; services?: unknown }): HAService {
    return {
      domain: serviceDomain.domain,
      services: (serviceDomain.services ?? {}) as any,
    };
  }
}
