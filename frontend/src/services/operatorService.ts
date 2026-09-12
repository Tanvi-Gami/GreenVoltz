export type StationStatus = 'Operational' | 'High demand' | 'Attention required';
export type SessionStatus = 'Charging' | 'Finishing';

export interface StationStatusRecord {
  id: string;
  name: string;
  location: string;
  chargers: number;
  available: number;
  utilization: number;
  status: StationStatus;
  x: number;
  y: number;
}

export interface ActiveSession {
  id: string;
  vehicle: string;
  station: string;
  battery: number;
  powerKw: number;
  minutesRemaining: number;
  status: SessionStatus;
}

export interface DemandEnergyPoint {
  time: string;
  demand: number;
  renewable: number;
}

export interface CarbonPoint {
  time: string;
  value: number;
}

export interface OptimizationImpact {
  metric: string;
  without: string;
  with: string;
  improvement: string;
}

export interface NetworkInsight {
  type: 'Demand forecast' | 'Energy opportunity' | 'Carbon opportunity';
  text: string;
}

export interface OperatorOverview {
  stations: StationStatusRecord[];
  activeSessions: ActiveSession[];
  demandEnergy: DemandEnergyPoint[];
  carbon: CarbonPoint[];
  optimizationImpact: OptimizationImpact[];
  insights: NetworkInsight[];
}

export function getNetworkOverview(): OperatorOverview {
  return {
    stations: [
      { id: 'central', name: 'GreenVolt Central Hub', location: 'Downtown', chargers: 8, available: 6, utilization: 75, status: 'Operational', x: 29, y: 34 },
      { id: 'riverside', name: 'GreenVolt Riverside', location: 'Riverside District', chargers: 6, available: 4, utilization: 67, status: 'Operational', x: 58, y: 24 },
      { id: 'west', name: 'EcoCharge West', location: 'West District', chargers: 8, available: 3, utilization: 81, status: 'Operational', x: 18, y: 68 },
      { id: 'north', name: 'CityCharge North', location: 'North District', chargers: 10, available: 8, utilization: 52, status: 'Operational', x: 76, y: 18 },
      { id: 'airport', name: 'GreenVolt Airport', location: 'Airport Road', chargers: 12, available: 5, utilization: 88, status: 'High demand', x: 80, y: 70 },
      { id: 'eco-south', name: 'EcoCharge South', location: 'South Loop', chargers: 8, available: 7, utilization: 41, status: 'Operational', x: 46, y: 79 },
      { id: 'metro', name: 'CityCharge Metro', location: 'Metro Quarter', chargers: 14, available: 10, utilization: 59, status: 'Operational', x: 63, y: 52 },
      { id: 'harbor', name: 'GreenVolt Harbor', location: 'Harbor Road', chargers: 16, available: 8, utilization: 76, status: 'Attention required', x: 9, y: 31 },
    ],
    activeSessions: [
      { id: 's-1', vehicle: 'Tesla Model 3', station: 'GreenVolt Central', battery: 64, powerKw: 112, minutesRemaining: 18, status: 'Charging' },
      { id: 's-2', vehicle: 'Hyundai Ioniq 5', station: 'Riverside', battery: 42, powerKw: 87, minutesRemaining: 31, status: 'Charging' },
      { id: 's-3', vehicle: 'Kia EV6', station: 'Airport', battery: 76, powerKw: 126, minutesRemaining: 9, status: 'Finishing' },
    ],
    demandEnergy: [
      { time: '06:00', demand: 28, renewable: 32 },
      { time: '09:00', demand: 48, renewable: 45 },
      { time: '12:00', demand: 64, renewable: 68 },
      { time: '15:00', demand: 52, renewable: 86 },
      { time: '18:00', demand: 88, renewable: 47 },
      { time: '21:00', demand: 58, renewable: 33 },
    ],
    carbon: [
      { time: '12:00', value: 198 },
      { time: '13:00', value: 184 },
      { time: '14:00', value: 166 },
      { time: '15:00', value: 154 },
      { time: '16:00', value: 149 },
      { time: '17:00', value: 143 },
    ],
    optimizationImpact: [
      { metric: 'Charging cost', without: '₹21,340', with: '₹18,420', improvement: '13.7% lower' },
      { metric: 'CO₂ emissions', without: '182 kg', with: '126 kg', improvement: '30.8% lower' },
      { metric: 'Peak demand', without: '91%', with: '74%', improvement: '17 pts lower' },
      { metric: 'Average charging delay', without: '18 min', with: '9 min', improvement: '50% lower' },
    ],
    insights: [
      { type: 'Demand forecast', text: 'Central Hub is expected to reach 92% utilization between 17:00–18:00.' },
      { type: 'Energy opportunity', text: 'Moving 7 flexible sessions to 14:30 could reduce charging cost by approximately ₹310.' },
      { type: 'Carbon opportunity', text: 'Renewable availability is expected to peak at 78% between 14:30–15:15.' },
    ],
  };
}

export async function getBackendNetworkInputs(): Promise<{
  stations: BackendStation[];
  analytics: BackendAnalyticsOverview;
}> {
  const [stations, analytics] = await Promise.all([
    request<BackendStation[]>('/api/v1/stations/'),
    request<BackendAnalyticsOverview>('/api/v1/analytics/overview'),
  ]);
  return { stations, analytics };
}

export async function getBackendOperatorData() {
  const [{ stations, analytics }, sessions, signals] = await Promise.all([
    getBackendNetworkInputs(),
    request<import('@/services/backendContracts').BackendActiveSession[]>('/api/v1/charging/sessions/active'),
    request<import('@/services/backendContracts').BackendSignalPoint[]>('/api/v1/analytics/signals'),
  ]);
  return { stations, analytics, sessions, signals };
}
import { request } from '@/services/apiClient';
import type { BackendAnalyticsOverview, BackendStation } from '@/services/backendContracts';
