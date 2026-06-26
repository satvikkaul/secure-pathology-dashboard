# Session Log

## Project Goal
Secure cloud-based dashboard for pathology image analysis. MRP project connected to a hospital-independent research team. Users upload pathology images, select algorithms, run them, and view results — with strict per-user data isolation and privacy-aware design.

## Current Phase
**Phase 1 — Local prototype only.** No cloud, no real patient data, no REB dependency, no Docker, no Celery, no WSI, no admin roles.

## Repo State (as of 2026-06-25)
- Git repo initialized at project root, connected to `https://github.com/satvikkaul/secure-pathology-dashboard.git`
- **Uncommitted changes present** — Codex review fixes and UI polish are complete but not yet committed. Working tree is dirty (see "Codex Review Fixes" and "UI Polish" sections below). Next step: review diff, then commit.
- Commit history (latest first):
  - `4773a23` — feat: complete phase 1 dashboard prototype
  - `b8edcd2` — feat: scaffold verified phase 1 backend prototype
  - `c5777f6` — feat: scaffold phase 1 backend prototype

## Codex Review Fixes (2026-06-25)

1. **401 in-memory logout** — Fixed and verified. `client.js` dispatches `auth:unauthorized` on 401; `AuthContext` listens and clears `token`/`user` state; `ProtectedRoute` redirects to `/login` without a page reload. Playwright-verified end-to-end.
2. **SECRET_KEY fallback removed** — `backend/app/auth.py` no longer accepts a hard-coded fallback. Server raises `RuntimeError` on startup if `SECRET_KEY` is missing or still set to the placeholder value.
3. **.gitignore fixed** — Removed erroneous `docs/` and `.claude/` exclusions (both are intentional project files). Added explicit entries for `backend/.env`, `frontend/.env`, `venv/`, `.venv/`, and `frontend/node_modules/`.
4. **`backend/.env.example` updated** — Placeholder value replaced with `REPLACE_THIS_WITH_A_REAL_SECRET`; added generation instruction (`secrets.token_hex(32)`).
5. **CLAUDE.md updated** — Removed stale "No frontend yet" constraint; updated to reflect Phase 1 complete status and current focus.

## UI Polish (2026-06-25)

LoginPage, RegisterPage, and DashboardPage restyled with plain CSS. No new dependencies, no Tailwind, no external fonts or image assets.

