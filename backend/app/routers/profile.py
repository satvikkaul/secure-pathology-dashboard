from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/profile", tags=["profile"])

# Fields frozen by the one-time org lock. Must match schemas.OrgContext.
# `role` is deliberately absent so it stays editable after locking.
ORG_FIELDS = frozenset(schemas.OrgContext.model_fields)


def _apply(user: models.User, data: dict) -> None:
    for field, value in data.items():
        setattr(user, field, value)


@router.get("/me", response_model=schemas.ProfileOut)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.ProfileOut)
def update_profile(
    body: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = body.model_dump(exclude_unset=True)
    # Only reject if the payload actually touches a locked org field; role and
    # other updates stay allowed even after the lock.
    if current_user.org_fields_locked and ORG_FIELDS & data.keys():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organisation context is locked. Contact an administrator to request changes.",
        )
    _apply(current_user, data)
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
    # Locking before onboarding would brick the account: the lock blocks the
    # only setter (PUT /me), so onboarding could never complete afterwards.
    if not current_user.onboarding_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete onboarding before locking organisation context.",
        )
    if current_user.org_fields_locked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organisation context is already locked.",
        )
    _apply(current_user, body.model_dump(exclude_unset=True))
    current_user.org_fields_locked = True
    db.commit()
    db.refresh(current_user)
    return current_user
