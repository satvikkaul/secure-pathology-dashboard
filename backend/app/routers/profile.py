from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=schemas.ProfileOut)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.ProfileOut)
def update_profile(
    body: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.org_fields_locked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organisation context is locked. Contact an administrator to request changes.",
        )
    for field, value in body.model_dump().items():
        setattr(current_user, field, value)
    current_user.onboarding_completed = True
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/lock-org", response_model=schemas.ProfileOut)
def lock_org(
    body: schemas.OrgLock,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.org_fields_locked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organisation context is already locked.",
        )
    for field, value in body.model_dump().items():
        setattr(current_user, field, value)
    current_user.org_fields_locked = True
    db.commit()
    db.refresh(current_user)
    return current_user
