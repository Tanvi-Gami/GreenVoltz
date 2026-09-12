import type { Station } from '@/types';

export function mockStations(): Station[] {
  return [
    { id: 'sta-001', name: 'Canary Wharf Hub',     latitude: 51.5054, longitude: -0.0235, charger_count: 12, available_count: 5,  status: 'available' },
    { id: 'sta-002', name: 'Old Street Rapid',     latitude: 51.5255, longitude: -0.0873, charger_count: 6,  available_count: 0,  status: 'occupied'  },
    { id: 'sta-003', name: 'Battersea DC Fast',    latitude: 51.4818, longitude: -0.1441, charger_count: 8,  available_count: 3,  status: 'available' },
    { id: 'sta-004', name: 'Stratford Supercharger',latitude: 51.5411, longitude: -0.0031, charger_count: 20, available_count: 12, status: 'available' },
  ];
}
