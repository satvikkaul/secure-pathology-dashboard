# Session Log

## Project Goal
Secure cloud-based dashboard for pathology image analysis. MRP project connected to a hospital-independent research team. Users upload pathology images, select algorithms, run them, and view results — with strict per-user data isolation and privacy-aware design.

## Current Phase
**Phase 1 — Complete.** The local prototype is built, verified, and ready for professor review. Phase 2 planning has begun.

## Phase Transition (2026-06-27)

Phase 1 implementation is complete. The following was completed after the last committed state (`0fd801d`):

- **README rewritten** (commit `7c9119a`) — professor-facing README covering setup, Phase 1 scope, demo workflow, verification summary, and Phase 2 direction.
- **Cloud-agnostic deployment plan created** (`docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md`) — local planning doc; not committed to git. Provider-neutral architecture document covering managed database, private object storage, job queue, worker service, security controls, and illustrative provider mapping.
- **Phase boundary clarified:**
  - Phase 1 = complete local workflow prototype (auth, upload, jobs, results, sidebar, per-user isolation)
  - Phase 2 = user onboarding, profile page, cloud architecture planning, database/storage migration, real algorithm integration
  - Onboarding, profile page, cloud deployment, and algorithm integration are **Phase 2 planning items**, not Phase 1 scope.
- **Phase 2 plan created** (`docs/PHASE_2_PLAN.md`) — local planning doc; not committed to git. Covers 7 workstreams, proposed order, open questions, and what not to do yet.

## Repo State (updated 2026-06-27)
- Git repo connected to `https://github.com/satvikkaul/secure-pathology-dashboard.git`
- **Working tree: local modifications present.** Docs and `.gitignore` have uncommitted changes.
- Commit history (latest first):
  - `ec43223` — chore: exclude docs from git tracking ← HEAD (ahead of origin/main)
  - `7c9119a` — docs: rewrite README for Phase 1 ← origin/main
  - `0fd801d` — style: sidebar UI polish - added job history phase 1
  - `68b9933` — docs: update session log and next steps after Playwright verification
  - `0b1e51d` — style: polish phase 1 workflow UI (Playwright-verified 41/41)
- **Local planning docs** (exist locally, not tracked in git index):
  - `docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md`
  - `docs/PHASE_2_PLAN.md`
  - `docs/cloud_server_options.md`

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

## UI Polish Session 2 (2026-06-26)

### UploadPage — full restyle (was functional but unstyled)

**New file:** `frontend/src/pages/UploadPage.css`

**Changes to `UploadPage.jsx`:**
- Drag-and-drop drop zone: `isDragging` state, visual active ring on hover/drag
- File preview panel: shows filename + size after selection; Remove button resets native input via `fileInputRef` (prevents same-file reselect bug)
- Step indicator badges (1→2→3) activate progressively: step 1+2 activate on file pick, step 3 activates when both file + algorithm are chosen
- Algorithm section locked (`opacity-50`, `pointer-events: none`) until file is selected
- "Upload and Run" button disabled until both file + algorithm are selected
- Aside panel: Selected Model card, File Requirements card, privacy note (navy dark card)
- Header reuses `dash-header`/`dash-brand`/`dash-logout` from DashboardPage.css; includes "Back to Dashboard" link and Sign Out button

**Bug fixes applied during this work:**
- `clearFile()` now resets `fileInputRef.current.value = ''` so selecting the same file again re-fires `onChange`
- `applyFile()` on validation failure now clears `file` state and resets the input before returning — prevents old valid file from persisting behind a new error

### JobResultPage — full restyle (was functional but unstyled)

**New file:** `frontend/src/pages/JobResultPage.css`

**Changes to `JobResultPage.jsx`:**
- Two-column layout: main (report cards) + aside (job details, image summary, prototype notice)
- Heading row: eyebrow pill + h1 + status badge (green/red/blue by job status)
- Report Summary card: 2-metric grid (Prediction + Confidence), Generated Report text block
- Findings card: each finding row with label + score percentage
- Aside: Job Details `<dl>`, Image Summary (fetches image via `getImage()` to show content type + size), Prototype Notice (amber background)
- Status panel for non-completed jobs (failed/pending/running) so main column is never empty
- Generated report summary sentence conditionally rendered only when both `prediction` and `confidence` are non-null
- `useAuth` import and `logout` destructure removed (unused — no logout action on this page)

