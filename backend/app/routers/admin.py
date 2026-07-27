import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_db, require_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

_EMAIL_BODY = {
    models.STATUS_APPROVED: (
        "Your Secure Pathology Dashboard account has been approved. You can now sign in."
    ),
    models.STATUS_DECLINED: (
        "Your Secure Pathology Dashboard account request was declined. "
        "You can sign in to review the reason and re-apply."
    ),
}


@router.get("/users", response_model=list[schemas.AdminUser])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Every non-admin account with its current decision state.

    One list rather than a per-status endpoint: the admin needs to approve
    pending users, revisit declined ones, and revoke approved ones from the same
    screen, and a prototype has few enough users to filter client-side.
    """
    return (
        db.query(models.User)
        .filter(models.User.is_admin.is_(False))
        .order_by(models.User.created_at.desc())
        .all()
    )


@router.post("/decide", response_model=schemas.AdminUser)
def decide_user(
    body: schemas.DecisionRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Approve or decline an account, in either direction.

    Approve/decline/revoke/reinstate are the same state transition with a
    different target, so they share one endpoint instead of four near-identical
    handlers.
    """
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        # Guards the seeded superuser against being declined out of its own
        # admin page, which would leave nobody able to approve anyone.
        raise HTTPException(status_code=400, detail="Administrator accounts cannot be decided on")
    if user.status == body.decision:
        raise HTTPException(status_code=409, detail=f"User is already {body.decision}")

    user.status = body.decision
    user.decision_reason = (body.reason or "").strip() or None
    user.decided_at = datetime.now(timezone.utc)

    # A decline usually means "your details are insufficient", so give the user
    # back the ability to fix them — otherwise the org lock makes re-applying
    # pointless, since every edit would 409.
    if body.decision == models.STATUS_DECLINED:
        user.org_fields_locked = False

    db.commit()
    db.refresh(user)

    # ponytail: stubbed decision email — logged, not sent. Swap for a real SMTP
    # send once the app is deployed and has mail credentials. The reason is also
    # shown in-app, so the user still gets it while this is only a log line.
    logger.info(
        "EMAIL -> %s: %s%s",
        user.email,
        _EMAIL_BODY[body.decision],
        f" Reason: {user.decision_reason}" if user.decision_reason else "",
    )
    return user
