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
  adaptation_id?: number;
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
  before_cost?: number;
  after_cost?: number;
  before_carbon?: number;
  after_carbon?: number;
  delay_minutes?: number;
}

export interface BackendActiveSession {
  session_id: number;
  vehicle_id: number | null;
  station_id: number;
  charger_id: number;
  battery_percent: number;
  target_percent: number;
  requested_energy_kwh: number | null;
  current_power_kw: number;
  start_time: string;
  estimated_completion_time: string | null;
  status: string;
}

export interface BackendSignalPoint {
  timestamp: string;
  demand_kw: number;
  renewable_percent: number;
  carbon_intensity_gco2: number;
  tariff_per_kwh: number;
}

export interface BackendOptimizationRun {
  run_id: number;
  status: string;
  before_cost: number;
  after_cost: number;
  before_carbon: number;
  after_carbon: number;
  peak_demand_before_kw: number | null;
  peak_demand_after_kw: number | null;
  total_savings: number;
  carbon_reduction: number;
  optimized_charging_sessions: Record<string, unknown>[];
  objective_summary: string;
  constraints_respected: string[];
  optimization_timestamp: string;
}
