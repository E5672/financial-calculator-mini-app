from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    origin_name = Column(String, nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    destination_name = Column(String, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lon = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    weight_tons = Column(Float, nullable=False)
    required_accreditations = Column(JSON, default=list)
    priority = Column(Integer, default=3, nullable=False)
    status = Column(
        Enum("pending", "assigned", "in_progress", "completed", "cancelled", name="route_status"),
        default="pending",
        nullable=False
    )
    source = Column(
        Enum("import", "manual", name="route_source"),
        default="manual",
        nullable=False
    )
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assignments = relationship("Assignment", back_populates="route")
