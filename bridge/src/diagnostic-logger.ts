import type { DiagnosticLogEntry } from '../../packages/protocol/src/messages';

export interface DiagnosticSnapshot {
  memoryUsageMB: number;
  uptimeSeconds: number;
  nodeVersion: string;
  haConnected: boolean;
  cloudConnected: boolean;
  webServerListening: boolean;
  webServerPort: number;
  entityCount: number;
  lastError: string | null;
  platform: string;
  supervisorAvailable: boolean;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

type FlushCallback = (logs: DiagnosticLogEntry[], diagnostics: DiagnosticSnapshot) => void;

export class DiagnosticLogger {
  private buffer: DiagnosticLogEntry[] = [];
  private maxBufferSize = 500;
  private flushCallback: FlushCallback | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushIntervalMs = 30000;
  private originalConsoleLog: typeof console.log;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private originalConsoleInfo: typeof console.info;
  private lastError: string | null = null;
  private startTime = Date.now();
  private stateProviders: {
    haConnected: () => boolean;
    cloudConnected: () => boolean;
    webServerListening: () => boolean;
    webServerPort: () => number;
    entityCount: () => number;
  } | null = null;

  constructor() {
    this.originalConsoleLog = console.log.bind(console);
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
    this.originalConsoleInfo = console.info.bind(console);
  }

  setStateProviders(providers: {
    haConnected: () => boolean;
    cloudConnected: () => boolean;
    webServerListening: () => boolean;
    webServerPort: () => number;
    entityCount: () => number;
  }): void {
    this.stateProviders = providers;
  }

  interceptConsole(): void {
    console.log = (...args: unknown[]) => {
      this.originalConsoleLog(...args);
      const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
      this.addEntry('info', this.categorize(msg), msg);
    };

    console.error = (...args: unknown[]) => {
      this.originalConsoleError(...args);
      const msg = args.map(a => {
        if (a instanceof Error) return `${a.message}\n${a.stack}`;
        return typeof a === 'string' ? a : JSON.stringify(a);
      }).join(' ');
      this.lastError = msg;
      this.addEntry('error', this.categorize(msg), msg);
    };

    console.warn = (...args: unknown[]) => {
      this.originalConsoleWarn(...args);
      const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
      this.addEntry('warn', this.categorize(msg), msg);
    };

    console.info = (...args: unknown[]) => {
      this.originalConsoleInfo(...args);
      const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
      this.addEntry('info', this.categorize(msg), msg);
    };
  }

  private categorize(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('websocket') || lower.includes('ws ')) return 'websocket';
    if (lower.includes('web ui') || lower.includes('web server') || lower.includes('listen')) return 'webserver';
    if (lower.includes('ingress') || lower.includes('502') || lower.includes('bad gateway')) return 'ingress';
    if (lower.includes('home assistant') || lower.includes('ha ') || lower.includes('rest api')) return 'homeassistant';
    if (lower.includes('cloud') || lower.includes('pairing') || lower.includes('credential')) return 'cloud';
    if (lower.includes('auth') || lower.includes('token')) return 'auth';
    if (lower.includes('sync') || lower.includes('entity') || lower.includes('state')) return 'sync';
    if (lower.includes('command') || lower.includes('service')) return 'command';
    if (lower.includes('start') || lower.includes('stop') || lower.includes('bridge')) return 'lifecycle';
    if (lower.includes('error') || lower.includes('fail') || lower.includes('❌')) return 'error';
    return 'general';
  }

