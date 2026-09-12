import { request, USE_MOCKS } from '@/services/api';
import type { Reservation } from '@/types';
import { mockReservations } from '@/mocks/reservations.mock';

export async function listReservations(): Promise<Reservation[]> {
  if (USE_MOCKS) return mockReservations();
  return request<Reservation[]>('/v1/reservations');
}

export async function createReservation(payload: Omit<Reservation, 'id' | 'status'>): Promise<Reservation> {
  if (USE_MOCKS) return { ...payload, id: crypto.randomUUID(), status: 'pending' };
  return request<Reservation>('/v1/reservations', { method: 'POST', body: JSON.stringify(payload) });
}
