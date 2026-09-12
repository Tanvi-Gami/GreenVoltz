import { useApp } from '@/app/AppContext';
import StatusIndicator from '@/components/ui/StatusIndicator';

export default function NetworkStatus() {
  const { networkStatus } = useApp();
  const tone = networkStatus === 'online' ? 'success' : networkStatus === 'degraded' ? 'warning' : 'danger';
  return <StatusIndicator label={`NETWORK ${networkStatus.toUpperCase()}`} tone={tone} />;
}
