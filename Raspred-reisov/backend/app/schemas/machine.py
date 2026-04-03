from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MachineStatusEnum(str, Enum):
    available = "available"
    in_route = "in_route"
    maintenance = "maintenance"


class MaintenanceStatusEnum(str, Enum):
    available = "available"
    in_service = "in_service"
    blocked = "blocked"


class ReleasePermissionEnum(str, Enum):
    allowed = "allowed"
    forbidden = "forbidden"


class MachineRead(BaseModel):
    id: int
    name: str
    plate_number: str
    status: MachineStatusEnum
    capacity_tons: float
    gps_lat: float
    gps_lon: float
    accreditations: List[str]
    restrictions: List[str]
    maintenance_status: MaintenanceStatusEnum
    release_permission: ReleasePermissionEnum
    forbidden_reason: Optional[str] = None
    forbidden_by: Optional[str] = None
    forbidden_at: Optional[datetime] = None
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MachineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[MachineStatusEnum] = None
    capacity_tons: Optional[float] = None
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    accreditations: Optional[List[str]] = None
    restrictions: Optional[List[str]] = None
    maintenance_status: Optional[MaintenanceStatusEnum] = None


class MachineReleasePermission(BaseModel):
    permission: ReleasePermissionEnum
    reason: Optional[str] = None
    set_by: str
