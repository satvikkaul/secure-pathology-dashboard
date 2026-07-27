"""Admin decision-workflow checks. Run: python test_admin.py (no pytest).

Calls the dependency + router functions directly against an in-memory session so
the gate branches are exercised without HTTP/auth.
"""
import os
os.environ.setdefault("SECRET_KEY", "test-only-secret-not-a-real-key-0123456789")

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app import models, schemas
from app.models import STATUS_APPROVED, STATUS_DECLINED, STATUS_PENDING
from app.dependencies import get_approved_user, require_admin
from app.routers import admin, auth, profile


def _session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


def _user(db, email, **kw):
    kw.setdefault("hashed_password", "x")
    u = models.User(full_name="T", email=email, **kw)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def raises(status_code, fn):
    try:
        fn()
    except HTTPException as e:
        assert e.status_code == status_code, f"expected {status_code}, got {e.status_code}"
        return
    raise AssertionError(f"expected HTTPException {status_code}, none raised")


def decide(db, actor, email, decision, reason=None):
    return admin.decide_user(
        schemas.DecisionRequest(email=email, decision=decision, reason=reason), db, actor
    )


db = _session()
admin_user = _user(db, "admin@x.com", is_admin=True, status=STATUS_APPROVED)
pending = _user(db, "new@x.com", onboarding_completed=True)

# New users default to pending and are blocked from data endpoints.
assert pending.status == STATUS_PENDING
raises(403, lambda: get_approved_user(pending))
assert get_approved_user(admin_user) is admin_user

# Non-admin cannot reach admin endpoints; admin can.
raises(403, lambda: require_admin(pending))
assert require_admin(admin_user) is admin_user

# The user list covers every non-admin account, whatever its status.
assert [u.email for u in admin.list_users(db, admin_user)] == ["new@x.com"]

# Approving opens the gate and stamps the decision.
out = decide(db, admin_user, "new@x.com", STATUS_APPROVED)
assert out.status == STATUS_APPROVED and pending.decided_at is not None
assert get_approved_user(pending) is pending

# Deciding the same way twice is a conflict; unknown email is 404.
raises(409, lambda: decide(db, admin_user, "new@x.com", STATUS_APPROVED))
raises(404, lambda: decide(db, admin_user, "ghost@x.com", STATUS_APPROVED, "no such user"))

# Admin accounts are off-limits, so the last approver can't be locked out.
raises(400, lambda: decide(db, admin_user, "admin@x.com", STATUS_DECLINED, "nope"))

# ── Decline requires a reason, and the reason reaches the user ────────────────
try:
    schemas.DecisionRequest(email="new@x.com", decision=STATUS_DECLINED)
    raise AssertionError("expected a decline with no reason to be rejected")
except ValidationError:
    pass
try:
    schemas.DecisionRequest(email="new@x.com", decision=STATUS_DECLINED, reason="   ")
    raise AssertionError("expected a whitespace-only reason to be rejected")
except ValidationError:
    pass

# Revoking an approved user: gate closes again on the very next call.
locked = _user(db, "locked@x.com", onboarding_completed=True,
               status=STATUS_APPROVED, org_fields_locked=True)
out = decide(db, admin_user, "locked@x.com", STATUS_DECLINED, "Organisation could not be verified.")
assert out.status == STATUS_DECLINED
assert out.decision_reason == "Organisation could not be verified."
raises(403, lambda: get_approved_user(locked))
# A decline unlocks org fields, otherwise the user could not fix what was wrong.
assert locked.org_fields_locked is False

# ── Re-apply ─────────────────────────────────────────────────────────────────
back = profile.reapply(locked, db)
assert back.status == STATUS_PENDING
assert back.decision_reason is None and locked.decided_at is None
raises(403, lambda: get_approved_user(locked))
# Only a declined account can re-apply.
raises(409, lambda: profile.reapply(locked, db))
# A declined user can be approved straight from the declined state.
decide(db, admin_user, "locked@x.com", STATUS_DECLINED, "Still unverified.")
out = decide(db, admin_user, "locked@x.com", STATUS_APPROVED)
assert out.status == STATUS_APPROVED and out.decision_reason is None

# ── Login gate: pending blocks, declined and not-yet-onboarded get in ─────────
from app.auth import hash_password
db2 = _session()
for email, kw in {
    "onb@x.com": dict(onboarding_completed=True, status=STATUS_PENDING),
    "fresh@x.com": dict(onboarding_completed=False, status=STATUS_PENDING),
    "ok@x.com": dict(onboarding_completed=True, status=STATUS_APPROVED),
    "no@x.com": dict(onboarding_completed=True, status=STATUS_DECLINED, decision_reason="Not eligible."),
}.items():
    _user(db2, email, hashed_password=hash_password("password123"), **kw)


def login(email, password="password123"):
    return auth.login(schemas.UserLogin(email=email, password=password), db2)


# onboarded + pending → 403 (nothing left to do but wait).
raises(403, lambda: login("onb@x.com"))
# not-yet-onboarded → allowed in so they can finish onboarding.
assert login("fresh@x.com").access_token
# approved → allowed.
assert login("ok@x.com").access_token
# declined → allowed in, so they can read the reason and re-apply.
assert login("no@x.com").access_token
# wrong password → 401, regardless of status.
raises(401, lambda: login("ok@x.com", "wrongpass1"))

print("OK — admin decision workflow, re-apply, and login-gate checks passed")