**New API function:** `getImage(id)` added to `frontend/src/api/images.js`

### Dashboard — sidebar navigation

**Changes to `DashboardPage.css`:** ~370 lines of sidebar/topbar classes appended. Existing `dash-page`/`dash-header`/`dash-logout` classes untouched — still used by UploadPage and JobResultPage.

**New CSS classes:**
- `dash-app` — root flex-row shell replacing `dash-page` on the dashboard
- `dash-sidebar` / `--collapsed` / `--open` — 256px expanded, 72px collapsed (width animates on desktop); fixed off-screen drawer on mobile (`< 1024px`)
- `sb-brand`, `sb-avatar`, `sb-title-block` — "SPD" logo + "Phase 1 / Secure Pathology Dashboard" brand block
- `sb-nav-wrap`, `sb-nav-link`, `sb-icon`, `sb-nav-label` — nav items; labels + section label hidden in collapsed state, icons centered
- `sb-footer`, `sb-user-box`, `sb-user-name`, `sb-user-role`, `sb-signout-btn` — user info + Sign Out pinned to sidebar bottom
- `dash-overlay` / `--visible` — semi-transparent backdrop for mobile drawer (suppressed via media query on desktop)
- `dash-main-wrap` — flex column: topbar + body + footer
- `dash-topbar`, `dash-burger--mobile`, `dash-burger--desktop` — top bar; each burger type toggled by media query
- `dash-profile`, `dash-profile-avatar`, `dash-profile-name` — avatar chip (initials + name) in top-right; name hidden below 480px

**Changes to `DashboardPage.jsx`:**
- `sidebarCollapsed` (desktop toggle) and `sidebarOpen` (mobile drawer) as independent state
- `getInitials(fullName)` helper derives 2-letter avatar (e.g. "Satvik Kaul" → "SK")
- Nav links: Dashboard (active, `--active` class), Upload Image → `/upload`, Analysis Jobs → `/dashboard` (no separate jobs page in Phase 1)
- Nav links close mobile drawer on click
- Sign Out in sidebar footer calls `handleLogout()`
- `dash-page` → `dash-app`; `dash-header` removed from dashboard; old logout button removed from header

### index.css additions
5 new color tokens added to `:root`:
- `--c-secondary: #d0e1fb` — blue pill/badge backgrounds
- `--c-success: #1f5f3a` / `--c-success-bg: #dff4e7` — completed job badge, status chip
- `--c-warning: #7a4b00` / `--c-warning-bg: #fff1d6` — prototype notice amber

### Uncommitted changed files
```
M  docs/NEXT_STEPS.md
M  docs/SESSION_LOG.md
M  frontend/src/api/images.js
M  frontend/src/index.css
M  frontend/src/pages/DashboardPage.css
M  frontend/src/pages/DashboardPage.jsx
M  frontend/src/pages/JobResultPage.jsx
M  frontend/src/pages/UploadPage.jsx
?? frontend/mockups/job_result.html
?? frontend/mockups/sidebar.html
?? frontend/mockups/upload_img.html
?? frontend/src/pages/JobResultPage.css
?? frontend/src/pages/UploadPage.css
```

### Build status
`npm run build` — clean (36 modules, no warnings or errors).

## Current Unresolved Issues

**All UI Polish Session 2 work verified (2026-06-27) — 41/41 Playwright checks pass** (commit `0b1e51d`).

**UI Polish Session 3 work committed in `0fd801d` (build-verified, 39 modules, 0 warnings).** Playwright re-verification of the new flows has not been run yet — manual browser testing is recommended before the professor demo.

## UI Polish Session 3 (2026-06-27)

### Sidebar toggle moved into sidebar
**Problem:** The desktop collapse toggle (`dash-burger--desktop`) lived inside `dash-topbar-left` in the main content area, making the header feel cluttered and the toggle disconnected from what it controls.

**Fix — `DashboardPage.css`:**
- Added `.sb-toggle`: 28×28px button, `display: none` by default, `display: flex` at ≥1024px. Subtle border + hover.
- Added `flex: 1` to `.sb-title-block` so it fills the brand row and pushes the toggle to the trailing edge.
- `.dash-sidebar--collapsed .sb-brand`: changed to `flex-direction: column; align-items: center; gap: 8px` — collapsed brand stacks SPD logo above toggle, both centered.
- Removed `.dash-burger--desktop` display rules (class no longer rendered).

