"""Simulation package for EV fleet and charging demand modeling."""

from intelligence.simulation.generator import (
    BasicSimulationGenerator,
    SimulationGeneratorProtocol,
)
from intelligence.simulation.models import (
    BatteryState,
    ConnectorType,
    DriverPreferences,
    OptimizationPreference,
    SimulatedChargingRequest,
    SimulatedEV,
    VehicleType,
)

__all__ = [
    "BatteryState",
    "ConnectorType",
    "DriverPreferences",
    "OptimizationPreference",
    "SimulatedEV",
    "SimulatedChargingRequest",
    "VehicleType",
    "SimulationGeneratorProtocol",
    "BasicSimulationGenerator",
]
