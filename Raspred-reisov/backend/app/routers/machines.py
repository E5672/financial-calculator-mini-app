from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.machine import Machine
from ..models.assignment import Assignment
from ..schemas.machine import MachineRead, MachineUpdate, MachineReleasePermission
from ..schemas.assignment import AssignmentRead
from ..ws.manager import manager

router = APIRouter(prefix="/api/machines", tags=["machines"])


@router.get("", response_model=List[MachineRead])
def list_machines(db: Session = Depends(get_db)):
    """Return all machines with current status."""
    return db.query(Machine).all()


@router.get("/{machine_id}", response_model=MachineRead)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    """Return single machine details."""
    machine = db.get(Machine, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Машина не найдена")
    return machine


@router.put("/{machine_id}", response_model=MachineRead)
async def update_machine(
    machine_id: int,
    update: MachineUpdate,
    db: Session = Depends(get_db)
):
    """Update machine fields (status, position, maintenance, etc.)."""
    machine = db.get(Machine, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Машина не найдена")

    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(machine, field, value)

    machine.version += 1
    machine.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(machine)

    await manager.broadcast({
        "event": "machine_updated",
        "machine_id": machine.id,
        "data": {
            "id": machine.id,
            "name": machine.name,
            "status": machine.status,
            "gps_lat": machine.gps_lat,
            "gps_lon": machine.gps_lon,
            "maintenance_status": machine.maintenance_status,
            "release_permission": machine.release_permission,
            "version": machine.version,
        }
    })

    return machine


@router.post("/{machine_id}/release-permission", response_model=MachineRead)
async def set_release_permission(
    machine_id: int,
    body: MachineReleasePermission,
    db: Session = Depends(get_db)
):
    """Mechanic sets whether machine is allowed or forbidden for release."""
    machine = db.get(Machine, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Машина не найдена")

    machine.release_permission = body.permission
    if body.permission == "forbidden":
        machine.forbidden_reason = body.reason
        machine.forbidden_by = body.set_by
        machine.forbidden_at = datetime.utcnow()
    else:
        machine.forbidden_reason = None
        machine.forbidden_by = None
        machine.forbidden_at = None

    machine.version += 1
    machine.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(machine)

    await manager.broadcast({
        "event": "machine_updated",
        "machine_id": machine.id,
        "data": {
            "id": machine.id,
            "release_permission": machine.release_permission,
            "forbidden_reason": machine.forbidden_reason,
            "forbidden_by": machine.forbidden_by,
            "version": machine.version,
        }
    })

    return machine


@router.get("/{machine_id}/assignments", response_model=List[AssignmentRead])
def get_machine_assignments(machine_id: int, db: Session = Depends(get_db)):
    """Return assignment history for a machine."""
    machine = db.get(Machine, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Машина не найдена")

    assignments = (
        db.query(Assignment)
        .filter(Assignment.machine_id == machine_id)
        .order_by(Assignment.created_at.desc())
        .all()
    )
    return assignments