**Files changed:**
- `frontend/src/index.css` — full rewrite; design token CSS variables (slate/blue palette); `#root` stripped of Vite's bordered-column constraint; global font/color/link resets
- `frontend/src/App.css` — cleared; Vite boilerplate removed (file was not imported anywhere)
- `frontend/src/pages/auth.css` — **new**; shared card, input, button, error/banner, and notice styles used by both LoginPage and RegisterPage
- `frontend/src/pages/LoginPage.jsx` — restyled with auth classes; "Research Prototype" subtitle; "No account? Create one" footer link; no "Forgot password" link; "Prototype only — not for clinical use" notice
- `frontend/src/pages/RegisterPage.jsx` — restyled with auth classes; "Create Account" subtitle; "Minimum 8 characters" password hint (corrects mockup's incorrect "12 characters"); notice present
- `frontend/src/pages/DashboardPage.jsx` — header bar with brand + logout; welcome with `full_name` + "Phase 1 Research Prototype" sub; two-column card grid (Images + Analysis Jobs); `formatBytes` helper; status badges per job; prototype footer
- `frontend/src/pages/DashboardPage.css` — **new**; dashboard-specific layout: header, body, welcome bar, two-column grid, cards, list rows, job badges, footer

**Playwright-verified (29 checks, all pass):**
- Auth cards render correctly on login and register
- Titles, subtitles, notices, and password hint are accurate
- No "Forgot password", "Register for Trial", "Clinical Trial", "Professional Email", or "12 characters" anywhere
- Registration → success banner on /login → login → /dashboard flow intact
- Dashboard brand, welcome name, two cards, upload button, logout all present
- Wrong password / short password / mismatched passwords: all correctly blocked
- Upload Image link navigates to /upload
- Logout redirects to /login; ProtectedRoute blocks /dashboard after logout

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

## Full Backend Verification Status (as of 2026-06-25)
All backend endpoints verified working via curl:

**Auth**
- `POST /auth/register` → `201` with `id`, `full_name`, `email`, `created_at`
- `POST /auth/login` → `200` with `access_token`
- `GET /auth/me` → `200` with `full_name` using Bearer token

**Algorithms**
- `GET /algorithms/` → `200` returns `placeholder_v1` with `display_name`, `description`, `version`

**Images**
- `POST /images/` (valid JPG) → `201` with `id`, `content_type`, `file_size`
- `POST /images/` (PDF) → `422` "Only JPG and PNG files are accepted"
- `POST /images/` (text file renamed .jpg) → `422` "File is not a valid JPG or PNG image"
- `POST /images/` (11 MB file) → `413` "File exceeds the 10 MB size limit"

**Jobs**
- `POST /jobs/` `{"image_id": 1, "algorithm_name": "placeholder_v1"}` → `201` with `status: "completed"` and `result_summary` populated (synthetic prediction: benign, confidence: 0.87)
- `GET /jobs/` → `200` returns list with the submitted job
- `GET /jobs/{id}` → `200` returns full job details including `result_summary`

**Per-user data isolation**
- User B `GET /images/` → `[]` (empty, cannot see User A's images)
- User B `GET /jobs/` → `[]` (empty, cannot see User A's jobs)
- User B `GET /images/1` (User A's image) → `404` "Image not found"
- User B `GET /jobs/1` (User A's job) → `404` "Job not found"

**Backend is fully verified and committed.**

## Frontend Implementation Status (as of 2026-06-25)
Phase 1 frontend is complete. All seven steps implemented and manually tested.

**Tech stack:** React + Vite · react-router-dom v6 · native fetch · localStorage JWT (Phase 1)

**Frontend file tree:**
```
frontend/
├── index.html
├── vite.config.js          — proxy /api/* → VITE_BACKEND_URL (default localhost:8000)
├── .env.example            — VITE_API_BASE_URL, VITE_BACKEND_URL
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx             — BrowserRouter + AuthProvider + all routes
    ├── api/
    │   ├── client.js       — fetch wrapper: Bearer token injection, 401 handling,
    │   │                     extractDetail() normalises Pydantic array errors to string
    │   ├── auth.js         — register(), login(), getMe()
    │   ├── images.js       — listImages(), uploadImage(file)
    │   ├── algorithms.js   — listAlgorithms()
    │   └── jobs.js         — listJobs(), submitJob(), getJob()
    ├── context/
    │   └── AuthContext.jsx — token/user state, isLoading, login(), logout()
    ├── components/
    │   └── ProtectedRoute.jsx
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.jsx
        ├── UploadPage.jsx
        └── JobResultPage.jsx
```

**Manually tested flows:**
- Register new user → success banner on /login
- Login → JWT in localStorage → /dashboard with full_name
- Dashboard: image list, job list, empty states, logout
- Logout clears token, redirects to /login
- Refresh on /dashboard while authenticated stays on dashboard (AuthContext re-validates token)
- Upload valid JPG/PNG → algorithm dropdown → job creation → redirect to /jobs/:id
- Job result page: parsed prediction, confidence %, findings list, disclaimer
- Invalid file type (PDF): caught client-side, no request sent
- File over 10 MB: caught client-side, no request sent
- Invalid email on register: shows readable Pydantic validation message (not [object Object])
- Duplicate email on register: shows "Email already registered"
- Wrong password on login: shows "Incorrect email or password"
- Cross-user job access: User B GET /jobs/1 (User A's) → "Job not found"
- Dashboard job links navigate to correct /jobs/:id

## Current Unresolved Issues
None. Phase 1 is feature-complete and verified.

## Known Backend Issues from Code Review (resolved)
1. **Full file buffered before size check** — FIXED (streaming now)
2. **Silent exception swallow in jobs** — FIXED (logged + safe summary stored)
3. **Orphaned file on DB failure** — FIXED (cleanup + rollback)
4. **Client-controlled content-type/extension only; no magic-byte check** — FIXED (Pillow verify added)
5. **UPLOAD_DIR path unstable** — FIXED (anchored to `_BACKEND_DIR`)

Remaining open from review (low priority for Phase 1):
- `UserCreate` and `UserLogin` share `email`/`password` fields with no shared base class (simplification only, not a bug)
