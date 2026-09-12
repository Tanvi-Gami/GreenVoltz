import type { HealthStatus } from '@/types';

export function mockHealth(): HealthStatus {
  return {
    status: 'ok',
    version: '0.1.0-mock',
    environment: 'development',
    timestamp: new Date().toISOString(),
  };
}
