from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_max_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 bytes (bcrypt limit)")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_max_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 bytes (bcrypt limit)")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


AllowedRole = Literal[
    "Physician", "Pathologist", "Researcher", "Lab Staff", "Student / Trainee", "Other"
]


class ProfileOut(BaseModel):
    full_name: str
    email: str
    role: Optional[str] = None
    organization_name: Optional[str] = None
    organization_id: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    intended_use: Optional[str] = None
    onboarding_completed: bool
    org_fields_locked: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    role: AllowedRole
    organization_name: Optional[str] = None
    organization_id: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    intended_use: Optional[str] = None


class OrgLock(BaseModel):
    organization_name: Optional[str] = None
    organization_id: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    intended_use: Optional[str] = None


class ImageOut(BaseModel):
    id: int
    content_type: str
    file_size: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AlgorithmOut(BaseModel):
    id: int
    name: str
    display_name: str
    description: str
    version: str

    model_config = {"from_attributes": True}


class JobCreate(BaseModel):
    image_id: int
    algorithm_name: str


class JobOut(BaseModel):
    id: int
    image_id: int
    owner_id: int
    algorithm_name: str
    status: str
    result_summary: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
