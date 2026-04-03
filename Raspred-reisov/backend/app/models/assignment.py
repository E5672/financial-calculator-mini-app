from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    status = Column(
        Enum("proposed", "confirmed", "rejected", "in_progress", "completed", name="assignment_status"),
        default="proposed",
        nullable=False
    )
    total_score = Column(Float, default=0.0)
    distance_score = Column(Float, default=0.0)
    profit_score = Column(Float, default=0.0)
    restriction_score = Column(Float, default=0.0)
    priority_score = Column(Float, default=0.0)
    stability_score = Column(Float, default=0.0)
    alternative_rank = Column(Integer, default=0)
    locked_by = Column(String, nullable=True)
    locked_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    machine = relationship("Machine", back_populates="assignments")
    route = relationship("Route", back_populates="assignments")
