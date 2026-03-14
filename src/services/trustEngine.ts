import { USBScan, Verdict } from '../types';

const WHITELIST_VIDS: Record<string, string> = {
  '0781': 'SanDisk',
  '0951': 'Kingston',
  '058f': 'Alcor Micro',
  '8564': 'Transcend',
  '13fe': 'Phison',
  '0424': 'Microchip',
  '1ea7': 'SHARKOON',
};

export const calculateTrustScore = (data: Partial<USBScan>): { score: number; verdict: Verdict; reasoning: string; analysis: any } => {
  let score = 0;
  const analysis = {
    whitelist: false,
    integrity: false,
    behavioral: 'Neutral',
    aiAnomaly: 0,
  };

  // 1. Manufacturer Whitelist Verification (40 pts)
  if (data.vid && WHITELIST_VIDS[data.vid.toLowerCase()]) {
    score += 40;
    analysis.whitelist = true;
  }

  // 2. Firmware Hash Integrity (30 pts)
  // Mocking integrity check - in a real app, this would check against a known good hash DB
  if (data.firmwareHash && data.firmwareHash.length === 64) {
    score += 30;
    analysis.integrity = true;
  }

  // 3. Behavioral Analysis (20 pts)
  // Detecting suspicious patterns in description or device class
  const suspiciousKeywords = ['autorun', 'inject', 'hid', 'keyboard', 'script'];
  const hasSuspicious = suspiciousKeywords.some(k => data.description?.toLowerCase().includes(k));
  if (!hasSuspicious) {
    score += 20;
    analysis.behavioral = 'Safe';
  } else {
    analysis.behavioral = 'Suspicious HID/Autorun patterns detected';
  }

  // 4. AI Anomaly Detection (10 pts)
  // Entropy analysis mock (0-10)
  const entropy = Math.random() * 10;
  analysis.aiAnomaly = entropy;
  if (entropy < 7) {
    score += 10;
  }

  let verdict: Verdict = 'SAFE';
  if (score < 50) verdict = 'DANGEROUS';
  else if (score < 80) verdict = 'SUSPICIOUS';

  let reasoning = `Trust score: ${score}/100. `;
  if (verdict === 'SAFE') {
    reasoning += 'Device matches known manufacturer patterns and shows no behavioral anomalies.';
  } else if (verdict === 'SUSPICIOUS') {
    reasoning += 'Device has some unknown characteristics or minor behavioral flags.';
  } else {
    reasoning += 'Critical security flags triggered: Unknown manufacturer, suspicious behavioral patterns, or high entropy firmware.';
  }

  return { score, verdict, reasoning, analysis };
};
