import { type ILocalDatabase, type EntityGroup } from './local-db';

export interface HAEntityInfo {
  entityId: string;
  domain: string;
  friendlyName: string | null;
  deviceId: string | null;
  areaId: string | null;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HADeviceInfo {
  id: string;
  name: string | null;
  manufacturer: string | null;
  model: string | null;
  areaId: string | null;
}

export interface HAAreaInfo {
  id: string;
  name: string;
}

export interface DuplicateSuggestion {
  entities: HAEntityInfo[];
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  suggestedName: string;
  suggestedPrimary: string;
}

export class DuplicateDetector {
  private db: ILocalDatabase;

  constructor(db: ILocalDatabase) {
    this.db = db;
  }

  detectDuplicates(
    entities: HAEntityInfo[],
    devices: HADeviceInfo[],
    areas: HAAreaInfo[]
  ): DuplicateSuggestion[] {
    const suggestions: DuplicateSuggestion[] = [];
    const processedEntityIds = new Set<string>();
    const existingGroups = this.db.getAllEntityGroups();
    const groupedEntityIds = new Set<string>();
    
    existingGroups.forEach(group => {
      groupedEntityIds.add(group.primaryEntityId);
      group.memberEntityIds.forEach(id => groupedEntityIds.add(id));
    });

    const deviceMap = new Map(devices.map(d => [d.id, d]));
    const areaMap = new Map(areas.map(a => [a.id, a]));

    const lightEntities = entities.filter(e => 
      (e.domain === 'light' || e.domain === 'switch') && 
      !groupedEntityIds.has(e.entityId)
    );

    for (const entity of lightEntities) {
      if (processedEntityIds.has(entity.entityId)) continue;

      const candidates = this.findCandidates(entity, lightEntities, deviceMap, areaMap);
      
      if (candidates.length > 0) {
        const allEntities = [entity, ...candidates];
        const reasons: string[] = [];
        let confidence: 'high' | 'medium' | 'low' = 'low';

        const nameMatch = this.checkNameSimilarity(allEntities);
        if (nameMatch.similar) {
          reasons.push(`Similar names: ${nameMatch.commonPart}`);
          confidence = nameMatch.confidence === 'high' ? 'high' : 'medium';
        }

        const historyCorrelation = this.checkHistoryCorrelation(allEntities);
        if (historyCorrelation.correlated) {
          reasons.push(`State changes together (${historyCorrelation.correlationScore}% correlation)`);
          if (historyCorrelation.correlationScore > 80) {
            confidence = 'high';
          } else if (confidence !== 'high') {
            confidence = 'medium';
          }
        }

        const sameArea = this.checkSameArea(allEntities, areaMap);
        if (sameArea) {
          reasons.push(`Same room: ${sameArea}`);
        }

        const sameDevice = this.checkSameDevice(allEntities, deviceMap);
        if (sameDevice) {
          reasons.push(`Same physical device: ${sameDevice}`);
          confidence = 'high';
        }

        if (reasons.length > 0) {
          allEntities.forEach(e => processedEntityIds.add(e.entityId));
          
          suggestions.push({
            entities: allEntities,
            confidence,
            reasons,
            suggestedName: this.suggestGroupName(allEntities, deviceMap, areaMap),
            suggestedPrimary: this.suggestPrimaryEntity(allEntities),
          });
        }
      }
    }

    return suggestions.sort((a, b) => {
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    });
  }

  private findCandidates(
    entity: HAEntityInfo,
    allEntities: HAEntityInfo[],
    deviceMap: Map<string, HADeviceInfo>,
    areaMap: Map<string, HAAreaInfo>
  ): HAEntityInfo[] {
    const candidates: HAEntityInfo[] = [];
    const entityName = this.normalizeName(entity.friendlyName || entity.entityId);

    for (const other of allEntities) {
      if (other.entityId === entity.entityId) continue;

      const otherName = this.normalizeName(other.friendlyName || other.entityId);
      
      if (this.stringSimilarity(entityName, otherName) > 0.6) {
        candidates.push(other);
        continue;
      }

      if (entity.areaId && entity.areaId === other.areaId) {
        const nameWords = entityName.split(/\s+/);
        const otherWords = otherName.split(/\s+/);
        const commonWords = nameWords.filter(w => otherWords.includes(w));
        
        if (commonWords.length > 0 && commonWords.some(w => w.length > 3)) {
          candidates.push(other);
          continue;
        }
      }

      if (entity.deviceId && entity.deviceId === other.deviceId) {
        candidates.push(other);
        continue;
      }
    }

    return candidates;
  }

  private checkNameSimilarity(entities: HAEntityInfo[]): { similar: boolean; commonPart: string; confidence: 'high' | 'medium' | 'low' } {
    const names = entities.map(e => this.normalizeName(e.friendlyName || e.entityId));
    
    const words = names.map(n => n.split(/\s+/));
    const commonWords = words[0].filter(word => 
      word.length > 2 && words.every(w => w.includes(word))
    );

    if (commonWords.length > 0) {
      const commonPart = commonWords.join(' ');
      const avgSimilarity = this.averagePairwiseSimilarity(names);
      
      return {
        similar: true,
        commonPart,
        confidence: avgSimilarity > 0.8 ? 'high' : avgSimilarity > 0.5 ? 'medium' : 'low',
      };
    }

    return { similar: false, commonPart: '', confidence: 'low' };
  }

