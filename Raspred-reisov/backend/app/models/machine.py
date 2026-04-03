from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    plate_number = Column(String, unique=True, nullable=False)
    status = Column(
        Enum("available", "in_route", "maintenance", name="machine_status"),
        default="available",
        nullable=False
    )
    capacity_tons = Column(Float, nullable=False)
    gps_lat = Column(Float, nullable=False, default=55.75)
    gps_lon = Column(Float, nullable=False, default=37.62)
    accreditations = Column(JSON, default=list)
    restrictions = Column(JSON, default=list)
    maintenance_status = Column(
        Enum("available", "in_service", "blocked", name="maintenance_status_enum"),
        default="available",
        nullable=False
    )
    release_permission = Column(
        Enum("allowed", "forbidden", name="release_permission_enum"),
        default="allowed",
        nullable=False
    )
    forbidden_reason = Column(String, nullable=True)
    forbidden_by = Column(String, nullable=True)
    forbidden_at = Column(DateTime, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assignments = relationship("Assignment", back_populates="machine")
