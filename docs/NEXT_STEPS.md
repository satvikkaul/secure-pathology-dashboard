# Next Steps

## Current Status
**Phase 1 prototype is feature-complete, visually polished across all pages, build-verified, and Playwright-verified.**
Working tree has **3 uncommitted docs files** (this file + SESSION_LOG.md + FRONTEND_PLAN.md). HEAD is `0b1e51d` on `main`; `origin/main` is at `ce1f853`.
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

## Immediate Next Task: Commit docs update

Stage and commit the three modified docs files:

```
docs/FRONTEND_PLAN.md
docs/NEXT_STEPS.md
docs/SESSION_LOG.md
```

Suggested message:

```
docs: update session log and next steps after Playwright verification
```

---

## Remaining Presentation Work

| Task | Status | Notes |
|---|---|---|
| **Dashboard sidebar** | Done + verified ✓ | Playwright 41/41 pass |
| **UploadPage UI** | Done + verified ✓ | Playwright 41/41 pass |
| **JobResultPage UI** | Done + verified ✓ | Playwright 41/41 pass |
| **README rewrite** | Not started | Replace Vite boilerplate; cover setup, Phase 1 scope, what's demonstrated |
| **Demo script** | Not started | Step-by-step: register → login → upload → job → result → logout |
| **Professor update email** | Not started | Phase 1 summary: built, verified, deferred |
| **Screenshots** | Not started | Login, register, dashboard, upload, job result — for README + email |

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
