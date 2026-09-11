"""Protocols and interfaces for the GreenVoltz mathematical scheduler."""

from typing import Protocol

from intelligence.optimiser.models import ScheduleRequest, ScheduleResult


class BaseScheduler(Protocol):
    """Abstract interface to be implemented by charging schedule solvers."""

    def solve(self, request: ScheduleRequest) -> ScheduleResult:
        """Execute optimisation algorithm for given EV requests and grid constraints.

        Args:
            request: Formal schedule input specification.

        Returns:
            ScheduleResult detailing power allocations, objective values, and solver status.
        """
        ...
