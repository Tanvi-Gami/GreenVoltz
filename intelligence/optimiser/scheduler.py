"""CP-SAT scheduler implementation for GreenVoltz."""

import time
from typing import Dict, Tuple

from ortools.sat.python import cp_model

from intelligence.optimiser.input_builder import build_optimisation_input
from intelligence.optimiser.result import ChargingPlanItem, OptimisationResult
from intelligence.optimiser.validation import validate_plan
from intelligence.simulation.models import SimulationState


class ObjectiveWeights:
    def __init__(self, cost=1.0, carbon=0.01, congestion=0.5, reliability=-0.1, renewable=-0.5, urgency=0.5):
        self.cost = cost
        self.carbon = carbon
        self.congestion = congestion
        self.reliability = reliability
        self.renewable = renewable
        self.urgency = urgency


class CPSATScheduler:
    """CP-SAT based scheduler implementing the GreenVoltz optimisation.

    Usage: call `optimise(simulation_state, config)` or use this class to wrap parameters.
    """

    def __init__(
        self,
        time_limit_seconds: float = 10,
        num_workers: int = 8,
        scale: int = 1000,
        random_seed: int | None = None,
    ):
        self.time_limit_seconds = time_limit_seconds
        self.num_workers = num_workers
        self.scale = scale
        self.random_seed = random_seed

    def optimise(self, sim: SimulationState, weights: ObjectiveWeights = None) -> OptimisationResult:
        """Optimise charging schedule for given SimulationState.

        Returns OptimisationResult containing charging plan and metrics.
        """
        start_time = time.time()
        if weights is None:
            weights = ObjectiveWeights()

        data = build_optimisation_input(sim)
        horizon = data["horizon_slots"]
        slot_hours = data["slot_duration_minutes"] / 60.0

        model = cp_model.CpModel()
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = self.time_limit_seconds
        solver.parameters.num_search_workers = self.num_workers
        if self.random_seed is not None:
            solver.parameters.random_seed = int(self.random_seed)

        # Precompute feasible (ev, charger) pairs and variables per slot
        vars: Dict[Tuple[str, str, int], cp_model.IntVar] = {}

        # energy per slot for pair (ev, charger)
        energy_slot_cache: Dict[Tuple[str, str], float] = {}

        # Build feasible variable set
        for ev in data["evs"]:
            for charger_id, charger in data["chargers"].items():
                # charger availability and station operational status
                st_id = data["charger_to_station"].get(charger_id)
                station = data["stations"].get(st_id)
                if charger.status != "available" or (station and station.operational_status != "operational"):
                    continue
                # connector compatibility
                if ev.connector_type != charger.connector_type:
                    continue
                eff_power = min(ev.max_charging_power_kw, charger.max_power_kw)
                if eff_power <= 0:
                    continue
                energy_per_slot = eff_power * slot_hours * getattr(charger, "efficiency", 0.95)
                energy_slot_cache[(ev.ev_id, charger_id)] = energy_per_slot
                # create variables only for feasible time slots
                for t in range(ev.arrival_slot, min(ev.departure_slot, horizon)):
                    key = (ev.ev_id, charger_id, t)
                    vars[key] = model.NewBoolVar(f"x_{ev.ev_id}_{charger_id}_{t}")

        # Constraints
        # C: charger capacity: one EV per charger per slot
        for charger_id in data["chargers"]:
            for t in range(horizon):
                terms = []
                for ev in data["evs"]:
                    key = (ev.ev_id, charger_id, t)
                    if key in vars:
                        terms.append(vars[key])
                if terms:
                    model.Add(sum(terms) <= 1)

        # D: EV single charger at a time
        for ev in data["evs"]:
            for t in range(horizon):
                terms = []
                for charger_id in data["chargers"]:
                    key = (ev.ev_id, charger_id, t)
                    if key in vars:
                        terms.append(vars[key])
                if terms:
                    model.Add(sum(terms) <= 1)

        # F: Energy requirement per EV
        for ev in data["evs"]:
            req_energy = 0.0
            # find request for ev
            for r in sim.requests:
                if r.ev_id == ev.ev_id:
                    req_energy = r.energy_required_kwh
                    break
            # sum energy across vars
            terms = []
            coeffs = []
            for (e_id, charger_id, t), var in vars.items():
                if e_id != ev.ev_id:
                    continue
                energy = energy_slot_cache.get((e_id, charger_id), 0.0)
                if energy > 0:
                    # scale to integer
                    coeff = int(round(energy * self.scale))
                    terms.append(var)
                    coeffs.append(coeff)
            if terms:
                # lower bound: must receive at least required energy
                model.Add(sum(var * coeff for var, coeff in zip(terms, coeffs)) >= int(round(req_energy * self.scale)))
                # upper bound: avoid materially oversupplying — allow at most one slot worth of slack
                max_slot_energy = 0
                for vcoef in coeffs:
                    max_slot_energy = max(max_slot_energy, vcoef)
                slack = int(round(max_slot_energy))
                upper = int(round(req_energy * self.scale)) + slack
                model.Add(sum(var * coeff for var, coeff in zip(terms, coeffs)) <= upper)
            else:
                # no feasible allocation
                # infeasible immediately
                return OptimisationResult(
                    solver_status="INFEASIBLE",
                    objective_value=0.0,
                    charging_plan=[],
                    total_energy_delivered=0.0,
                    total_cost=0.0,
                    total_carbon=0.0,
                    renewable_energy_used=0.0,
                    congestion_score=0.0,
                    reliability_score=0.0,
                    unscheduled_ev_ids=[ev.ev_id],
                    solver_runtime_seconds=time.time() - start_time,
                    metadata={"reason": "no feasible charger slots for EV"},
                )

        # Objective: linear sum over variables with scaled integer coefficients
        objective_terms = []

        # Precompute per (charger_id, t) station-level signals
        station_tariff = {}
        station_carbon = {}
        station_renewable = {}
        station_congestion = {}
        station_reliability = {}
        station_states = data.get("station_states", {})
        for charger_id, st_id in data["charger_to_station"].items():
            tariffs = data["tariffs"].get(st_id, [0.0] * horizon)
            for t in range(horizon):
                station_tariff[(charger_id, t)] = tariffs[t] if t < len(tariffs) else tariffs[-1]
                station_carbon[(charger_id, t)] = data["carbon"][t] if t < len(data["carbon"]) else data["carbon"][-1]
                station_renewable[(charger_id, t)] = (
                    data["renewable"][t]
                    if t < len(data["renewable"])
                    else data["renewable"][-1]
                )
                st_state = station_states.get(st_id)
                station_congestion[(charger_id, t)] = getattr(st_state, "congestion", 0.0)
                # fallback to station static reliability_score when station_state missing
                fallback_rel = 1.0
                st_obj = data["stations"].get(st_id)
                if st_obj is not None:
                    fallback_rel = getattr(st_obj, "reliability_score", 1.0)
                station_reliability[(charger_id, t)] = getattr(st_state, "reliability", fallback_rel)

        # For urgency, compute slack per EV
        ev_slack = {}
        for ev in data["evs"]:
            ev_slack[ev.ev_id] = max(1, ev.departure_slot - ev.arrival_slot)

        for (e_id, charger_id, t), var in vars.items():
            energy = energy_slot_cache.get((e_id, charger_id), 0.0)
            # cost component
            cost = station_tariff.get((charger_id, t), 0.0) * energy
            carbon = station_carbon.get((charger_id, t), 0.0) * energy
            renewable = station_renewable.get((charger_id, t), 0.0) * energy
            station = data["stations"].get(data["charger_to_station"].get(charger_id))
            congestion = station_congestion.get((charger_id, t), 0.0)
            fallback_rel = 1.0
            if station is not None:
                fallback_rel = getattr(station, "reliability_score", 1.0)
            reliability = station_reliability.get((charger_id, t), fallback_rel)
            urgency_factor = 1.0 / ev_slack.get(e_id, 1)

            # combine weights (note: some weights are negative to represent reward)
            val = (
                weights.cost * cost
                + weights.carbon * carbon
                + weights.congestion * congestion * energy
                + weights.reliability * (reliability) * energy
                + weights.renewable * renewable
                + weights.urgency * urgency_factor * energy
            )
            coeff = int(round(val * self.scale))
            objective_terms.append((var, coeff))

        # expose last objective integer coefficients for testing/inspection
        try:
            self._last_objective_coeffs = [int(coeff) for _, coeff in objective_terms]
        except Exception:
            self._last_objective_coeffs = []

        model.Minimize(sum(var * coeff for var, coeff in objective_terms))

        status = solver.Solve(model)
        runtime = time.time() - start_time

        status_map = {
            cp_model.OPTIMAL: "OPTIMAL",
            cp_model.FEASIBLE: "FEASIBLE",
            cp_model.INFEASIBLE: "INFEASIBLE",
            cp_model.UNKNOWN: "UNKNOWN",
        }

        solver_status = status_map.get(status, "UNKNOWN")

        # Extract plan only if solver provides a feasible/optimal solution
        plan_items = []
        total_energy = 0.0
        total_cost = 0.0
        total_carbon = 0.0
        renewable_used = 0.0

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            for (e_id, charger_id, t), var in vars.items():
                if solver.Value(var) == 1:
                    energy = energy_slot_cache.get((e_id, charger_id), 0.0)
                    station_id = data["charger_to_station"].get(charger_id)
                    tariff = station_tariff.get((charger_id, t), 0.0)
                    carbon = station_carbon.get((charger_id, t), 0.0)
                    renewable = station_renewable.get((charger_id, t), 0.0)
                    item = ChargingPlanItem(
                        ev_id=e_id,
                        station_id=station_id,
                        charger_id=charger_id,
                        time_slot=t,
                        power_kw=energy / slot_hours,
                        energy_kwh=energy,
                        tariff=tariff,
                        carbon_intensity=carbon,
                        renewable_availability=renewable,
                    )
                    plan_items.append(item)
                    total_energy += energy
                    total_cost += tariff * energy
                    total_carbon += carbon * energy
                    renewable_used += renewable * energy

        # unscheduled EVs
        delivered = {}
        for it in plan_items:
            delivered[it.ev_id] = delivered.get(it.ev_id, 0.0) + it.energy_kwh
        unscheduled = [r.ev_id for r in sim.requests if delivered.get(r.ev_id, 0.0) + 1e-6 < r.energy_required_kwh]

        res = OptimisationResult(
            solver_status=solver_status,
            objective_value=float(solver.ObjectiveValue()) if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else 0.0,
            charging_plan=plan_items,
            total_energy_delivered=total_energy,
            total_cost=total_cost,
            total_carbon=total_carbon,
            renewable_energy_used=renewable_used,
            congestion_score=0.0,
            reliability_score=0.0,
            unscheduled_ev_ids=unscheduled,
            solver_runtime_seconds=runtime,
            metadata={"status_code": status},
        )

        # independent validation
        v_errors = validate_plan(sim, res)
        if v_errors:
            res.metadata["validation_errors"] = v_errors

        return res

    # Backwards-compatible API: solve(ScheduleRequest) -> ScheduleResult
    def solve(self, request):
        from intelligence.optimiser.models import ScheduleResult, ScheduleStatus

        # basic validation
        if getattr(request, "horizon_slots", 0) <= 0:
            return ScheduleResult(status=ScheduleStatus.MODEL_INVALID)

        if not getattr(request, "evs", None):
            return ScheduleResult(status=ScheduleStatus.OPTIMAL, total_energy_kwh=0.0)

        # For more complex ScheduleRequest conversions, the modern `optimise(sim)` API
        # should be used. Here we return MODEL_INVALID to indicate unsupported.
        return ScheduleResult(status=ScheduleStatus.UNKNOWN)


def optimise(
    sim: SimulationState,
    *,
    time_limit_seconds: float = 10,
    num_workers: int = 4,
    scale: int = 1000,
    weights=None,
):
    """Convenience function: create scheduler and run optimisation."""
    scheduler = CPSATScheduler(
        time_limit_seconds=time_limit_seconds, num_workers=num_workers, scale=scale
    )
    return scheduler.optimise(sim, weights=weights)