  private static readonly SENSITIVE_ENV_PATTERN = /(?:SUPERVISOR_TOKEN|HA_TOKEN|HASSIO_TOKEN|Authorization|x-ha-access|Bearer)\s*[=:]\s*\S+/gi;
  private static readonly SENSITIVE_JSON_PATTERN = /"(?:token|access_token|refresh_token|credential|bridgeCredential|password|secret|apiKey|api_key|client_secret|authorization|x-ha-access)"\s*:\s*"[^"]*"/gi;
  private static readonly JWT_PATTERN = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
  private static readonly BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;
  private static readonly SENSITIVE_KEYS = [
    'token', 'access_token', 'refresh_token', 'credential', 'bridgecredential',
    'password', 'secret', 'apikey', 'api_key', 'client_secret', 'authorization',
    'x-ha-access', 'hassio_token', 'supervisor_token', 'ha_token',
  ];

  private redactSensitive(text: string): string {
    return text
      .replace(DiagnosticLogger.SENSITIVE_ENV_PATTERN, (match) => {
        const prefix = match.split(/[=:]/)[0];
        return `${prefix}=[REDACTED]`;
      })
      .replace(DiagnosticLogger.SENSITIVE_JSON_PATTERN, (match) => {
        const key = match.split(':')[0];
        return `${key}: "[REDACTED]"`;
      })
      .replace(DiagnosticLogger.JWT_PATTERN, '[REDACTED_JWT]')
      .replace(DiagnosticLogger.BEARER_PATTERN, 'Bearer [REDACTED]');
  }

  private redactValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.redactSensitive(value);
    }
    if (Array.isArray(value)) {
      return value.map(item => this.redactValue(item));
    }
    if (typeof value === 'object' && value !== null) {
      return this.redactData(value as Record<string, unknown>);
    }
    return value;
  }

  private redactData(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (DiagnosticLogger.SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = this.redactValue(value);
      }
    }
    return result;
  }

  addEntry(level: LogLevel, category: string, message: string, data?: Record<string, unknown>): void {
    const entry: DiagnosticLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message: this.redactSensitive(message.substring(0, 2000)),
      ...(data ? { data: this.redactData(data) } : {}),
    };

    this.buffer.push(entry);

    if (this.buffer.length > this.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.maxBufferSize);
    }

    if (level === 'error' || level === 'fatal') {
      this.triggerErrorFlush();
    }
  }

  private triggerErrorFlush(): void {
    if (this.flushCallback) {
      setTimeout(() => this.flush(), 2000);
    }
  }

  onFlush(callback: FlushCallback): void {
    this.flushCallback = callback;
  }

  startPeriodicFlush(): void {
    this.stopPeriodicFlush();
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  flush(): void {
    if (!this.flushCallback || this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    const diagnostics = this.collectDiagnostics();
    this.flushCallback(logs, diagnostics);
  }

  getRecentLogs(maxEntries: number = 200): DiagnosticLogEntry[] {
    return this.buffer.slice(-maxEntries);
  }

  collectDiagnostics(): DiagnosticSnapshot {
    const memUsage = process.memoryUsage();

    let supervisorAvailable = false;
    try {
      supervisorAvailable = !!process.env.SUPERVISOR_TOKEN;
    } catch {}

    return {
      memoryUsageMB: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      nodeVersion: process.version,
      haConnected: this.stateProviders?.haConnected() ?? false,
      cloudConnected: this.stateProviders?.cloudConnected() ?? false,
      webServerListening: this.stateProviders?.webServerListening() ?? false,
      webServerPort: this.stateProviders?.webServerPort() ?? 8098,
      entityCount: this.stateProviders?.entityCount() ?? 0,
      lastError: this.lastError,
      platform: process.platform,
      supervisorAvailable,
    };
  }

  logStartupDiagnostic(): void {
    this.addEntry('info', 'lifecycle', 'Bridge diagnostic logger initialized', {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      env: {
        SUPERVISOR_TOKEN: process.env.SUPERVISOR_TOKEN ? '[SET]' : '[NOT SET]',
        DATA_DIR: process.env.DATA_DIR || '[NOT SET]',
        HASSIO_TOKEN: process.env.HASSIO_TOKEN ? '[SET]' : '[NOT SET]',
      },
    });
  }

  logWebServerBind(port: number, success: boolean, error?: string): void {
    if (success) {
      this.addEntry('info', 'webserver', `Web server successfully bound to port ${port}`, { port });
    } else {
      this.addEntry('error', 'webserver', `Web server FAILED to bind to port ${port}: ${error}`, { port, error });
    }
  }

  logIngressCheck(ingressPath: string | undefined, headers: Record<string, string>): void {
    this.addEntry('debug', 'ingress', 'Ingress request received', {
      ingressPath,
      hasIngressHeader: !!ingressPath,
      headers,
    });
  }

  restoreConsole(): void {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    console.info = this.originalConsoleInfo;
  }
}

export const diagnosticLogger = new DiagnosticLogger();
