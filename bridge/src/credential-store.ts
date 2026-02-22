import * as fs from 'fs';
import * as path from 'path';

export interface StoredCredentials {
  bridgeId: string;
  bridgeCredential: string;
  tenantId: string;
  pairedAt?: string;
  cloudUrl?: string;
}

export class CredentialStore {
  private filePath: string;
  private credentials: StoredCredentials | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        this.credentials = JSON.parse(data);
        console.log('📂 Loaded credentials from', this.filePath);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
      this.credentials = null;
    }
  }

  save(credentials: StoredCredentials): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }
      
      fs.writeFileSync(this.filePath, JSON.stringify(credentials, null, 2), { mode: 0o600 });
      this.credentials = credentials;
      console.log('💾 Saved credentials to', this.filePath);
    } catch (error) {
      console.error('Failed to save credentials:', error);
      throw error;
    }
  }

  get(): StoredCredentials | null {
    return this.credentials;
  }

  isPaired(): boolean {
    return this.credentials !== null && !!this.credentials.bridgeCredential;
  }

  clear(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
      this.credentials = null;
      console.log('🗑️ Cleared credentials');
    } catch (error) {
      console.error('Failed to clear credentials:', error);
      throw error;
    }
  }

  getTenantId(): string | null {
    return this.credentials?.tenantId ?? null;
  }

  getBridgeCredential(): string | null {
    return this.credentials?.bridgeCredential ?? null;
  }
}
