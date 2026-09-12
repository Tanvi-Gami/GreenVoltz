import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LoadingState from '@/components/ui/LoadingState';

// Lazy-loaded pages for automatic code-splitting
const LandingPage      = lazy(() => import('@/pages/landing/LandingPage'));
const DriverPage       = lazy(() => import('@/pages/driver/DriverPage'));
const OperatorPage     = lazy(() => import('@/pages/operator/OperatorPage'));
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,              element: suspend(LandingPage)      },
      { path: 'driver',           element: suspend(DriverPage)       },
      { path: 'operator',         element: suspend(OperatorPage)     },
      { path: 'reservations',     element: suspend(ReservationsPage) },
      { path: 'energy',           element: suspend(EnergyPage)       },
      { path: 'optimization',     element: suspend(OptimizationPage) },
      { path: 'disruption',       element: suspend(DisruptionPage)   },
      { path: 'disruptions',      element: suspend(DisruptionPage)   },
      { path: 'analytics',        element: suspend(AnalyticsPage)    },
    ],
  },
]);
