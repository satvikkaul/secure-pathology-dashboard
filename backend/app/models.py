from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Profile / onboarding fields (Phase 2A)
    role = Column(String, nullable=True)
    organization_name = Column(String, nullable=True)
    organization_id = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    department = Column(String, nullable=True)
    intended_use = Column(String, nullable=True)
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    org_fields_locked = Column(Boolean, default=False, nullable=False)

    images = relationship("Image", back_populates="owner")
    jobs = relationship("AlgorithmJob", back_populates="owner")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stored_filename = Column(String, nullable=False)  # UUID-based; original name never stored
    content_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="images")
    jobs = relationship("AlgorithmJob", back_populates="image")


class Algorithm(Base):
    __tablename__ = "algorithms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    version = Column(String, nullable=False)


class AlgorithmJob(Base):
    __tablename__ = "algorithm_jobs"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    algorithm_name = Column(String, nullable=False)
    status = Column(String, default="pending", nullable=False)
    result_summary = Column(Text, nullable=True)  # JSON string; inline per DECISIONS.md
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    image = relationship("Image", back_populates="jobs")
    owner = relationship("User", back_populates="jobs")
