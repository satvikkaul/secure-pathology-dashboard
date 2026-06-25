# Session Log

## Project Goal
Secure cloud-based dashboard for pathology image analysis. MRP project connected to a hospital-independent research team. Users upload pathology images, select algorithms, run them, and view results — with strict per-user data isolation and privacy-aware design.

## Current Phase
**Phase 1 — Local prototype only.** No cloud, no real patient data, no REB dependency, no Docker, no Celery, no WSI, no admin roles.

## Repo State (as of 2026-06-25)
- Git repo initialized at project root, connected to `https://github.com/satvikkaul/secure-pathology-dashboard.git`
- Nothing has been committed yet
- Working tree has all changes unstaged

## Backend Files Created
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              — FastAPI app, lifespan (creates DB tables + seeds algorithm)
│   ├── database.py          — SQLite engine + SessionLocal + Base
│   ├── models.py            — User, Image, Algorithm, AlgorithmJob ORM models
│   ├── schemas.py           — Pydantic schemas: UserCreate, UserLogin, UserOut, ImageOut, AlgorithmOut, JobCreate, JobOut
│   ├── auth.py              — bcrypt hashing, JWT creation/decode
│   ├── dependencies.py      — get_db, get_current_user
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          — POST /auth/register, POST /auth/login, GET /auth/me
│   │   ├── images.py        — POST /images/, GET /images/, GET /images/{id}
│   │   ├── algorithms.py    — GET /algorithms/
│   │   └── jobs.py          — POST /jobs/, GET /jobs/, GET /jobs/{id}
│   └── algorithms/
│       ├── __init__.py
│       └── placeholder.py   — synchronous placeholder returning synthetic result dict
├── uploads/                 — private upload directory (.gitkeep present)
├── .env.example
└── requirements.txt
```

Tech stack: FastAPI · SQLite (SQLAlchemy) · Pydantic v2 · python-jose JWT · passlib bcrypt · Pillow · python-dotenv

## Docs Cleanup Completed
- Root-level duplicate `ASSUMPTIONS.md` and `DECISIONS.md` removed
- Canonical versions live in `docs/ASSUMPTIONS.md` and `docs/DECISIONS.md`
- Both updated to reflect Phase 1 locked decisions

## Backend Fixes Applied (all sessions)
1. `full_name` added to `User` model, `UserCreate`, `UserOut`; separate `UserLogin` schema created for login
2. `UserCreate.full_name` validated with `Field(min_length=1, max_length=100)`
3. `password` validated with `Field(min_length=8)` on both `UserCreate` and `UserLogin`
4. Upload streaming: file read in 64 KB chunks; size limit enforced during read (not after buffering full file)
5. Pillow image verification added: rejects non-image bytes even if extension/content-type pass
6. Upload path stable: `_BACKEND_DIR = Path(__file__).resolve().parents[2]`; relative `UPLOAD_DIR` anchored to `backend/` regardless of launch directory
7. DB failure after file write: file deleted and session rolled back; clean 500 returned
8. Job error handling: `except Exception as exc` with `logger.error(exc_info=True)`; safe `result_summary` stored; no stack traces exposed to API
9. **bcrypt byte-length validation:** Added `field_validator("password")` to both `UserCreate` and `UserLogin` in `schemas.py`. Checks `len(v.encode("utf-8")) > 72` and raises `ValueError`, returning a clean `422`. `max_length=72` was intentionally NOT used — it counts characters, not bytes; multi-byte UTF-8 characters would bypass it.
10. **bcrypt/passlib version pin:** `passlib 1.7.4` is incompatible with `bcrypt >= 4.0.0`. At init time passlib hashes an internal test string exceeding 72 bytes; `bcrypt 5.0.0` raises `ValueError` crashing every hash/verify call. Fixed by pinning `bcrypt==3.2.2` in `requirements.txt`.
11. **SQLite schema reset after adding `full_name`:** `Base.metadata.create_all()` does not ALTER existing tables. After adding `full_name` to the `User` model, the stale `backend/pathology.db` (missing the column) caused 500 errors on register. Resolved by deleting `backend/pathology.db` and restarting — SQLAlchemy recreated all tables with the correct schema.

## Auth Verification Status (as of 2026-06-25)
All three auth endpoints verified working in Swagger:
- `POST /auth/register` → `201` with `full_name` in response body
- `POST /auth/login` → `200` with `access_token`
- `GET /auth/me` → `200` with `full_name` using Bearer token

**Backend auth is complete. Frontend has not been started.**

## Current Unresolved Issues
None. All known backend bugs are resolved.

## Known Backend Issues from Code Review (resolved)
1. **Full file buffered before size check** — FIXED (streaming now)
2. **Silent exception swallow in jobs** — FIXED (logged + safe summary stored)
3. **Orphaned file on DB failure** — FIXED (cleanup + rollback)
4. **Client-controlled content-type/extension only; no magic-byte check** — FIXED (Pillow verify added)
5. **UPLOAD_DIR path unstable** — FIXED (anchored to `_BACKEND_DIR`)

Remaining open from review (low priority for Phase 1):
- `UserCreate` and `UserLogin` share `email`/`password` fields with no shared base class (simplification only, not a bug)
