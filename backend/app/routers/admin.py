import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_db, require_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/pending", response_model=list[schemas.PendingUser])
def list_pending(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Users awaiting approval, so the admin knows whom to approve."""
    return (
        db.query(models.User)
        .filter(models.User.is_approved.is_(False), models.User.is_admin.is_(False))
        .order_by(models.User.created_at.desc())
        .all()
    )


@router.post("/approve", response_model=schemas.PendingUser)
def approve_user(
    body: schemas.ApproveRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_approved:
        raise HTTPException(status_code=409, detail="User is already approved")

    user.is_approved = True
    user.approved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    # ponytail: stubbed confirmation email — logged, not sent. Swap for a real
    # SMTP send once the app is deployed and has mail credentials.
    logger.info(
        "EMAIL -> %s: Your Secure Pathology Dashboard account has been approved. "
        "You can now sign in.",
        user.email,
    )
    return user
