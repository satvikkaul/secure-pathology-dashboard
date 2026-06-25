# Next Steps

## Current Status
Auth endpoints verified working in Swagger. Next session starts with upload/algorithm/job verification.

To start the backend:
```bash
cd backend
../.venv/bin/uvicorn app.main:app --reload
```

---

## Immediate — Backend Verification in Swagger

Complete these in order before touching the frontend.

### Step 1: Verify algorithm listing
- `GET /algorithms/` — with Bearer token → should return `placeholder_v1` with `display_name`, `description`, `version`

### Step 2: Verify image upload
- `POST /images/` — upload a valid JPG or PNG under 10 MB → `201` with `id`, `content_type`, `file_size`

### Step 3: Verify invalid upload rejection
- Upload a `.pdf` file → `422`
- Upload a file renamed to `.jpg` that is not a real image (e.g. a text file) → `422` (Pillow catches it)
- Upload a file over 10 MB → `413`

### Step 4: Verify job submission and result
- `POST /jobs/` — body: `{"image_id": <id from Step 2>, "algorithm_name": "placeholder_v1"}` → `201` with `result_summary` populated and `status: "completed"`
- `GET /jobs/` — with Bearer token → list shows the job just created
- `GET /jobs/{id}` — with Bearer token → returns full job details including `result_summary`

### Step 5: Verify per-user data isolation
1. Register **User A**, log in, upload an image, run a job — note the image `id` and job `id`
2. Register **User B**, log in, get a Bearer token for User B
3. Using **User B's token**:
   - `GET /images/` → must return empty list (not User A's image)
   - `GET /jobs/` → must return empty list (not User A's job)
   - `GET /images/{user_a_image_id}` → must return `403` or `404`
   - `GET /jobs/{user_a_job_id}` → must return `403` or `404`

---

## After Backend Verification Passes

### Step 6: First git commit
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
