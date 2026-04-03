from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, SessionLocal, Base
from .models import machine, route, assignment, user  # noqa: ensure models are registered
from .routers import machines, routes, assignments
from .ws.manager import manager


def seed_if_empty():
    """Seed the database with test data if tables are empty."""
    db = SessionLocal()
    try:
        from .models.machine import Machine
        if db.query(Machine).count() == 0:
            import subprocess, sys
            subprocess.run(
                [sys.executable, "seed_data.py"],
                cwd=".",
                capture_output=True
            )
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Seed data if DB is empty
    db = SessionLocal()
    try:
        from .models.machine import Machine
        if db.query(Machine).count() == 0:
            from seed_data import run_seed
            run_seed(db)
    except Exception:
        pass
    finally:
        db.close()
    yield


app = FastAPI(
    title="Logistics Assistant API",
    version="1.0.0",
    description="Система автоматического распределения рейсов",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(machines.router)
app.include_router(routes.router)
app.include_router(assignments.router)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo ping/pong to keep connection alive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Logistics Assistant API"}
