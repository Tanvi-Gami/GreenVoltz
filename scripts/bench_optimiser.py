from intelligence.optimiser.scheduler import optimise
from intelligence.simulation import generate_simulation

SCENARIOS = [10, 25, 50, 100]


def make_feasible(sim):
    """Adjust requests so each EV's required energy is feasible within its available slots.

    Strategy: cap each request to 80% of the EV's maximum achievable energy given its window and max power.
    """
    slot_hours = sim.time_step_minutes / 60.0
    for ev, req in zip(sim.evs, sim.requests):
        slots = max(1, req.departure_slot - req.arrival_slot)
        max_energy = ev.max_charging_power_kw * slot_hours * slots
        req.energy_required_kwh = min(req.energy_required_kwh, 0.8 * max_energy)
    return sim


def run():
    for n in SCENARIOS:
        print(f"\n--- Scenario: {n} EVs (feasible) ---")
        sim = generate_simulation(seed=12345 + n, num_evs=n, num_stations=10, horizon_hours=24, time_step_minutes=15)
        sim = make_feasible(sim)
        res = optimise(sim, time_limit_seconds=20, num_workers=4)
        scheduled = len(res.charging_plan)
        unscheduled = len(res.unscheduled_ev_ids)
        print(f"Status: {res.solver_status}")
        print(f"Runtime: {res.solver_runtime_seconds:.2f}s")
        print(f"Objective: {res.objective_value}")
        print(f"Scheduled plan items: {scheduled}")
        print(f"Unscheduled EVs: {unscheduled}")
        print(f"Total energy (kWh): {res.total_energy_delivered:.2f}")
        print(f"Total cost: {res.total_cost:.2f}")
        print(f"Total carbon: {res.total_carbon:.2f}")

    # genuine infeasible scenario
    print("\n--- Infeasible scenario test ---")
    sim = generate_simulation(seed=999, num_evs=5, num_stations=1, horizon_hours=1, time_step_minutes=60)
    # make first EV demand impossibly large
    sim.requests[0].energy_required_kwh = 1e6
    res = optimise(sim, time_limit_seconds=10, num_workers=2)
    print(f"Status: {res.solver_status}")
    print(f"Unscheduled EVs: {len(res.unscheduled_ev_ids)}")


if __name__ == '__main__':
    run()
