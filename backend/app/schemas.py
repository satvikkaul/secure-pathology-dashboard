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


# Must stay in sync with ROLES in frontend/src/pages/OnboardingPage.jsx.
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
    is_approved: bool
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Admin approval gate (Phase 2C) ───────────────────────────────────────────
class PendingUser(BaseModel):
    id: int
    full_name: str
    email: str
    role: Optional[str] = None
    organization_name: Optional[str] = None
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ApproveRequest(BaseModel):
    email: EmailStr


# Shared org-context fields. The lock covers exactly these; `role` (below) is
# intentionally not part of the lock so it stays editable afterwards.
class OrgContext(BaseModel):
    organization_name: Optional[str] = Field(default=None, max_length=200)
    organization_id: Optional[str] = Field(default=None, max_length=100)
    employee_id: Optional[str] = Field(default=None, max_length=100)
    department: Optional[str] = Field(default=None, max_length=200)
    intended_use: Optional[str] = Field(default=None, max_length=2000)


class ProfileUpdate(OrgContext):
    role: AllowedRole


class OrgLock(OrgContext):
    pass


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
    result_type: str
    input_requirements: str
    experimental: bool

    model_config = {"from_attributes": True}


# ── Result envelope ──────────────────────────────────────────────────────────
# Contract for completed-job results stored in AlgorithmJob.result_summary.
# Validated at job-completion time; a bad envelope reuses the failure path.
# See docs/ALGORITHM_RESULT_TEMPLATE_PLAN.md (Appendix A).

class Finding(BaseModel):
    label: str = Field(max_length=200)
    score: Optional[float] = None
    value: Optional[str] = Field(default=None, max_length=200)
    note: Optional[str] = Field(default=None, max_length=200)


class VisualOutput(BaseModel):
    type: str
    status: str = "not_available"  # placeholder entries only in this phase
    note: Optional[str] = None


class ResultEnvelope(BaseModel):
    algorithm_name: str
    algorithm_version: str
    # Plain str by design (not a Literal): unknown values are absorbed safely by
    # the frontend's generic fallback template. Known values are listed in
    # frontend/src/results/registry.js — keep the two in sync.
    result_type: str
    summary: str = Field(max_length=500)
    metrics: dict = {}  # type-specific, free-form; deliberately not validated
    findings: list[Finding] = []
    warnings: list[str] = []
    visual_outputs: list[VisualOutput] = []
    disclaimer: Optional[str] = Field(default=None, max_length=500)
    model_metadata: dict = {}

    # "model_metadata" is part of the envelope contract; opt out of Pydantic's
    # model_* protected-namespace warning for it.
    model_config = {"protected_namespaces": ()}


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
