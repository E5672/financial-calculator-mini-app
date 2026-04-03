import math
from dataclasses import dataclass
from typing import List
from ..models.machine import Machine
from ..models.route import Route


@dataclass
class ScoredOption:
    machine: Machine
    route: Route
    total_score: float
    distance_score: float
    profit_score: float
    restriction_score: float
    priority_score: float
    stability_score: float
    alternative_rank: int = 0


def calc_distance(machine: Machine, route: Route) -> float:
    """Calculate Euclidean distance approximation in km."""
    dlat = machine.gps_lat - route.origin_lat
    dlon = machine.gps_lon - route.origin_lon
    return math.sqrt(dlat ** 2 + dlon ** 2) * 111.0


def passes_hard_filters(machine: Machine, route: Route) -> bool:
    """Check hard constraints that must be satisfied for assignment."""
    # Machine must be operationally available
    if machine.status != "available":
        return False
    # Mechanic must allow release
    if machine.release_permission == "forbidden":
        return False
    # Capacity must be sufficient
    if machine.capacity_tons < route.weight_tons:
        return False
    # All required accreditations must be present
    machine_accreditations = machine.accreditations or []
    for req in (route.required_accreditations or []):
        if req not in machine_accreditations:
            return False
    return True


def calc_restriction_score(machine: Machine, route: Route) -> float:
    """
    Score based on soft restrictions.
    Returns 1.0 if no conflicts, decreases for each conflict.
    For MVP: all hard requirements already filtered, so returns 1.0 by default.
    Soft restrictions (machine.restrictions) may degrade the score.
    """
    machine_restrictions = machine.restrictions or []
    if not machine_restrictions:
        return 1.0
    # If machine has restrictions that conflict with route requirements
    # Each restriction reduces score by 0.2
    conflicts = len(machine_restrictions)
    score = max(0.0, 1.0 - conflicts * 0.1)
    return score


def calc_stability_score(machine: Machine) -> float:
    """Higher score for machines that are stable and available."""
    if machine.maintenance_status == "available":
        return 1.0
    elif machine.maintenance_status == "in_service":
        return 0.3
    return 0.0


def calculate_assignments(routes: List[Route], machines: List[Machine]) -> List[ScoredOption]:
    """
    Main scoring engine. For each pending route, find valid machines and score them.
    Returns list of ScoredOption objects sorted by total_score descending.
    Top result per route = main proposal (alternative_rank=0), next 2 are alternatives.
    """
    all_results: List[ScoredOption] = []

    for route in routes:
        # Stage 1: Hard filters
        valid_machines = [m for m in machines if passes_hard_filters(m, route)]
        if not valid_machines:
            continue

        # Stage 2: Calculate distances from machine current position to route origin
        distances = [calc_distance(m, route) for m in valid_machines]
        max_dist = max(distances) if max(distances) > 0 else 1.0

        # Stage 3: Compute scores for each valid machine
        route_results: List[ScoredOption] = []
        for i, machine in enumerate(valid_machines):
            dist = distances[i]

            distance_score = 1.0 - (dist / max_dist)
            profit_score = 1.0  # normalized per route; all machines get same profit potential
            restriction_score = calc_restriction_score(machine, route)
            priority_score = (route.priority - 1) / 4.0  # priority 1-5 -> 0.0-1.0
            stability_score = calc_stability_score(machine)

            total = (
                0.40 * distance_score +
                0.25 * profit_score +
                0.20 * restriction_score +
                0.10 * priority_score +
                0.05 * stability_score
            )

            route_results.append(ScoredOption(
                machine=machine,
                route=route,
                total_score=round(total, 4),
                distance_score=round(distance_score, 4),
                profit_score=round(profit_score, 4),
                restriction_score=round(restriction_score, 4),
                priority_score=round(priority_score, 4),
                stability_score=round(stability_score, 4),
            ))

        # Sort by total score descending
        route_results.sort(key=lambda x: x.total_score, reverse=True)

        # Assign ranks: 0 = main proposal, 1 and 2 = alternatives
        for rank, option in enumerate(route_results[:3]):
            option.alternative_rank = rank
            all_results.append(option)

    return all_results
