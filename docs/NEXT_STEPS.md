# Next Steps

## Current Status
**Phase 1 prototype is complete.** Backend and frontend are fully implemented and manually tested. Backend has been committed. Frontend is pending final smoke test and commit.

To start the backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

To start the frontend:
```bash
cd frontend
npm run dev
```

---

## Immediate — Final Smoke Test and Commit

### Step 1: Run final smoke test

See checklist below. Complete all items before committing.

### Step 2: Confirm git status is clean

Run `git status --short` and verify only legitimate source files are staged. Must not include:
- `backend/venv/` or `.venv/`
- `backend/pathology.db`
- `backend/uploads/*` (only `.gitkeep` allowed)
- `backend/.env`
- `frontend/node_modules/`
- `frontend/dist/`
- `frontend/.env`
- `**/__pycache__/` or `*.pyc`
- Any uploaded image files

### Step 3: Commit the completed Phase 1 prototype

Stage and commit:
- `frontend/` (all source files)
- `docs/FRONTEND_PLAN.md`
- Updated `docs/SESSION_LOG.md` and `docs/NEXT_STEPS.md`

### Step 4: Push only after confirming repo visibility

Before pushing, confirm the GitHub repo at `https://github.com/satvikkaul/secure-pathology-dashboard` is set to **private**. Do not push to a public repo.

### Step 5: Prepare professor update / demo summary

After committing, prepare a short summary covering:
- What was built (end-to-end workflow)
- What was verified (backend curl tests + manual browser testing)
- What is out of scope for Phase 1 (real AI, cloud, WSI, admin, compliance)
- What Phase 2 would add

---

## Final Smoke Test Checklist

Complete in order. Use a fresh browser session (clear localStorage or use incognito).

- [ ] Register a new user (full_name, email, password ≥ 8 chars)
- [ ] Confirm success banner appears on /login
- [ ] Login with the new user
- [ ] Confirm /dashboard shows correct full_name
- [ ] Upload a valid JPG or PNG under 10 MB
- [ ] Select Placeholder Classifier v1 from the dropdown
- [ ] Click "Upload and run" — confirm redirect to /jobs/:id
- [ ] Confirm result page shows: prediction, confidence %, findings, disclaimer
- [ ] Click "Back to dashboard" — confirm new image and job appear in lists
- [ ] Logout — confirm token is cleared and /login is shown
- [ ] Register a second user (User B)
- [ ] Login as User B
- [ ] Navigate directly to User A's job URL (e.g. /jobs/1) — confirm "Job not found" error
- [ ] Confirm no .env, database, venv, node_modules, __pycache__, or uploaded image files are staged in `git status`

---

## Phase 2+ (do not start yet)

- Real algorithm integration (Gleason grading, tissue classification, nuclei segmentation)
- PostgreSQL migration (SQLAlchemy ORM change is minimal)
- Role-based access control (admin role decision still open — see DECISIONS.md)
- Cloud deployment (AWS Canada or Azure Canada — decision pending)
- Encrypted cloud storage (S3 / Azure Blob with signed URLs)
- Celery + Redis job queue for async inference
- WSI image format support (OpenSlide + tiling)
- REB/ethics approval before any real patient data
- httpOnly secure cookies replacing localStorage JWT
- MFA / SSO (if required by institution)

See `docs/DECISIONS.md` → "Open Decisions (Phase 2+)" for full list.
