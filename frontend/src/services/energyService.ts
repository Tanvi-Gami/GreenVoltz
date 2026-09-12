import { request, USE_MOCKS } from '@/services/apiClient';
import type { BackendAnalyticsOverview, BackendSignalPoint } from '@/services/backendContracts';
import { getNetworkOverview } from '@/services/operatorService';

export interface EnergySignal {
  time: string;
  timestamp: string;
  demandKw: number;
  renewablePercent: number;
  carbonIntensity: number;
  tariff: number;
}

export interface EnergyData {
  overview?: BackendAnalyticsOverview;
  signals: EnergySignal[];
  source: 'live' | 'demo';
}

const mockSignals: EnergySignal[] = [
  { time: '06:00', timestamp: '06:00', demandKw: 28, renewablePercent: 32, carbonIntensity: 220, tariff: 6.8 },
  { time: '09:00', timestamp: '09:00', demandKw: 48, renewablePercent: 45, carbonIntensity: 214, tariff: 8.4 },
  { time: '12:00', timestamp: '12:00', demandKw: 64, renewablePercent: 68, carbonIntensity: 198, tariff: 9.2 },
  { time: '15:00', timestamp: '15:00', demandKw: 52, renewablePercent: 86, carbonIntensity: 154, tariff: 6.2 },
  { time: '18:00', timestamp: '18:00', demandKw: 88, renewablePercent: 47, carbonIntensity: 205, tariff: 10.4 },
  { time: '21:00', timestamp: '21:00', demandKw: 58, renewablePercent: 33, carbonIntensity: 226, tariff: 8.1 },
];

function mapSignal(point: BackendSignalPoint): EnergySignal {
  const date = new Date(point.timestamp);
  return {
    time: Number.isNaN(date.getTime())
      ? point.timestamp
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    timestamp: point.timestamp,
    demandKw: point.demand_kw,
    renewablePercent: point.renewable_percent,
    carbonIntensity: point.carbon_intensity_gco2,
    tariff: point.tariff_per_kwh,
  };
}

export async function getEnergyData(): Promise<EnergyData> {
  if (USE_MOCKS) {
    const overview = getNetworkOverview();
    return {
      signals: mockSignals,
      overview: {
        total_requests: overview.activeSessions.length,
        total_reservations: 4,
        scheduled_reservations: 3,
        unscheduled_requests: 0,
        energy_delivered_kwh: 118,
        estimated_cost: 186,
        estimated_carbon_gco2: 4800,
        renewable_energy_kwh: 78,
      },
      source: 'demo',
    };
  }

  const [overview, signals] = await Promise.all([
    request<BackendAnalyticsOverview>('/api/v1/analytics/overview'),
    request<BackendSignalPoint[]>('/api/v1/analytics/signals'),
  ]);
  return { overview, signals: signals.map(mapSignal), source: 'live' };
}
