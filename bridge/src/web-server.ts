import express, { Request, Response, Router, NextFunction } from 'express';
import path from 'path';
import { type ILocalDatabase, type EntityGroup } from './local-db';
import { DuplicateDetector, HAEntityInfo, HADeviceInfo, HAAreaInfo, DuplicateSuggestion } from './duplicate-detector';
import { HAWebSocketClient } from './ha-ws-client';
import type { PairingInfo, BridgeStatusInfo } from './types';

export interface WebServerConfig {
  port: number;
  db: ILocalDatabase;
  wsClient: HAWebSocketClient;
  ingressToken?: string;
  getPairingInfo?: () => PairingInfo;
  getBridgeState?: () => BridgeStatusInfo;
}

export class WebServer {
  private app: express.Application;
  private db: ILocalDatabase;
  private wsClient: HAWebSocketClient;
  private detector: DuplicateDetector;
  private port: number;
  private ingressToken: string | null;
  private getPairingInfo: (() => PairingInfo) | null;
  private getBridgeState: (() => BridgeStatusInfo) | null;
  private cachedEntities: HAEntityInfo[] = [];
  private cachedDevices: HADeviceInfo[] = [];
  private cachedAreas: HAAreaInfo[] = [];
  private _isListening = false;

  constructor(config: WebServerConfig) {
    this.app = express();
    this.db = config.db;
    this.wsClient = config.wsClient;
    this.detector = new DuplicateDetector(this.db);
    this.port = config.port;
    this.ingressToken = config.ingressToken || process.env.SUPERVISOR_TOKEN || null;
    this.getPairingInfo = config.getPairingInfo || null;
    this.getBridgeState = config.getBridgeState || null;

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    const allowedOrigins = [
      'http://supervisor/core',
      'http://homeassistant.local:8123',
      'http://localhost:8123',
      /^https?:\/\/[a-z0-9-]+\.local(:\d+)?$/i,
      /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
      /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/,
    ];

    this.app.use((req, res, next) => {
      const origin = req.get('origin') || '';
      const referer = req.get('referer') || '';
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed || referer.startsWith(allowed);
        }
        return allowed.test(origin) || allowed.test(referer);
      });

