export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  role: 'user' | 'admin';
}

export interface USBScan {
  id?: string;
  uid: string;
  vid: string;
  pid: string;
  serialNumber?: string;
  deviceClass?: string;
  firmwareHash?: string;
  description?: string;
  timestamp: string;
  score: number;
  verdict: Verdict;
  analysis: {
    whitelist: boolean;
    integrity: boolean;
    behavioral: string;
    aiAnomaly: number;
  };
  technicalReasoning: string;
}

export interface ThreatIntel {
  id?: string;
  signature: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}
