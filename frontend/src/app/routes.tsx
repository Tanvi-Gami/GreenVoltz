import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LoadingState from '@/components/ui/LoadingState';

// Lazy-loaded pages for automatic code-splitting
const LandingPage      = lazy(() => import('@/pages/landing/LandingPage'));
const DriverPage       = lazy(() => import('@/pages/driver/DriverPage'));
const OperatorPage     = lazy(() => import('@/pages/operator/OperatorPage'));
const LoginPage        = lazy(() => import('@/pages/auth/LoginPage'));
const ReservationsPage = lazy(() => import('@/pages/reservations/ReservationsPage'));
const EnergyPage       = lazy(() => import('@/pages/energy/EnergyPage'));
const OptimizationPage = lazy(() => import('@/pages/optimization/OptimizationPage'));
const DisruptionPage   = lazy(() => import('@/pages/disruption/DisruptionPage'));
const AnalyticsPage    = lazy(() => import('@/pages/analytics/AnalyticsPage'));

const suspend = (Page: React.ComponentType) => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <LoadingState message="Loading page..." />
      </div>
    }
  >
    <Page />
  </Suspense>
);

import type React from 'react';
import { useAuth } from '@/context/AuthContext';

function OperatorOnly({ children }: { children: React.ReactNode }) {
  const { activeRole } = useAuth();
  return activeRole === 'operator' ? <>{children}</> : <Navigate to="/driver" replace />;
}

const operatorOnly = (Page: React.ComponentType) => (
  <OperatorOnly>{suspend(Page)}</OperatorOnly>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,              element: suspend(LoginPage)        },
      { path: 'login',            element: suspend(LoginPage)        },
      { path: 'overview',         element: suspend(LandingPage)      },
      { path: 'driver',           element: suspend(DriverPage)       },
      { path: 'operator',         element: suspend(OperatorPage)     },
      { path: 'reservations',     element: suspend(ReservationsPage) },
      { path: 'energy',           element: operatorOnly(EnergyPage)       },
      { path: 'optimization',     element: operatorOnly(OptimizationPage) },
      { path: 'disruption',       element: operatorOnly(DisruptionPage)   },
      { path: 'disruptions',      element: operatorOnly(DisruptionPage)   },
      { path: 'analytics',        element: operatorOnly(AnalyticsPage)    },
    ],
  },
]);