      if (isAllowed || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, X-Ingress-Path, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    this.app.use('/api', (req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/health') {
        return next();
      }

      const ingressPath = req.get('X-Ingress-Path');
      const authHeader = req.get('Authorization');
      const referer = req.get('referer') || '';
      
      const isFromHA = 
        ingressPath !== undefined ||
        referer.includes('/hassio/ingress/') ||
        referer.includes('homeassistant') ||
        req.ip === '127.0.0.1' ||
        req.ip === '::1';

      if (!isFromHA) {
        return res.status(403).json({ error: 'Access denied. Use Home Assistant ingress.' });
      }

      next();
    });
  }

  private setupRoutes(): void {
    const api = Router();

    api.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        wsConnected: this.wsClient.isConnected(),
      });
    });

    api.get('/devices', async (req, res) => {
      try {
        await this.refreshCache();
        
        const groups = this.db.getAllEntityGroups();
        const groupedEntityIds = new Set<string>();
        groups.forEach(g => {
          groupedEntityIds.add(g.primaryEntityId);
          g.memberEntityIds.forEach(id => groupedEntityIds.add(id));
        });

        const devices = this.cachedEntities.map(entity => ({
          ...entity,
          isGrouped: groupedEntityIds.has(entity.entityId),
          group: groups.find(g => 
            g.primaryEntityId === entity.entityId || 
            g.memberEntityIds.includes(entity.entityId)
          ) || null,
        }));

        res.json({
          entities: devices,
          devices: this.cachedDevices,
          areas: this.cachedAreas,
          groups,
        });
      } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ error: 'Failed to fetch devices' });
      }
    });

    api.get('/duplicates', async (req, res) => {
      try {
        await this.refreshCache();
        
        const suggestions = this.detector.detectDuplicates(
          this.cachedEntities,
          this.cachedDevices,
          this.cachedAreas
        );

        res.json({
          suggestions,
          totalEntities: this.cachedEntities.length,
          totalSuggestions: suggestions.length,
        });
      } catch (error) {
        console.error('Error detecting duplicates:', error);
        res.status(500).json({ error: 'Failed to detect duplicates' });
      }
    });

    api.get('/groups', (req, res) => {
      try {
        const groups = this.db.getAllEntityGroups();
        res.json({ groups });
      } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
      }
    });

    api.get('/groups/:id', (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const group = this.db.getEntityGroup(id);
        
        if (!group) {
          return res.status(404).json({ error: 'Group not found' });
        }

        const entities = this.cachedEntities.filter(e =>
          e.entityId === group.primaryEntityId ||
          group.memberEntityIds.includes(e.entityId)
        );

        res.json({ group, entities });
      } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ error: 'Failed to fetch group' });
      }
    });

    api.post('/groups', (req, res) => {
      try {
        const { name, primaryEntityId, memberEntityIds } = req.body;

        if (!name || !primaryEntityId || !Array.isArray(memberEntityIds)) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingGroup = this.db.getGroupByEntityId(primaryEntityId);
        if (existingGroup) {
          return res.status(400).json({ error: 'Primary entity is already in a group' });
        }

        for (const entityId of memberEntityIds) {
          const existing = this.db.getGroupByEntityId(entityId);
          if (existing) {
            return res.status(400).json({ error: `Entity ${entityId} is already in a group` });
          }
        }

        const group = this.db.createEntityGroup(name, primaryEntityId, memberEntityIds);
        console.log(`📦 Created entity group: ${name} (${memberEntityIds.length + 1} entities)`);
        
        res.json({ success: true, group });
      } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
      }
    });

    api.put('/groups/:id', (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const updates = req.body;

        const currentGroup = this.db.getEntityGroup(id);
        if (!currentGroup) {
          return res.status(404).json({ error: 'Group not found' });
        }

        if (updates.primaryEntityId && updates.primaryEntityId !== currentGroup.primaryEntityId) {
          const existingGroup = this.db.getGroupByEntityId(updates.primaryEntityId);
          if (existingGroup && existingGroup.id !== id) {
            return res.status(400).json({ error: 'Primary entity is already in another group' });
          }
        }

        if (updates.memberEntityIds) {
          for (const entityId of updates.memberEntityIds) {
            if (entityId === currentGroup.primaryEntityId) continue;
            if (currentGroup.memberEntityIds.includes(entityId)) continue;
            
            const existing = this.db.getGroupByEntityId(entityId);
            if (existing && existing.id !== id) {
              return res.status(400).json({ error: `Entity ${entityId} is already in another group` });
            }
          }
        }

        const group = this.db.updateEntityGroup(id, updates);
        
        if (!group) {
          return res.status(404).json({ error: 'Group not found' });
        }

        console.log(`📦 Updated entity group: ${group.name}`);
        res.json({ success: true, group });
      } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Failed to update group' });
      }
    });

    api.delete('/groups/:id', (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const deleted = this.db.deleteEntityGroup(id);
        
        if (!deleted) {
          return res.status(404).json({ error: 'Group not found' });
        }

        console.log(`🗑️ Deleted entity group ${id}`);
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Failed to delete group' });
      }
    });

    api.post('/groups/:id/control', async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const { action, serviceData } = req.body;

        const group = this.db.getEntityGroup(id);
        if (!group) {
          return res.status(404).json({ error: 'Group not found' });
        }

        const primaryEntity = this.cachedEntities.find(e => e.entityId === group.primaryEntityId);
        if (!primaryEntity) {
          return res.status(404).json({ error: 'Primary entity not found' });
        }

        const domain = primaryEntity.domain;
        const service = action || 'toggle';

        await this.wsClient.callService(domain, service, {
          entity_id: group.primaryEntityId,
          ...serviceData,
        });

        console.log(`🎮 Controlled group ${group.name}: ${domain}.${service}`);
        res.json({ success: true });
      } catch (error) {
        console.error('Error controlling group:', error);
        res.status(500).json({ error: 'Failed to control group' });
      }
    });

    api.get('/history', (req, res) => {
      try {
        const history = this.db.getMergeHistory(50);
        res.json({ history });
      } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
      }
    });

    api.get('/correlations/:entityId', (req, res) => {
      try {
        const { entityId } = req.params;
        const windowMs = parseInt(req.query.window as string) || 2000;
        
        const correlations = this.db.getCorrelatedEntities(entityId, windowMs);
        const result = Array.from(correlations.entries()).map(([id, count]) => ({
          entityId: id,
          correlationCount: count,
          entity: this.cachedEntities.find(e => e.entityId === id) || null,
        }));

        res.json({ entityId, correlations: result });
      } catch (error) {
        console.error('Error fetching correlations:', error);
        res.status(500).json({ error: 'Failed to fetch correlations' });
      }
    });

    api.post('/refresh', async (req, res) => {
      try {
        await this.refreshCache(true);
        res.json({ success: true, entityCount: this.cachedEntities.length });
      } catch (error) {
        console.error('Error refreshing cache:', error);
        res.status(500).json({ error: 'Failed to refresh cache' });
      }
    });

    api.get('/pairing', (req, res) => {
      if (this.getPairingInfo) {
        res.json(this.getPairingInfo());
      } else {
        res.json({ status: 'unknown', code: null, expiresAt: null, error: null, cloudUrl: '' });
      }
    });

    api.get('/bridge-status', (req, res) => {
      if (this.getBridgeState) {
        res.json(this.getBridgeState());
      } else {
        res.json({ haConnected: false, cloudConnected: false, isPaired: false, entityCount: 0, bridgeId: '', uptime: 0 });
      }
    });

    this.app.use('/api', api);

    const publicDir = path.join(__dirname, '../public');
    this.app.use(express.static(publicDir));

    const fs = require('fs');
    const htmlPath = path.join(publicDir, 'index.html');
    const htmlTemplate = fs.readFileSync(htmlPath, 'utf-8');

    this.app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        const rawIngress = req.get('X-Ingress-Path') || '';
        const ingressPath = /^\/api\/hassio_ingress\/[a-zA-Z0-9_-]+$/.test(rawIngress) ? rawIngress : '';
        const safeValue = JSON.stringify(ingressPath);
        const html = htmlTemplate.replace(
          'const INGRESS_PATH = window.__INGRESS_PATH || \'\';',
          `const INGRESS_PATH = ${safeValue};`
        );
        res.type('html').send(html);
      }
    });
  }

  private async refreshCache(force: boolean = false): Promise<void> {
    if (!force && this.cachedEntities.length > 0) {
      return;
    }

    if (!this.wsClient.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const [statesRaw, devicesRaw, areasRaw, entityRegistryRaw] = await Promise.all([
      this.wsClient.getStates(),
      this.wsClient.getDevices(),
      this.wsClient.getAreas(),
      this.wsClient.getEntities(),
    ]);

    const entityRegistry = new Map(
      (entityRegistryRaw as any[]).map(e => [e.entity_id, e])
    );

    this.cachedEntities = (statesRaw as any[]).map(state => {
      const registry = entityRegistry.get(state.entity_id) as any;
      return {
        entityId: state.entity_id,
        domain: state.entity_id.split('.')[0],
        friendlyName: state.attributes?.friendly_name || null,
        deviceId: registry?.device_id || null,
        areaId: registry?.area_id || null,
        state: state.state,
        attributes: state.attributes || {},
      };
    });

    this.cachedDevices = (devicesRaw as any[]).map(device => ({
      id: device.id,
      name: device.name_by_user || device.name || null,
      manufacturer: device.manufacturer || null,
      model: device.model || null,
      areaId: device.area_id || null,
    }));

    this.cachedAreas = (areasRaw as any[]).map(area => ({
      id: area.area_id,
      name: area.name,
    }));

    console.log(`🔄 Cache refreshed: ${this.cachedEntities.length} entities, ${this.cachedDevices.length} devices, ${this.cachedAreas.length} areas`);
  }

  updateCachedEntity(entityId: string, state: string, attributes: Record<string, unknown>): void {
    const index = this.cachedEntities.findIndex(e => e.entityId === entityId);
    if (index >= 0) {
      this.cachedEntities[index] = {
        ...this.cachedEntities[index],
        state,
        attributes,
      };
    }
  }

  get isListening(): boolean {
    return this._isListening;
  }

  start(): void {
    const server = this.app.listen(this.port, '0.0.0.0', () => {
      this._isListening = true;
      console.log(`🌐 Web UI available at http://localhost:${this.port}`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      this._isListening = false;
      console.error(`❌ Web server failed to start on port ${this.port}: ${err.message}`, {
        code: err.code,
        port: this.port,
      });
    });
  }
}
