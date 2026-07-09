"""WS1 org-lock state-model checks. Run: python test_profile.py (no pytest needed).

Calls the router functions directly against an in-memory SQLite session so the
guard branches are exercised without HTTP/auth. Covers review findings 1, 3, 7.
"""
import os
os.environ.setdefault("SECRET_KEY", "test-only-secret-not-a-real-key-0123456789")

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app import models, schemas
from app.routers import profile


def _session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


def _fresh_user(db):
    u = models.User(full_name="Test", email="t@example.com", hashed_password="x")
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


# Finding 1: locking before onboarding is rejected (would otherwise brick account).
db = _session()
u = _fresh_user(db)
assert not u.onboarding_completed
raises(400, lambda: profile.lock_org(schemas.OrgLock(), u, db))

# Onboarding via PUT completes onboarding and saves fields.
profile.update_profile(schemas.ProfileUpdate(role="Researcher", organization_name="Acme"), u, db)
assert u.onboarding_completed is True
assert u.role == "Researcher"
assert u.organization_name == "Acme"

# Finding 3: empty lock payload does NOT wipe previously saved org fields.
profile.lock_org(schemas.OrgLock(), u, db)
assert u.org_fields_locked is True
assert u.organization_name == "Acme", "empty lock wiped org fields"

# Locking twice is a conflict.
raises(409, lambda: profile.lock_org(schemas.OrgLock(), u, db))

# Finding 7: after lock, role stays editable; touching an org field is rejected.
profile.update_profile(schemas.ProfileUpdate(role="Physician"), u, db)
assert u.role == "Physician", "role should stay editable after lock"
raises(409, lambda: profile.update_profile(
    schemas.ProfileUpdate(role="Physician", organization_name="Changed"), u, db))
assert u.organization_name == "Acme", "locked org field was changed"

print("OK — WS1 org-lock state model checks passed")
