# Next Steps

## Current Status
**Phase 1 prototype is feature-complete, polished, and build-verified. UI Polish Session 3 work is uncommitted.**
HEAD is `68b9933` on `main`; `origin/main` is at `ce1f853`.
Working tree has 5 modified source files + 3 new untracked files (see SESSION_LOG.md).
Repo is at `https://github.com/satvikkaul/secure-pathology-dashboard`.

To start the backend (requires a real `SECRET_KEY` in `backend/.env`):
```bash
cd backend
# First time: cp .env.example .env, then replace SECRET_KEY with output of:
#   python3 -c "import secrets; print(secrets.token_hex(32))"
source venv/bin/activate
uvicorn app.main:app --reload
```

To start the frontend:
```bash
cd frontend
npm run dev
```

---

## Immediate Next Task: Manual verify then commit

**Step 1 — Manual browser verification** (run `npm run dev` + `uvicorn`):
- [ ] Sidebar present on Dashboard, Upload, Jobs list, Job result pages
- [ ] Sidebar toggle (`‹`/`›`) is inside the sidebar brand area, not in the topbar
- [ ] `/jobs` empty state renders; "Upload Image" button navigates to `/upload`
- [ ] `/jobs` with jobs shows list; "View Result →" links to `/jobs/:id`
- [ ] Active nav state correct: Dashboard active on `/dashboard`, Upload Image active on `/upload`, Analysis Jobs active on `/jobs` and `/jobs/:id`
- [ ] Sign Out from sidebar footer works on all pages
- [ ] Mobile drawer still works (☰ in topbar, overlay closes drawer)

**Step 2 — Commit source changes:**
```bash
git add frontend/src/App.jsx \
        frontend/src/components/AppLayout.jsx \
        frontend/src/pages/DashboardPage.css \
        frontend/src/pages/DashboardPage.jsx \
        frontend/src/pages/JobResultPage.jsx \
        frontend/src/pages/JobsPage.css \
        frontend/src/pages/JobsPage.jsx \
        frontend/src/pages/UploadPage.jsx
```
Suggested message:
```
feat: add shared AppLayout, sidebar polish, and Analysis Jobs page
```

**Step 3 — Commit docs:**
```bash
git add docs/FRONTEND_PLAN.md docs/NEXT_STEPS.md docs/SESSION_LOG.md
```
Suggested message:
```
docs: update session log and next steps for UI Polish Session 3
```

---

## Remaining Presentation Work

| Task | Status | Notes |
|---|---|---|
| **Sidebar toggle inside sidebar** | Done, not yet verified | Build clean; needs browser check |
| **Sidebar persistent across all pages** | Done, not yet verified | AppLayout shared component |
| **Analysis Jobs page (`/jobs`)** | Done, not yet verified | JobsPage.jsx + JobsPage.css |
| **Dashboard sidebar (original)** | Done + verified ✓ | Playwright 41/41 pass (commit `0b1e51d`) |
| **UploadPage UI** | Done + verified ✓ | Playwright 41/41 pass |
| **JobResultPage UI** | Done + verified ✓ | Playwright 41/41 pass |
| **README rewrite** | Not started | Replace Vite boilerplate; cover setup, Phase 1 scope, what's demonstrated |
| **Demo script** | Not started | Step-by-step: register → login → upload → job → result → logout |
| **Professor update email** | Not started | Phase 1 summary: built, verified, deferred |
| **Screenshots** | Not started | Login, register, dashboard, upload, jobs list, job result — for README + email |

---

## What Was Verified (cumulative, as of 2026-06-27)

**Backend (curl) — all passing, committed:**
- All auth, image, algorithm, and job endpoints pass
- Per-user data isolation confirmed (User B cannot see User A's data)
- Upload validation: wrong type → 422; renamed extension → 422; 11 MB → 413

**Frontend (Playwright) — as of `0b1e51d` (41 checks, all pass):**
- Register → login → dashboard → upload → job result flow end-to-end
- 401 in-memory logout: corrupt token → redirect to /login without page reload
- Protected routes block unauthenticated access
- Client-side validation: short password, mismatched passwords, file type, file size
- Error messages readable (duplicate email, wrong password, Pydantic errors)
- Dashboard sidebar: collapse/expand, mobile burger + overlay, Sign Out, profile chip initials
- UploadPage: step indicators, drop zone, algorithm lock/unlock, file preview, Remove + same-file reselect, submit → /jobs/:id
- JobResultPage: two-column layout, metric grid, findings card, prototype notice (amber), image summary in aside

**UI Polish Session 3 — build-verified only, browser/Playwright verification pending:**
- Sidebar toggle inside sidebar brand area (not topbar)
- Sidebar persistent on Dashboard, Upload, Job Result, Jobs list pages
- `/jobs` list page: empty state, job rows, "View Result →" links, status badges
- Active nav state: dynamic via `useLocation()`, correct per route

---

## Out of Scope (Phase 1 — do not add)

- Real algorithm integration (Gleason grading, tissue classification, etc.)
- PostgreSQL migration
- Role-based access control / admin roles or dashboards
- Cloud deployment (AWS Canada / Azure Canada)
- Encrypted cloud storage (S3 / Azure Blob)
- Celery + Redis job queue
- Dockerized algorithm containers
- WSI image format support (.svs, .ndpi, .tiff)
- REB/ethics approval or real patient data
- httpOnly secure cookies (localStorage is Phase 1 decision)
- MFA / SSO
- File downloads
- Formal HIPAA / PIPEDA / PHIPA compliance certification

See `docs/DECISIONS.md` → "Open Decisions (Phase 2+)" for full list.
