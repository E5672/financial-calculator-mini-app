from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.assignment import Assignment
from ..models.machine import Machine
from ..models.route import Route
from .scoring import calculate_assignments

LOCK_DURATION_MINUTES = 3


class LockConflictError(Exception):
    """Raised when an assignment is locked by another user."""
    pass


class VersionConflictError(Exception):
    """Raised when optimistic concurrency check fails."""
    pass


async def lock_assignment(assignment_id: int, user_name: str, db: Session) -> Assignment:
    """
    Soft lock an assignment for the given user.
    Raises LockConflictError if locked by another user with unexpired lock.
    """
    assignment = db.get(Assignment, assignment_id)
    if assignment is None:
        raise ValueError(f"Assignment {assignment_id} not found")

    now = datetime.utcnow()

    # Check if locked by someone else with active lock
    if assignment.locked_by and assignment.locked_by != user_name:
        if assignment.expires_at and assignment.expires_at > now:
            remaining = int((assignment.expires_at - now).total_seconds())
            raise LockConflictError(
                f"Заблокировано пользователем {assignment.locked_by}. "
                f"Истекает через {remaining} сек."
            )

    # Acquire or refresh lock
    assignment.locked_by = user_name
    assignment.locked_at = now
    assignment.expires_at = now + timedelta(minutes=LOCK_DURATION_MINUTES)
    assignment.updated_at = now
    db.commit()
    db.refresh(assignment)
    return assignment


async def unlock_assignment(assignment_id: int, user_name: str, db: Session) -> Assignment:
    """Release lock on assignment if owned by the user."""
    assignment = db.get(Assignment, assignment_id)
    if assignment is None:
        raise ValueError(f"Assignment {assignment_id} not found")

    if assignment.locked_by and assignment.locked_by != user_name:
        raise LockConflictError(f"Нельзя снять блокировку: заблокировано пользователем {assignment.locked_by}")

    assignment.locked_by = None
    assignment.locked_at = None
    assignment.expires_at = None
    assignment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assignment)
    return assignment


async def confirm_assignment(
    assignment_id: int,
    user_name: str,
    expected_version: int,
    notes: str | None,
    db: Session
) -> Assignment:
    """
    Confirm an assignment with optimistic concurrency check.
    Raises VersionConflictError if another user modified the record.
    Raises LockConflictError if not locked by the confirming user.
    """
    assignment = db.get(Assignment, assignment_id)
    if assignment is None:
        raise ValueError(f"Assignment {assignment_id} not found")

    # Optimistic concurrency check
    if assignment.version != expected_version:
        raise VersionConflictError(
            "Назначение было изменено другим пользователем. Пожалуйста, обновите страницу."
        )

    # Check lock ownership
    now = datetime.utcnow()
    if assignment.locked_by != user_name:
        if assignment.locked_by and assignment.expires_at and assignment.expires_at > now:
            raise LockConflictError(
                f"Назначение заблокировано пользователем {assignment.locked_by}"
            )

    # Mark route as assigned
    route = db.get(Route, assignment.route_id)
    if route:
        route.status = "assigned"
        route.version += 1
        route.updated_at = now

    # Mark machine as in_route
    machine = db.get(Machine, assignment.machine_id)
    if machine:
        machine.status = "in_route"
        machine.version += 1
        machine.updated_at = now

    # Confirm assignment
    assignment.status = "confirmed"
    assignment.version += 1
    assignment.locked_by = None
    assignment.locked_at = None
    assignment.expires_at = None
    assignment.updated_at = now
    if notes:
        assignment.notes = notes

    db.commit()
    db.refresh(assignment)
    return assignment


async def reject_assignment(
    assignment_id: int,
    user_name: str,
    reason: str | None,
    db: Session
) -> Assignment:
    """Reject a proposed assignment."""
    assignment = db.get(Assignment, assignment_id)
    if assignment is None:
        raise ValueError(f"Assignment {assignment_id} not found")

    now = datetime.utcnow()
    assignment.status = "rejected"
    assignment.version += 1
    assignment.locked_by = None
    assignment.locked_at = None
    assignment.expires_at = None
    assignment.updated_at = now
    if reason:
        assignment.notes = reason

    db.commit()
    db.refresh(assignment)
    return assignment


async def compute_assignments(db: Session) -> list[Assignment]:
    """
    Run the scoring engine on all pending routes and available machines.
    Clear old proposed assignments first, then create new ones.
    """
    # Remove old proposed assignments (not confirmed/in_progress)
    old_proposed = db.query(Assignment).filter(
        Assignment.status == "proposed"
    ).all()
    for a in old_proposed:
        db.delete(a)
    db.commit()

    # Fetch pending routes and available machines
    routes = db.query(Route).filter(Route.status == "pending").all()
    machines = db.query(Machine).all()

    if not routes or not machines:
        return []

    # Run scoring engine
    scored_options = calculate_assignments(routes, machines)

    # Persist results
    new_assignments = []
    for option in scored_options:
        assignment = Assignment(
            machine_id=option.machine.id,
            route_id=option.route.id,
            status="proposed",
            total_score=option.total_score,
            distance_score=option.distance_score,
            profit_score=option.profit_score,
            restriction_score=option.restriction_score,
            priority_score=option.priority_score,
            stability_score=option.stability_score,
            alternative_rank=option.alternative_rank,
            version=1,
        )
        db.add(assignment)
        new_assignments.append(assignment)

    db.commit()
    for a in new_assignments:
        db.refresh(a)

    return new_assignments