**Fix — `DashboardPage.jsx`:**
- Added `<button className="sb-toggle">` inside `sb-brand` after `sb-title-block`. Shows `‹` / `›` and dynamic `aria-label`. Wires to existing `setSidebarCollapsed`.
- Removed `dash-burger--desktop` button from `dash-topbar-left`. Mobile `dash-burger--mobile` retained in topbar.

### Shared AppLayout component (sidebar persistent across all pages)
**Problem:** `UploadPage` and `JobResultPage` used a flat `dash-page`/`dash-header` layout with no sidebar. The sidebar only appeared on the Dashboard.

**New file: `frontend/src/components/AppLayout.jsx`**
- Owns `sidebarCollapsed` / `sidebarOpen` state, `handleLogout`, mobile overlay, sidebar JSX, topbar, footer.
- Uses `useLocation()` for dynamic active nav: `/dashboard` → Dashboard active; `/upload` → Upload Image active; `/jobs` or `/jobs/*` → Analysis Jobs active.
- Props: `pageTitle` (string), `pageSub` (string, optional), `children`.
- Imports `DashboardPage.css` for all sidebar/shell classes.

**`DashboardPage.jsx` refactored:**
- Removed: `useNavigate`, `getInitials`, `logout`, sidebar state + handlers, all sidebar/overlay/topbar/footer JSX.
- Now renders only `<AppLayout>` wrapping `<div className="dash-body">` with the data cards.
- Kept: `useAuth` for `user`, `listImages`/`listJobs` data fetching, `formatBytes`.

**`UploadPage.jsx` refactored:**
- Removed: `Link`, `useAuth` import, `dash-page`/`dash-header` outer wrapper, "Back to Dashboard" link, Sign Out button.
- Removed stale `DashboardPage.css` import (AppLayout handles it).
- Wraps `<main className="up-body">` in `<AppLayout pageTitle="Upload Image" …>`.
- All drag-drop, validation, and submit logic unchanged.

**`JobResultPage.jsx` refactored:**
- Removed: `Link`, `dash-page`/`dash-header` outer wrapper, "Back to Dashboard" link, "Run Another Upload" button.
- Wraps `<main className="jr-body">` in `<AppLayout pageTitle="Analysis Result" …>`.
- Navigation to `/upload` now via sidebar. All report rendering logic unchanged.

### Analysis Jobs page (new route `/jobs`)
**New file: `frontend/src/pages/JobsPage.jsx`**
- Fetches `listJobs()` on mount.
- Empty state: card with "No jobs yet" + "Upload Image" button → `/upload`.
- Populated state: `dash-card` with one `jl-row` per job; shows Job ID, algorithm name, created date, status badge.
- Completed jobs: "View Result →" link → `/jobs/:id`.
- Pending/running/failed jobs: status badge only, no link.

**New file: `frontend/src/pages/JobsPage.css`**
- `jl-*` prefix. Eyebrow pill, title, subtitle, empty state card, job row layout.
- Reuses `dash-card`, `dash-badge`, `dash-body`, `dash-loading`, `dash-error` from `DashboardPage.css`.
- Mobile: rows stack to column at ≤480px.

**`App.jsx` updated:** added `/jobs` route (protected) above `/jobs/:id`.

**`AppLayout.jsx` "Analysis Jobs" nav link:** restored, points to `/jobs`, active on `/jobs` and `/jobs/*`.

### Build status
`npm run build` — clean (39 modules, 0 warnings).

## Known Backend Issues from Code Review (resolved)
1. **Full file buffered before size check** — FIXED (streaming now)
2. **Silent exception swallow in jobs** — FIXED (logged + safe summary stored)
3. **Orphaned file on DB failure** — FIXED (cleanup + rollback)
4. **Client-controlled content-type/extension only; no magic-byte check** — FIXED (Pillow verify added)
5. **UPLOAD_DIR path unstable** — FIXED (anchored to `_BACKEND_DIR`)

Remaining open from review (low priority for Phase 1):
- `UserCreate` and `UserLogin` share `email`/`password` fields with no shared base class (simplification only, not a bug)
