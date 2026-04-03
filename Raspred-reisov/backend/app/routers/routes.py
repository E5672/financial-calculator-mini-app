from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.route import Route
from ..schemas.route import RouteRead, RouteCreate, RouteImport
from ..ws.manager import manager

router = APIRouter(prefix="/api/routes", tags=["routes"])


@router.get("", response_model=List[RouteRead])
def list_routes(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Return all routes, optionally filtered by status."""
    query = db.query(Route)
    if status:
        query = query.filter(Route.status == status)
    return query.order_by(Route.priority.desc(), Route.profit.desc()).all()


@router.get("/{route_id}", response_model=RouteRead)
def get_route(route_id: int, db: Session = Depends(get_db)):
    route = db.get(Route, route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Маршрут не найден")
    return route


@router.post("", response_model=RouteRead, status_code=201)
async def create_route(body: RouteCreate, db: Session = Depends(get_db)):
    """Add a single route manually."""
    now = datetime.utcnow()
    route = Route(
        **body.model_dump(),
        status="pending",
        version=1,
        created_at=now,
        updated_at=now,
    )
    db.add(route)
    db.commit()
    db.refresh(route)

    await manager.broadcast({
        "event": "route_created",
        "route_id": route.id,
    })
    return route


@router.post("/import", response_model=List[RouteRead], status_code=201)
async def import_routes(body: RouteImport, db: Session = Depends(get_db)):
    """Bulk import routes (simulates Excel/calculator import)."""
    created = []
    now = datetime.utcnow()
    for item in body.routes:
        route = Route(
            **item.model_dump(),
            status="pending",
            version=1,
            created_at=now,
            updated_at=now,
        )
        db.add(route)
        created.append(route)
    db.commit()
    for r in created:
        db.refresh(r)

    await manager.broadcast({
        "event": "routes_imported",
        "count": len(created),
    })
    return created


@router.delete("/{route_id}", status_code=204)
async def delete_route(route_id: int, db: Session = Depends(get_db)):
    """Remove a pending route."""
    route = db.get(Route, route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Маршрут не найден")
    if route.status not in ("pending", "cancelled"):
        raise HTTPException(
            status_code=400,
            detail="Нельзя удалить маршрут в статусе: " + route.status
        )
    db.delete(route)
    db.commit()

    await manager.broadcast({
        "event": "route_deleted",
        "route_id": route_id,
    })
