import path from 'path';
import fs from 'fs';

export interface EntityGroup {
  id: number;
  name: string;
  primaryEntityId: string;
  memberEntityIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StateHistoryEntry {
  id: number;
  entityId: string;
  state: string;
  attributes: Record<string, unknown>;
  timestamp: string;
  contextId: string | null;
}

export interface MergeHistory {
  id: number;
  action: 'create' | 'update' | 'delete';
  groupId: number;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface ILocalDatabase {
  readonly available: boolean;
  recordStateChange(entityId: string, state: string, attributes: Record<string, unknown>, contextId: string | null): void;
  getStateHistory(entityId: string, limit?: number): StateHistoryEntry[];
  getCorrelatedEntities(entityId: string, windowMs?: number): Map<string, number>;
  getEntitiesWithSameContext(limit?: number): Array<{ contextId: string; entities: string[]; count: number }>;
  createEntityGroup(name: string, primaryEntityId: string, memberEntityIds: string[]): EntityGroup;
  getEntityGroup(id: number): EntityGroup | null;
  getAllEntityGroups(): EntityGroup[];
  updateEntityGroup(id: number, updates: Partial<Pick<EntityGroup, 'name' | 'primaryEntityId' | 'memberEntityIds'>>): EntityGroup | null;
  deleteEntityGroup(id: number): boolean;
  getGroupByEntityId(entityId: string): EntityGroup | null;
  getMergeHistory(limit?: number): MergeHistory[];
  pruneOldHistory(daysToKeep?: number): number;
  close(): void;
}

class NoOpDatabase implements ILocalDatabase {
  readonly available = false;

  recordStateChange(): void {}
  getStateHistory(): StateHistoryEntry[] { return []; }
  getCorrelatedEntities(): Map<string, number> { return new Map(); }
  getEntitiesWithSameContext(): Array<{ contextId: string; entities: string[]; count: number }> { return []; }
  createEntityGroup(name: string, primaryEntityId: string, memberEntityIds: string[]): EntityGroup {
    throw new Error('SQLite not available - device merge features disabled');
  }
  getEntityGroup(): EntityGroup | null { return null; }
  getAllEntityGroups(): EntityGroup[] { return []; }
  updateEntityGroup(): EntityGroup | null { return null; }
  deleteEntityGroup(): boolean { return false; }
  getGroupByEntityId(): EntityGroup | null { return null; }
  getMergeHistory(): MergeHistory[] { return []; }
  pruneOldHistory(): number { return 0; }
  close(): void {}
}

export class LocalDatabase implements ILocalDatabase {
  private db: any;
  private dbPath: string;
  readonly available = true;

  constructor(dataDir: string, sqliteModule: any) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dbPath = path.join(dataDir, 'helm-bridge.db');
    this.db = new sqliteModule(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
  }

  private initializeTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entity_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        primary_entity_id TEXT NOT NULL,
        member_entity_ids TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS state_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id TEXT NOT NULL,
        state TEXT NOT NULL,
        attributes TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        context_id TEXT
      );

      CREATE TABLE IF NOT EXISTS merge_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        group_id INTEGER NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_state_history_entity ON state_history(entity_id);
      CREATE INDEX IF NOT EXISTS idx_state_history_timestamp ON state_history(timestamp);
      CREATE INDEX IF NOT EXISTS idx_state_history_context ON state_history(context_id);
      CREATE INDEX IF NOT EXISTS idx_entity_groups_primary ON entity_groups(primary_entity_id);
    `);

    console.log('📦 Local database initialized');
  }

  recordStateChange(
    entityId: string,
    state: string,
    attributes: Record<string, unknown>,
    contextId: string | null
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO state_history (entity_id, state, attributes, context_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(entityId, state, JSON.stringify(attributes), contextId);
  }

  getStateHistory(entityId: string, limit: number = 100): StateHistoryEntry[] {
    const stmt = this.db.prepare(`
      SELECT id, entity_id as entityId, state, attributes, timestamp, context_id as contextId
      FROM state_history
      WHERE entity_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const rows = stmt.all(entityId, limit) as any[];
    return rows.map(row => ({
      ...row,
      attributes: JSON.parse(row.attributes),
    }));
  }

  getCorrelatedEntities(entityId: string, windowMs: number = 2000): Map<string, number> {
    const stmt = this.db.prepare(`
      SELECT h2.entity_id, COUNT(*) as correlation_count
      FROM state_history h1
      JOIN state_history h2 ON h2.entity_id != h1.entity_id
        AND abs(strftime('%s', h2.timestamp) - strftime('%s', h1.timestamp)) * 1000 <= ?
      WHERE h1.entity_id = ?
      GROUP BY h2.entity_id
      ORDER BY correlation_count DESC
      LIMIT 20
    `);
    const rows = stmt.all(windowMs, entityId) as Array<{ entity_id: string; correlation_count: number }>;
    
    const correlations = new Map<string, number>();
    rows.forEach(row => correlations.set(row.entity_id, row.correlation_count));
    return correlations;
  }

