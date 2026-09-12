import { request, USE_MOCKS } from '@/services/api';
import type { HealthStatus } from '@/types';
import { mockHealth } from '@/mocks/health.mock';

export async function getHealth(): Promise<HealthStatus> {
  if (USE_MOCKS) return mockHealth();
  return request<HealthStatus>('/v1/health');
}
