from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum
from .machine import MachineRead
from .route import RouteRead


class AssignmentStatusEnum(str, Enum):
    proposed = "proposed"
    confirmed = "confirmed"
    rejected = "rejected"
    in_progress = "in_progress"
    completed = "completed"


class AssignmentRead(BaseModel):
    id: int
    machine_id: int
    route_id: int
    machine: Optional[MachineRead] = None
    route: Optional[RouteRead] = None
    status: AssignmentStatusEnum
    total_score: float
    distance_score: float
    profit_score: float
    restriction_score: float
    priority_score: float
    stability_score: float
    alternative_rank: int
    locked_by: Optional[str] = None
    locked_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    version: int
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AssignmentLock(BaseModel):
    user_name: str


class AssignmentConfirm(BaseModel):
    user_name: str
    expected_version: int
    notes: Optional[str] = None


class AssignmentReject(BaseModel):
    user_name: str
    reason: Optional[str] = None
