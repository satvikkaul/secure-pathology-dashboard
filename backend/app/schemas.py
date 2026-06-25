from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


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
