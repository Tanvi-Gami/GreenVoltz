import type { DriverProfile, OperatorProfile, Vehicle } from '@/types/auth';

export const DEFAULT_VEHICLES: Vehicle[] = [
  { id: 'veh_1', makeModel: 'Tesla Model Y Long Range', batteryCapacityKwh: 75, connectorType: 'NACS', isDefault: true },
  { id: 'veh_2', makeModel: 'Tata Nexon EV Max', batteryCapacityKwh: 40.5, connectorType: 'CCS', isDefault: false },
  { id: 'veh_3', makeModel: 'Hyundai Ioniq 5', batteryCapacityKwh: 72.6, connectorType: 'Type 2', isDefault: false },
];

export const DEFAULT_DRIVER: DriverProfile = {
  id: 'drv_101',
  role: 'driver',
  name: 'Alex Rivera',
  email: 'alex.driver@greenvoltz.io',
  phone: '+1 (555) 234-5678',
  vehicles: DEFAULT_VEHICLES,
  activeVehicleId: 'veh_1',
  targetSocPercent: 85,
  currentSocPercent: 35,
};

export const DEFAULT_OPERATOR: OperatorProfile = {
  id: 'op_502',
  role: 'operator',
  operatorName: 'GreenVoltz Energy Networks',
  stationName: 'Downtown EcoStation Hub #4',
  email: 'ops@greenvoltz.io',
  phone: '+1 (555) 890-1234',
  address: '450 Innovation Blvd',
  city: 'San Francisco, CA',
  totalPorts: 12,
  maxPowerKw: 150,
  tariffRatePerKwh: 0.28,
  supportedConnectors: ['CCS', 'NACS', 'Type 2'],
};
