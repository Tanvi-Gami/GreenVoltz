"""Simulation generator interfaces and baseline stubs for synthetic EV fleet behavior."""

from datetime import datetime, timedelta
from typing import List, Protocol

from intelligence.simulation.models import (
    BatteryState,
    ConnectorType,
    DriverPreferences,
    OptimizationPreference,
    SimulatedChargingRequest,
    SimulatedEV,
    VehicleType,
)


class SimulationGeneratorProtocol(Protocol):
    """Protocol for generating synthetic EV charging demand scenarios."""

    def generate_fleet(self, count: int) -> List[SimulatedEV]:
        """Generate a simulated fleet of electric vehicles."""
        ...

    def generate_requests(
        self,
        fleet: List[SimulatedEV],
        start_time: datetime,
        duration_hours: int,
    ) -> List[SimulatedChargingRequest]:
        """Generate charging requests for the simulated fleet over a time horizon."""
        ...


class BasicSimulationGenerator:
    """Baseline generator stub for creating synthetic EV charging instances."""

    def generate_fleet(self, count: int) -> List[SimulatedEV]:
        """Generate synthetic fleet with diverse vehicle and connector types."""
        fleet: List[SimulatedEV] = []
        for i in range(count):
            veh_type = VehicleType.PASSENGER_CAR if i % 4 != 0 else VehicleType.LIGHT_COMMERCIAL
            capacity = 60.0 if veh_type == VehicleType.PASSENGER_CAR else 90.0
            initial_soc = 20.0 + (i % 5) * 10.0  # 20% - 60%

            fleet.append(
                SimulatedEV(
                    vehicle_id=f"EV-{i+1:04d}",
                    vehicle_type=veh_type,
                    connector_type=ConnectorType.CCS_2 if i % 2 == 0 else ConnectorType.TYPE_2,
                    battery=BatteryState(
                        capacity_kwh=capacity,
                        current_soc_pct=initial_soc,
                        target_soc_pct=85.0,
                    ),
                    max_charge_rate_kw=50.0 if veh_type == VehicleType.PASSENGER_CAR else 100.0,
                )
            )
        return fleet

    def generate_requests(
        self,
        fleet: List[SimulatedEV],
        start_time: datetime,
        duration_hours: int = 24,
    ) -> List[SimulatedChargingRequest]:
        """Generate simulated charging requests with arrival and departure windows."""
        requests: List[SimulatedChargingRequest] = []
        for idx, ev in enumerate(fleet):
            arrival = start_time + timedelta(hours=(idx % duration_hours))
            departure = arrival + timedelta(hours=4 + (idx % 6))
            requests.append(
                SimulatedChargingRequest(
                    request_id=f"REQ-{idx+1:04d}",
                    ev=ev,
                    arrival_time=arrival,
                    departure_deadline=departure,
                    energy_required_kwh=ev.battery.energy_required_kwh,
                    preferences=DriverPreferences(
                        optimization_preference=OptimizationPreference.BALANCED,
                        min_acceptable_departure_soc=80.0,
                    ),
                )
            )
        return requests
