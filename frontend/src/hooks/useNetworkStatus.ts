import { useApp } from '@/app/AppContext';
import type { NetworkStatus } from '@/types';

export function useNetworkStatus(): NetworkStatus {
  return useApp().networkStatus;
}
