from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from ..database import get_db
from ..models.assignment import Assignment
from ..schemas.assignment import AssignmentRead, AssignmentLock, AssignmentConfirm, AssignmentReject
from ..services.assignment_service import (
    lock_assignment, unlock_assignment,
    confirm_assignment, reject_assignment,
    compute_assignments, LockConflictError, VersionConflictError
)
from ..ws.manager import manager

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.get("", response_model=List[AssignmentRead])
def list_assignments(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Return all assignments with machine and route details."""
    query = db.query(Assignment).options(
        joinedload(Assignment.machine),
        joinedload(Assignment.route),
    )
    if status:
        query = query.filter(Assignment.status == status)
    return query.order_by(
        Assignment.alternative_rank.asc(),
        Assignment.total_score.desc()
    ).all()


@router.post("/compute", response_model=List[AssignmentRead])
async def compute(db: Session = Depends(get_db)):
    """Run scoring engine: clear old proposals, create new ones."""
    assignments = await compute_assignments(db)

    # Reload with relations
    result = db.query(Assignment).options(
        joinedload(Assignment.machine),
        joinedload(Assignment.route),
    ).filter(Assignment.status == "proposed").all()

    await manager.broadcast({
        "event": "assignments_computed",
        "count": len(result),
    })
    return result


@router.post("/{assignment_id}/lock", response_model=AssignmentRead)
async def lock(
    assignment_id: int,
    body: AssignmentLock,
    db: Session = Depends(get_db)
):
    """Soft-lock assignment for editing. Raises 409 if locked by another user."""
    try:
        assignment = await lock_assignment(assignment_id, body.user_name, db)
    except LockConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    db.refresh(assignment)
    await manager.broadcast({
        "event": "assignment_locked",
        "assignment_id": assignment_id,
        "locked_by": body.user_name,
        "expires_at": assignment.expires_at.isoformat() if assignment.expires_at else None,
    })
    return assignment


@router.post("/{assignment_id}/unlock", response_model=AssignmentRead)
async def unlock(
    assignment_id: int,
    body: AssignmentLock,
    db: Session = Depends(get_db)
):
    """Release soft lock."""
    try:
        assignment = await unlock_assignment(assignment_id, body.user_name, db)
    except LockConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    await manager.broadcast({
        "event": "assignment_unlocked",
        "assignment_id": assignment_id,
    })
    return assignment


@router.post("/{assignment_id}/confirm", response_model=AssignmentRead)
async def confirm(
    assignment_id: int,
    body: AssignmentConfirm,
    db: Session = Depends(get_db)
):
    """Confirm assignment. Checks version and lock ownership."""
    try:
        assignment = await confirm_assignment(
            assignment_id, body.user_name, body.expected_version, body.notes, db
        )
    except VersionConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except LockConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Reload with relations
    db.refresh(assignment)
    await manager.broadcast({
        "event": "assignment_confirmed",
        "assignment_id": assignment_id,
        "machine_id": assignment.machine_id,
        "route_id": assignment.route_id,
    })
    return assignment


@router.post("/{assignment_id}/reject", response_model=AssignmentRead)
async def reject(
    assignment_id: int,
    body: AssignmentReject,
    db: Session = Depends(get_db)
):
    """Reject a proposed assignment."""
    try:
        assignment = await reject_assignment(
            assignment_id, body.user_name, body.reason, db
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    await manager.broadcast({
        "event": "assignment_rejected",
        "assignment_id": assignment_id,
    })
    return assignment