  getEntitiesWithSameContext(limit: number = 100): Array<{ contextId: string; entities: string[]; count: number }> {
    const stmt = this.db.prepare(`
      SELECT context_id, GROUP_CONCAT(DISTINCT entity_id) as entities, COUNT(DISTINCT entity_id) as count
      FROM state_history
      WHERE context_id IS NOT NULL
      GROUP BY context_id
      HAVING COUNT(DISTINCT entity_id) > 1
      ORDER BY count DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit) as Array<{ context_id: string; entities: string; count: number }>;
    return rows.map(row => ({
      contextId: row.context_id,
      entities: row.entities.split(','),
      count: row.count,
    }));
  }

  createEntityGroup(name: string, primaryEntityId: string, memberEntityIds: string[]): EntityGroup {
    const stmt = this.db.prepare(`
      INSERT INTO entity_groups (name, primary_entity_id, member_entity_ids)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name, primaryEntityId, JSON.stringify(memberEntityIds));
    
    const group = this.getEntityGroup(result.lastInsertRowid as number)!;
    
    this.logMergeHistory('create', group.id, { name, primaryEntityId, memberEntityIds });
    
    return group;
  }

  getEntityGroup(id: number): EntityGroup | null {
    const stmt = this.db.prepare(`
      SELECT id, name, primary_entity_id as primaryEntityId, member_entity_ids as memberEntityIds,
             created_at as createdAt, updated_at as updatedAt
      FROM entity_groups
      WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      memberEntityIds: JSON.parse(row.memberEntityIds),
    };
  }

  getAllEntityGroups(): EntityGroup[] {
    const stmt = this.db.prepare(`
      SELECT id, name, primary_entity_id as primaryEntityId, member_entity_ids as memberEntityIds,
             created_at as createdAt, updated_at as updatedAt
      FROM entity_groups
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      memberEntityIds: JSON.parse(row.memberEntityIds),
    }));
  }

  updateEntityGroup(id: number, updates: Partial<Pick<EntityGroup, 'name' | 'primaryEntityId' | 'memberEntityIds'>>): EntityGroup | null {
    const current = this.getEntityGroup(id);
    if (!current) return null;

    const name = updates.name ?? current.name;
    const primaryEntityId = updates.primaryEntityId ?? current.primaryEntityId;
    const memberEntityIds = updates.memberEntityIds ?? current.memberEntityIds;

    const stmt = this.db.prepare(`
      UPDATE entity_groups
      SET name = ?, primary_entity_id = ?, member_entity_ids = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(name, primaryEntityId, JSON.stringify(memberEntityIds), id);
    
    const group = this.getEntityGroup(id)!;
    this.logMergeHistory('update', id, updates);
    
    return group;
  }

  deleteEntityGroup(id: number): boolean {
    const group = this.getEntityGroup(id);
    if (!group) return false;

    const stmt = this.db.prepare(`DELETE FROM entity_groups WHERE id = ?`);
    stmt.run(id);
    
    this.logMergeHistory('delete', id, { deletedGroup: group });
    
    return true;
  }

  getGroupByEntityId(entityId: string): EntityGroup | null {
    const stmt = this.db.prepare(`
      SELECT id, name, primary_entity_id as primaryEntityId, member_entity_ids as memberEntityIds,
             created_at as createdAt, updated_at as updatedAt
      FROM entity_groups
      WHERE primary_entity_id = ? OR member_entity_ids LIKE ?
    `);
    const row = stmt.get(entityId, `%"${entityId}"%`) as any;
    if (!row) return null;
    
    return {
      ...row,
      memberEntityIds: JSON.parse(row.memberEntityIds),
    };
  }

  private logMergeHistory(action: 'create' | 'update' | 'delete', groupId: number, details: Record<string, unknown>): void {
    const stmt = this.db.prepare(`
      INSERT INTO merge_history (action, group_id, details)
      VALUES (?, ?, ?)
    `);
    stmt.run(action, groupId, JSON.stringify(details));
  }

  getMergeHistory(limit: number = 50): MergeHistory[] {
    const stmt = this.db.prepare(`
      SELECT id, action, group_id as groupId, details, timestamp
      FROM merge_history
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    return rows.map(row => ({
      ...row,
      details: JSON.parse(row.details),
    }));
  }

  pruneOldHistory(daysToKeep: number = 30): number {
    const stmt = this.db.prepare(`
      DELETE FROM state_history
      WHERE timestamp < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(daysToKeep);
    return result.changes;
  }

  close(): void {
    this.db.close();
  }
}

export function createLocalDatabase(dataDir: string): ILocalDatabase {
  try {
    const Database = require('better-sqlite3');
    const db = new LocalDatabase(dataDir, Database);
    console.log('✅ SQLite loaded - device merge features enabled');
    return db;
  } catch (error) {
    console.warn('⚠️ better-sqlite3 not available - device merge features disabled');
    console.warn('   Core bridge features (pairing, cloud sync, device control) will work normally.');
    return new NoOpDatabase();
  }
}
