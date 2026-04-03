from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from datetime import datetime
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(
        Enum("logist", "mechanic", "dispatcher", name="user_role"),
        nullable=False
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
