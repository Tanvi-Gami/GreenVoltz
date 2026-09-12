import { request, USE_MOCKS } from '@/services/api';
import type { Station } from '@/types';
import { mockStations } from '@/mocks/stations.mock';

export async function listStations(): Promise<Station[]> {
  if (USE_MOCKS) return mockStations();
  return request<Station[]>('/v1/stations');
}
