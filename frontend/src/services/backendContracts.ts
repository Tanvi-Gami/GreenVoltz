export interface BackendCharger {
  id: number;
  station_id: number;
  connector_type: string;
  max_power_kw: number;
}

export interface BackendStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  total_chargers: number;
  chargers: BackendCharger[];
}

export interface BackendAnalyticsOverview {
  total_requests: number;
  total_reservations: number;
  scheduled_reservations: number;
  unscheduled_requests: number;
  energy_delivered_kwh: number;
  estimated_cost: number;
  estimated_carbon_gco2: number;
  renewable_energy_kwh: number;
}

export interface BackendChargingRequest {
  vehicle_id: number;
  arrival_slot: number;
  departure_slot: number;
  energy_required_kwh: number;
  connector_type: string;
  max_power_kw: number;
}

export interface BackendChargingPlanItem {
  ev_id: string;
  station_id: string;
  charger_id: string;
  time_slot: number;
  power_kw: number;
  energy_kwh: number;
  tariff: number;
  carbon_intensity: number;
  renewable_availability: number;
}

export interface BackendChargingRecommendation {
  solver_status: string;
  objective_value: number;
  charging_plan: BackendChargingPlanItem[];
  total_energy_delivered: number;
  total_cost: number;
  total_carbon: number;
  unscheduled_ev_ids: string[];
}

export interface BackendDisruptionEvent {
  event_id?: string;
  event_type: string;
  station_id?: string;
  charger_id?: string;
  affected_slots?: number[];
  old_value?: number;
  new_value?: number;
  timestamp?: string;
  severity?: string;
}

export interface BackendAdaptationResult {
  status: string;
  affected_ev_ids: string[];
  preserved_plan_items: string[];
  changed_plan_items: string[];
  removed_plan_items: string[];
  added_plan_items: string[];
  new_charging_plan: Record<string, unknown>[];
  unscheduled_ev_ids: string[];
  schedule_changes: number;
  runtime_seconds: number;
}
