// ─── Shared domain types ────────────────────────────────────────────────────

export type NetworkStatus = 'online' | 'degraded' | 'offline';

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

// ─── Charging Station types ─────────────────────────────────────────────────

export type ChargerStatus = 'available' | 'occupied' | 'faulted' | 'offline';
export type ConnectorType = 'CCS2' | 'CHAdeMO' | 'Type2AC' | 'NACS';

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  charger_count: number;
  available_count: number;
  status: ChargerStatus;
}

export interface Charger {
  id: string;
  station_id: string;
  connector_type: ConnectorType;
  power_kw: number;
  status: ChargerStatus;
}

// ─── EV / Session types ─────────────────────────────────────────────────────

export interface Reservation {
  id: string;
  station_id: string;
  charger_id: string;
  user_id: string;
  start_time: string;        // ISO 8601
  end_time: string;
  estimated_energy_kwh: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}

// ─── Energy / Forecast types ─────────────────────────────────────────────────

export interface CarbonIntensityPoint {
  timestamp: string;
  intensity_actual: number | null;
  intensity_forecast: number;
}

export interface ForecastPoint {
  timestamp: string;
  value_p10: number;
  value_p50: number;
  value_p90: number;
}

// ─── Navigation types ────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

// Ensure React is imported for JSX types
import type React from 'react';