  private checkHistoryCorrelation(entities: HAEntityInfo[]): { correlated: boolean; correlationScore: number } {
    if (entities.length < 2) return { correlated: false, correlationScore: 0 };

    const correlationScores: number[] = [];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const correlationsA = this.db.getCorrelatedEntities(entities[i].entityId, 2000);
        const correlationsB = this.db.getCorrelatedEntities(entities[j].entityId, 2000);
        
        const scoreAB = correlationsA.get(entities[j].entityId) || 0;
        const scoreBA = correlationsB.get(entities[i].entityId) || 0;
        
        const avgScore = (scoreAB + scoreBA) / 2;
        
        const historyA = this.db.getStateHistory(entities[i].entityId, 1);
        const historyB = this.db.getStateHistory(entities[j].entityId, 1);
        const totalEventsA = historyA.length > 0 ? Math.max(1, this.db.getStateHistory(entities[i].entityId, 1000).length) : 1;
        const totalEventsB = historyB.length > 0 ? Math.max(1, this.db.getStateHistory(entities[j].entityId, 1000).length) : 1;
        
        const minEvents = Math.min(totalEventsA, totalEventsB);
        const normalizedScore = minEvents > 5 ? Math.min(100, Math.round((avgScore / minEvents) * 100)) : 0;
        
        correlationScores.push(normalizedScore);
      }
    }

    if (correlationScores.length === 0) return { correlated: false, correlationScore: 0 };

    const avgCorrelation = Math.round(correlationScores.reduce((a, b) => a + b, 0) / correlationScores.length);

    return {
      correlated: avgCorrelation > 15,
      correlationScore: avgCorrelation,
    };
  }

  private checkSameArea(entities: HAEntityInfo[], areaMap: Map<string, HAAreaInfo>): string | null {
    const areaIds = entities.map(e => e.areaId).filter(Boolean);
    if (areaIds.length < 2) return null;
    
    const allSameArea = areaIds.every(id => id === areaIds[0]);
    if (allSameArea && areaIds[0]) {
      const area = areaMap.get(areaIds[0]);
      return area?.name || null;
    }
    
    return null;
  }

  private checkSameDevice(entities: HAEntityInfo[], deviceMap: Map<string, HADeviceInfo>): string | null {
    const deviceIds = entities.map(e => e.deviceId).filter(Boolean);
    if (deviceIds.length < 2) return null;
    
    const allSameDevice = deviceIds.every(id => id === deviceIds[0]);
    if (allSameDevice && deviceIds[0]) {
      const device = deviceMap.get(deviceIds[0]);
      return device?.name || null;
    }
    
    return null;
  }

  private suggestGroupName(
    entities: HAEntityInfo[],
    deviceMap: Map<string, HADeviceInfo>,
    areaMap: Map<string, HAAreaInfo>
  ): string {
    const deviceId = entities.find(e => e.deviceId)?.deviceId;
    if (deviceId) {
      const device = deviceMap.get(deviceId);
      if (device?.name) return device.name;
    }

    const names = entities.map(e => this.normalizeName(e.friendlyName || e.entityId));
    const words = names.map(n => n.split(/\s+/));
    const commonWords = words[0].filter(word => 
      word.length > 2 && words.every(w => w.includes(word))
    );
    
    if (commonWords.length > 0) {
      return commonWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const areaId = entities.find(e => e.areaId)?.areaId;
    if (areaId) {
      const area = areaMap.get(areaId);
      if (area) {
        return `${area.name} Light`;
      }
    }

    return entities[0].friendlyName || entities[0].entityId.split('.')[1];
  }

  private suggestPrimaryEntity(entities: HAEntityInfo[]): string {
    const lightEntities = entities.filter(e => e.domain === 'light');
    if (lightEntities.length > 0) {
      const withBrightness = lightEntities.find(e => 
        e.attributes && typeof e.attributes['brightness'] !== 'undefined'
      );
      if (withBrightness) return withBrightness.entityId;
      
      const withColor = lightEntities.find(e =>
        e.attributes && (
          typeof e.attributes['rgb_color'] !== 'undefined' ||
          typeof e.attributes['hs_color'] !== 'undefined' ||
          typeof e.attributes['color_temp'] !== 'undefined'
        )
      );
      if (withColor) return withColor.entityId;
      
      return lightEntities[0].entityId;
    }

    return entities[0].entityId;
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private stringSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    const longerLength = longer.length;
    
    if (longerLength === 0) return 1;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longerLength - distance) / longerLength;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  private averagePairwiseSimilarity(names: string[]): number {
    if (names.length < 2) return 1;
    
    let totalSimilarity = 0;
    let pairs = 0;
    
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        totalSimilarity += this.stringSimilarity(names[i], names[j]);
        pairs++;
      }
    }
    
    return pairs > 0 ? totalSimilarity / pairs : 0;
  }
}
