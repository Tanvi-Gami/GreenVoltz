export type DisruptionState = 'healthy' | 'disrupted' | 'analyzing' | 'replanning' | 'recovered';

export interface ActiveDisruption {
  title: string;
  station: string;
  charger: string;
  detectedAt: string;
  severity: 'High' | 'Medium';
  affectedCount: number;
  reservationsAffected: number;
  status: string;
}

export interface AffectedSession {
  id: string;
  ev: string;
  battery: number;
  energyKwh: number;
  window: string;
  charger: string;
}

export interface AlternativeStation {
  name: string;
  distance: string;
  charger: string;
  available: number;
}

export interface RecoveryAssignment {
  sessionId: string;
  ev: string;
  from: string;
  to: string;
  charger: string;
  window: string;
  delay: string;
  cost: string;
  reason: string;
}

export interface DisruptionHistoryItem {
  type: string;
  location: string;
  time: string;
}

export interface DisruptionData {
  disruption: ActiveDisruption;
  sessions: AffectedSession[];
  alternatives: AlternativeStation[];
  recovery: RecoveryAssignment[];
  history: DisruptionHistoryItem[];
}

const data: DisruptionData = {
  disruption: {
    title: 'Charger failure',
    station: 'GreenVolt Central Hub',
    charger: 'DC Fast Charger #04',
    detectedAt: '14:32',
    severity: 'High',
    affectedCount: 3,
    reservationsAffected: 2,
    status: 'Out of service',
  },
  sessions: [
    { id: 'GV-1042', ev: 'Tesla Model 3', battery: 41, energyKwh: 28, window: '14:30–15:15', charger: 'Central Hub • Charger #04' },
    { id: 'GV-1047', ev: 'Hyundai Ioniq 5', battery: 54, energyKwh: 31, window: '14:45–15:30', charger: 'Central Hub • Charger #04' },
    { id: 'GV-1051', ev: 'Kia EV6', battery: 27, energyKwh: 39, window: '15:00–15:45', charger: 'Central Hub • Charger #04' },
  ],
  alternatives: [
    { name: 'GreenVolt Riverside', distance: '2.1 km', charger: 'Charger #02', available: 4 },
    { name: 'EcoCharge West', distance: '3.8 km', charger: 'Charger #03', available: 5 },
    { name: 'CityCharge North', distance: '4.4 km', charger: 'Charger #06', available: 7 },
  ],
  recovery: [
    { sessionId: 'GV-1042', ev: 'Tesla Model 3', from: 'Central Hub #04', to: 'Riverside #02', charger: 'Charger #02', window: '14:45–15:30', delay: '+6 min', cost: '₹8', reason: 'Riverside has a compatible 150 kW charger, sufficient capacity, and adds only 6 minutes of delay.' },
    { sessionId: 'GV-1047', ev: 'Hyundai Ioniq 5', from: 'Central Hub #04', to: 'Central Hub #07', charger: 'Charger #07', window: '14:50–15:35', delay: '+5 min', cost: '₹0', reason: 'Charger #07 became available and satisfies the driver departure requirement without additional travel.' },
    { sessionId: 'GV-1051', ev: 'Kia EV6', from: 'Central Hub #04', to: 'EcoCharge West #03', charger: 'Charger #03', window: '15:10–15:55', delay: '+10 min', cost: '₹14', reason: 'EcoCharge West provides the lowest combined delay and recovery cost for this high-energy session.' },
  ],
  history: [
    { type: 'Charger failure', location: 'Central Hub #04', time: 'Today 14:32' },
    { type: 'Demand spike', location: 'Airport Station', time: 'Today 12:18' },
    { type: 'Grid power reduction', location: 'Riverside', time: 'Yesterday 18:42' },
    { type: 'Congestion increase', location: 'CityCharge North', time: 'Yesterday 16:10' },
  ],
};

export function getDisruptionData(): DisruptionData {
  return data;
}

export function runReplanning(): Promise<DisruptionData> {
  return new Promise(resolve => window.setTimeout(() => resolve(data), 1800));
}

export function submitBackendDisruption(event: BackendDisruptionEvent): Promise<BackendAdaptationResult> {
  return request<BackendAdaptationResult>('/api/v1/adaptation/replan', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}
import { request } from '@/services/apiClient';
import type { BackendAdaptationResult, BackendDisruptionEvent } from '@/services/backendContracts';
