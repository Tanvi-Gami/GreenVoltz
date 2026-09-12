export type UserRole = 'driver' | 'operator';

export interface Vehicle {
  id: string;
  makeModel: string;
  batteryCapacityKwh: number;
  connectorType: 'CCS' | 'NACS' | 'Type 2' | 'CHAdeMO';
  isDefault?: boolean;
}

export interface DriverProfile {
  id: string;
  role: 'driver';
  name: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
  activeVehicleId: string;
  targetSocPercent: number;
  currentSocPercent?: number;
}

export interface OperatorProfile {
  id: string;
  role: 'operator';
  operatorName: string;
  stationName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalPorts: number;
  maxPowerKw: number;
  tariffRatePerKwh: number;
  supportedConnectors: ('CCS' | 'NACS' | 'Type 2' | 'CHAdeMO')[];
}

export type UserProfile = DriverProfile | OperatorProfile;

export interface AuthState {
  isAuthenticated: boolean;
  activeRole: UserRole;
  driverProfile: DriverProfile | null;
  operatorProfile: OperatorProfile | null;
}
