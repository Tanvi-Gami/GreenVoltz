import { Reservation } from '@/types/reservation';
import { request, USE_MOCKS } from '@/services/apiClient';

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    stationId: 'central-hub',
    stationName: 'GreenVolt Central Hub',
    chargerType: 'DC Fast',
    chargingSpeedKw: 150,
    vehicleName: 'Tesla Model 3',
    window: '14:30 – 15:15',
    date: 'Today',
    status: 'ACTIVE',
    depositPaid: 50,
    totalCost: 186,
    energyKwh: 31,
    passCode: 'GV-8924',
    distanceKm: 2.4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-098',
    stationId: 'west',
    stationName: 'EcoCharge West',
    chargerType: 'DC Fast',
    chargingSpeedKw: 100,
    vehicleName: 'Tesla Model 3',
    window: '10:00 – 10:45',
    date: 'Yesterday',
    status: 'COMPLETED',
    depositPaid: 50,
    totalCost: 204,
    energyKwh: 34,
    passCode: 'GV-7712',
    distanceKm: 7.2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'res-092',
    stationId: 'north',
    stationName: 'CityCharge North',
    chargerType: 'Ultra Fast',
    chargingSpeedKw: 180,
    vehicleName: 'Tesla Model 3',
    window: '16:00 – 16:35',
    date: 'Sep 10, 2026',
    status: 'CANCELLED',
    depositPaid: 50,
    totalCost: 149,
    energyKwh: 22,
    passCode: 'GV-5541',
    distanceKm: 5.8,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

let reservationsStore: Reservation[] = [...INITIAL_RESERVATIONS];

export function getReservations(): Reservation[] {
  return [...reservationsStore];
}

export function addReservation(
  newRes: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'passCode'>,
  persistedId?: string,
): Reservation {
  const randomCode = `GV-${Math.floor(1000 + Math.random() * 9000)}`;
  const created: Reservation = {
    ...newRes,
    id: persistedId ?? `res-${Date.now()}`,
    status: 'ACTIVE',
    passCode: randomCode,
    createdAt: new Date().toISOString(),
  };
  reservationsStore = [created, ...reservationsStore];
  return created;
}

export function cancelReservation(id: string): boolean {
  const index = reservationsStore.findIndex((r) => r.id === id);
  if (index !== -1) {
    reservationsStore[index] = {
      ...reservationsStore[index],
      status: 'CANCELLED',
    };
    return true;
  }

  return false;
}

export async function createLiveReservation(input: {
    requestId: number;
    chargerId: number;
    startTime: string;
    endTime: string;
  }): Promise<{ id: number; request_id: number; charger_id: number; start_time: string; end_time: string; status: string }> {
    if (USE_MOCKS) {
      throw new Error('Live reservations require VITE_USE_MOCKS=false.');
    }
    return request('/api/v1/reservations/', {
      method: 'POST',
      body: JSON.stringify({
        request_id: input.requestId,
        charger_id: input.chargerId,
        start_time: input.startTime,
        end_time: input.endTime,
      }),
    });
  }

export function getLiveReservation(id: number) {
    return request(`/api/v1/reservations/${id}`);
  }

export function cancelLiveReservation(id: number) {
    return request(`/api/v1/reservations/${id}/cancel`, { method: 'POST' });
  }

  export function listLiveReservations() {
    return request<Array<{ id: number; request_id: number; charger_id: number; start_time: string; end_time: string; status: string }>>(
      '/api/v1/reservations/',
    );
  }
