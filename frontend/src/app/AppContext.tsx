import { createContext, useCallback, useContext, useEffect, useState} from 'react';
import type { NetworkStatus } from '@/types';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  networkStatus: NetworkStatus;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('online');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar at < 1280 px
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)');
    const handler = (e: MediaQueryListEvent) => setSidebarCollapsed(e.matches);
    setSidebarCollapsed(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Derive network status from browser online events
  useEffect(() => {
    const onOnline  = () => setNetworkStatus('online');
    const onOffline = () => setNetworkStatus('offline');
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed(prev => !prev),
    [],
  );

  return (
    <AppContext.Provider
      value={{ networkStatus, sidebarCollapsed, toggleSidebar, setSidebarCollapsed }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
