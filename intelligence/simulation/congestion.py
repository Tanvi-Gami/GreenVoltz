"""Simple congestion model for stations."""
from intelligence.simulation.models import StationState


def compute_congestion(occupied: int, queue: int, total_capacity: int) -> float:
    if total_capacity <= 0:
        return 1.0
    load = (occupied + queue) / total_capacity
    # clamp 0..1
    return max(0.0, min(1.0, load))


def station_state_from(station, chargers, occupied=0, queue=0, tariff=0.15, renewable=0.0, carbon=300.0):
    total_capacity = len([c for c in chargers if c.station_id == station.station_id])
    congestion = compute_congestion(occupied, queue, total_capacity)
    est_wait = int(queue * 15)
    return StationState(
        station_id=station.station_id,
        available_chargers=max(0, total_capacity - occupied),
        occupied_chargers=occupied,
        queue_length=queue,
        estimated_wait_minutes=est_wait,
        current_tariff=tariff,
        renewable_availability=renewable,
        carbon_intensity_gco2=carbon,
        reliability=station.reliability_score,
        congestion=congestion,
    )
