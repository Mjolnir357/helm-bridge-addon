export interface PairingInfo {
  code: string | null;
  expiresAt: string | null;
  status: 'unpaired' | 'waiting' | 'paired' | 'expired' | 'error';
  error: string | null;
  cloudUrl: string;
}

export interface BridgeStatusInfo {
  haConnected: boolean;
  cloudConnected: boolean;
  isPaired: boolean;
  entityCount: number;
  bridgeId: string;
  uptime: number;
}
