# Next Steps

## Current Status
**All backend endpoints fully verified as of 2026-06-25.** Auth, algorithms, image upload (valid + all rejection cases), job submission, job retrieval, and per-user data isolation all pass.

To start the backend:
```bash
cd backend
venv/bin/uvicorn app.main:app --reload
```

---

## Immediate — First Git Commit

### Step 1: First git commit
Commit all backend files. Exclude:
- `backend/venv/` and `backend/.venv/`
- `backend/pathology.db`
- `backend/uploads/*` (keep `.gitkeep`)
- `backend/.env` (keep `.env.example`)

### Step 7: Start frontend (React + Vite)
Only after backend is fully verified. Pages to build in order:
1. `/register` — registration form (full_name, email, password)
2. `/login` — login form, store JWT in localStorage
3. `/dashboard` — authenticated landing, welcome with `full_name`, list uploads + past jobs
4. `/upload` — image upload form + algorithm selection dropdown
5. `/jobs/:id` — result page showing `result_summary`

See `docs/DECISIONS.md` for all locked Phase 1 frontend decisions.

---

## Phase 2+ (do not start yet)
- Real algorithm integration (Gleason grading, etc.)
- PostgreSQL migration
- Role-based access control (admin role decision still open)
- Cloud deployment (AWS Canada or Azure Canada — decision pending)
- Encrypted cloud storage (S3 / Azure Blob with signed URLs)
- Celery + Redis job queue
- WSI image format support
- REB/ethics approval before any real patient data

See `docs/DECISIONS.md` → "Open Decisions (Phase 2+)" for full list.
