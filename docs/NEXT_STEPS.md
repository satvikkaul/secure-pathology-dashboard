# Next Steps

## Current Status
**Phase 1 prototype is feature-complete, verified, and visually polished.**
Working tree has uncommitted changes. Repo is at `https://github.com/satvikkaul/secure-pathology-dashboard`.

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

## Immediate Next Task: Review diff and commit

Run `git diff HEAD` to review all uncommitted changes, then commit everything as a single cleanup commit. Suggested message:

```
fix: codex review cleanup and UI polish

- Remove insecure SECRET_KEY fallback; server fails fast with RuntimeError
  if key is missing or set to placeholder value
- Fix .gitignore: remove erroneous docs/ and .claude/ exclusions; add
  explicit entries for backend/.env, frontend/.env, venv/, node_modules/
- Update backend/.env.example with correct placeholder and generation hint
- Fix 401 in-memory logout: client.js dispatches auth:unauthorized event;
  AuthContext clears token/user state without requiring page reload
- Restyle LoginPage, RegisterPage, DashboardPage with plain CSS;
  no Tailwind, no external fonts or assets; clinical slate/blue palette;
  shared auth card styles; dashboard header/card/badge layout
```

---

## Remaining Presentation Work (after commit)

| Task | Notes |
|---|---|
| **README rewrite** | Replace Vite boilerplate. Cover: what the project is, how to run it locally (backend + frontend), what Phase 1 demonstrates, what is out of scope. |
| **Demo script** | Step-by-step walkthrough: register → login → upload image → run job → view result → logout. Include what each step demonstrates technically. |
| **Professor update email** | Summary of Phase 1: what was built, what was verified, what is explicitly deferred to Phase 2+. |
| **Screenshots** | Capture login, register, dashboard (empty state), dashboard (with data), upload page, job result page. Use for README and professor email. |
| **UploadPage / JobResultPage polish** | Optional before demo — these pages are functional but unstyled. The global CSS improvements already help. Full restyle is a separate task. |

---

## What Was Verified (cumulative, as of 2026-06-25)

**Backend (curl):**
- All auth, image, algorithm, and job endpoints pass
- Per-user data isolation confirmed (User B cannot see User A's data)
- Upload validation: wrong type → 422; renamed extension → 422; 11 MB → 413

**Frontend (Playwright + manual browser):**
- Register → login → dashboard → upload → job result flow end-to-end
- 401 in-memory logout: corrupt token → redirect to /login without page reload
- Protected routes block unauthenticated access
- Client-side validation: short password, mismatched passwords, file type, file size
- Error messages readable for duplicate email, wrong password, Pydantic errors
- UI polish: auth cards, dashboard layout, status badges — 29 automated checks pass

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
- Charts, drag-and-drop upload
- Formal HIPAA / PIPEDA / PHIPA compliance certification

See `docs/DECISIONS.md` → "Open Decisions (Phase 2+)" for full list.
