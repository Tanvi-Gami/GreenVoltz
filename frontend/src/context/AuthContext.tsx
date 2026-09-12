import React, { createContext, useContext, useEffect, useState } from 'react';
import type { DriverProfile, OperatorProfile, UserRole, Vehicle } from '@/types/auth';

const STORAGE_KEY = 'greenvoltz_auth_state_v2';

export const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1',
    makeModel: 'Tesla Model Y Long Range',
    batteryCapacityKwh: 75,
    connectorType: 'NACS',
    isDefault: true,
  },
  {
    id: 'veh_2',
    makeModel: 'Tata Nexon EV Max',
    batteryCapacityKwh: 40.5,
    connectorType: 'CCS',
    isDefault: false,
  },
  {
    id: 'veh_3',
    makeModel: 'Hyundai Ioniq 5',
    batteryCapacityKwh: 72.6,
    connectorType: 'Type 2',
    isDefault: false,
  },
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

interface AuthContextValue {
  isAuthenticated: boolean;
  activeRole: UserRole;
  driverProfile: DriverProfile;
  operatorProfile: OperatorProfile;
  activeVehicle: Vehicle;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  switchRole: (role: UserRole) => void;
  loginAsDriver: (data: {
    name?: string;
    email?: string;
    phone?: string;
    vehicleMakeModel: string;
    batteryCapacityKwh: number;
    connectorType: 'CCS' | 'NACS' | 'Type 2' | 'CHAdeMO';
    targetSocPercent: number;
  }) => void;
  loginAsOperator: (profile: Omit<OperatorProfile, 'id' | 'role'>) => void;
  updateDriverProfile: (profile: Partial<DriverProfile>) => void;
  updateOperatorProfile: (profile: Partial<OperatorProfile>) => void;
  addVehicle: (vehicleData: Omit<Vehicle, 'id'>) => void;
  removeVehicle: (vehicleId: string) => void;
  selectActiveVehicle: (vehicleId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('driver');
  const [driverProfile, setDriverProfile] = useState<DriverProfile>(DEFAULT_DRIVER);
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile>(DEFAULT_OPERATOR);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Derive current active vehicle safely
  const activeVehicle: Vehicle =
    driverProfile.vehicles.find((v) => v.id === driverProfile.activeVehicleId) ||
    driverProfile.vehicles[0] ||
    DEFAULT_VEHICLES[0];

  // Load persisted session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeRole) setActiveRole(parsed.activeRole);
        if (parsed.driverProfile && Array.isArray(parsed.driverProfile.vehicles)) {
          setDriverProfile(parsed.driverProfile);
        }
        if (parsed.operatorProfile) setOperatorProfile(parsed.operatorProfile);
        if (typeof parsed.isAuthenticated === 'boolean') setIsAuthenticated(parsed.isAuthenticated);
      }
    } catch {
      // Fallback to defaults on error
    }
  }, []);

  // Persist session changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isAuthenticated,
          activeRole,
          driverProfile,
          operatorProfile,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [isAuthenticated, activeRole, driverProfile, operatorProfile]);

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    setIsAuthenticated(true);
  };

  const loginAsDriver = (data: {
    name?: string;
    email?: string;
    phone?: string;
    vehicleMakeModel: string;
    batteryCapacityKwh: number;
    connectorType: 'CCS' | 'NACS' | 'Type 2' | 'CHAdeMO';
    targetSocPercent: number;
  }) => {
    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      makeModel: data.vehicleMakeModel,
      batteryCapacityKwh: data.batteryCapacityKwh,
      connectorType: data.connectorType,
      isDefault: true,
    };

    const existingVehicles = driverProfile.vehicles.length > 0 ? driverProfile.vehicles : DEFAULT_VEHICLES;
    const updatedVehicles = [newVehicle, ...existingVehicles.filter((v) => v.makeModel !== data.vehicleMakeModel)];

    const updated: DriverProfile = {
      ...driverProfile,
      name: data.name?.trim() || driverProfile.name || 'EV Driver',
      email: data.email || driverProfile.email,
      phone: data.phone || driverProfile.phone,
      vehicles: updatedVehicles,
      activeVehicleId: newVehicle.id,
      targetSocPercent: data.targetSocPercent,
    };

    setDriverProfile(updated);
    setActiveRole('driver');
    setIsAuthenticated(true);
  };

  const loginAsOperator = (profileData: Omit<OperatorProfile, 'id' | 'role'>) => {
    const updated: OperatorProfile = {
      ...operatorProfile,
      ...profileData,
      id: operatorProfile.id || `op_${Date.now()}`,
      role: 'operator',
    };
    setOperatorProfile(updated);
    setActiveRole('operator');
    setIsAuthenticated(true);
  };

  const updateDriverProfile = (patch: Partial<DriverProfile>) => {
    setDriverProfile((prev) => ({ ...prev, ...patch }));
  };

  const updateOperatorProfile = (patch: Partial<OperatorProfile>) => {
    setOperatorProfile((prev) => ({ ...prev, ...patch }));
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const created: Vehicle = {
      ...vehicleData,
      id: `veh_${Date.now()}`,
    };
    setDriverProfile((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, created],
      activeVehicleId: created.id,
    }));
  };

  const removeVehicle = (vehicleId: string) => {
    setDriverProfile((prev) => {
      if (prev.vehicles.length <= 1) return prev; // Keep at least 1 vehicle
      const filtered = prev.vehicles.filter((v) => v.id !== vehicleId);
      const newActiveId = prev.activeVehicleId === vehicleId ? filtered[0].id : prev.activeVehicleId;
      return {
        ...prev,
        vehicles: filtered,
        activeVehicleId: newActiveId,
      };
    });
  };

  const selectActiveVehicle = (vehicleId: string) => {
    setDriverProfile((prev) => ({
      ...prev,
      activeVehicleId: vehicleId,
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        activeRole,
        driverProfile,
        operatorProfile,
        activeVehicle,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        switchRole,
        loginAsDriver,
        loginAsOperator,
        updateDriverProfile,
        updateOperatorProfile,
        addVehicle,
        removeVehicle,
        selectActiveVehicle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
