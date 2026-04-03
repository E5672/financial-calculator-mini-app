from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RouteStatusEnum(str, Enum):
    pending = "pending"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class RouteSourceEnum(str, Enum):
    import_src = "import"
    manual = "manual"


class RouteRead(BaseModel):
    id: int
    name: str
    origin_name: str
    origin_lat: float
    origin_lon: float
    destination_name: str
    destination_lat: float
    destination_lon: float
    distance_km: float
    profit: float
    weight_tons: float
    required_accreditations: List[str]
    priority: int
    status: RouteStatusEnum
    source: str
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RouteCreate(BaseModel):
    name: str
    origin_name: str
    origin_lat: float
    origin_lon: float
    destination_name: str
    destination_lat: float
    destination_lon: float
    distance_km: float
    profit: float
    weight_tons: float
    required_accreditations: List[str] = []
    priority: int = 3
    source: str = "manual"


class RouteImport(BaseModel):
    routes: List[RouteCreate]
