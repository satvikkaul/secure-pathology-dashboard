"""Phase 2C admin-approval gate checks. Run: python test_admin.py (no pytest).

Calls the dependency + admin-router functions directly against an in-memory
session so the gate branches are exercised without HTTP/auth.
"""
import os
os.environ.setdefault("SECRET_KEY", "test-only-secret-not-a-real-key-0123456789")

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app import models, schemas
from app.dependencies import get_approved_user, require_admin
from app.routers import admin, auth


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


db = _session()
admin_user = _user(db, "admin@x.com", is_admin=True, is_approved=True)
pending = _user(db, "new@x.com", onboarding_completed=True)

# Unapproved user is blocked from data endpoints; approved passes.
raises(403, lambda: get_approved_user(pending))
assert get_approved_user(admin_user) is admin_user

# Non-admin cannot reach admin endpoints; admin can.
raises(403, lambda: require_admin(pending))
assert require_admin(admin_user) is admin_user

# Pending list shows the unapproved non-admin user, not the admin.
listed = admin.list_pending(db, admin_user)
assert [u.email for u in listed] == ["new@x.com"], listed

# Approving flips the flag, stamps approved_at, and now the gate lets them in.
out = admin.approve_user(schemas.ApproveRequest(email="new@x.com"), db, admin_user)
assert out.is_approved is True and pending.approved_at is not None
assert get_approved_user(pending) is pending

# Re-approving is a conflict; unknown email is 404.
raises(409, lambda: admin.approve_user(schemas.ApproveRequest(email="new@x.com"), db, admin_user))
raises(404, lambda: admin.approve_user(schemas.ApproveRequest(email="ghost@x.com"), db, admin_user))

# ── Login gate (Option B): block sign-in once onboarded but unapproved ────────
from app.auth import hash_password
db2 = _session()
_user(db2, "onb@x.com", hashed_password=hash_password("password123"),
      onboarding_completed=True, is_approved=False)
_user(db2, "fresh@x.com", hashed_password=hash_password("password123"),
      onboarding_completed=False, is_approved=False)
_user(db2, "ok@x.com", hashed_password=hash_password("password123"),
      onboarding_completed=True, is_approved=True)

# onboarded + unapproved → 403 at login (nothing left to do but wait).
raises(403, lambda: auth.login(schemas.UserLogin(email="onb@x.com", password="password123"), db2))
# not-yet-onboarded → allowed in so they can finish onboarding.
assert auth.login(schemas.UserLogin(email="fresh@x.com", password="password123"), db2).access_token
# approved → allowed.
assert auth.login(schemas.UserLogin(email="ok@x.com", password="password123"), db2).access_token
# wrong password → 401, regardless of approval state.
raises(401, lambda: auth.login(schemas.UserLogin(email="ok@x.com", password="wrongpass1"), db2))

print("OK — Phase 2C admin-approval gate + login-gate checks passed")
