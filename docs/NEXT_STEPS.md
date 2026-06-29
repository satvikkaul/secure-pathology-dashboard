# Next Steps

## Current Status

**Phase 1 is complete.**

- All backend endpoints verified via `curl` (auth, images, algorithms, jobs, per-user isolation).
- Core frontend flows verified in browser. Session 3 UI (jobs list, shared `AppLayout`) is build-verified; browser/Playwright re-verification is recommended before the professor demo.
- README rewritten for professor demo readiness (commit `7c9119a`).
- Cloud-agnostic deployment plan created (local planning doc — `docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md`, not yet committed to git).
- Phase 2 planning document created (local planning doc — `docs/PHASE_2_PLAN.md`, not yet committed to git).

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

## Immediate Task: Professor Demo Preparation

The prototype is ready for professor review. Before the demo meeting, complete:

| Task | Status | Notes |
|---|---|---|
| **Browser verify Login UI + error messages** | Not done | Login card accent bar, subtitle pill, input borders, button tactile feedback; "Incorrect email or password." and "Password must be at least 8 characters." error messages — build-verified only |
| **Browser verify Session 3 flows** | Not done | Jobs list page, AppLayout persistence, active nav — build-verified only; browser check recommended before demo |
| **Screenshots** | Not done | Login, Register, Dashboard, Upload, Jobs List, Job Result — for README and presentation |
| **Demo walkthrough script** | Not done | register → login → upload sample image → select Placeholder v1 → run → view result → logout |
| **Professor demo / review** | Not done | Present Phase 1 prototype; collect Phase 2 priority feedback |

---

## Phase 2 Planning

Phase 2 candidate work — not started, subject to professor and team feedback:

| Item | Description |
|---|---|
| **User onboarding** | Welcome/onboarding page after registration or first login |
| **User profile page** | Read-only account info: name, email, creation date |
| **Cloud architecture planning** | Provider-neutral architecture review; provider-specific plan once confirmed |
| **Provider-specific cloud plan** | After cloud provider is confirmed by team or institution |
| **Algorithm interface design** | Define stable interface for real algorithm registration |
| **Real algorithm integration planning** | Requirements, compute needs, data governance |
| **Async job / worker / storage migration** | Queue + worker pattern; PostgreSQL + object storage |

---

## Verification Status (cumulative)

**Backend (curl) — all passing, committed:**
- All auth, image, algorithm, and job endpoints pass
- Per-user data isolation confirmed (User B cannot see User A's data)
- Upload validation: wrong type → 422; renamed extension → 422; 11 MB → 413

**Frontend (Playwright) — as of `0b1e51d` (41 checks, all pass):**
- Register → login → dashboard → upload → job result flow end-to-end
- 401 in-memory logout: corrupt token → redirect to `/login` without page reload
- Protected routes block unauthenticated access
- Client-side validation: short password, mismatched passwords, file type, file size
- Error messages readable (duplicate email, wrong password, Pydantic errors)
- Dashboard sidebar: collapse/expand, mobile burger + overlay, Sign Out, profile chip initials
- UploadPage: step indicators, drop zone, algorithm lock/unlock, file preview, remove + same-file reselect
- JobResultPage: two-column layout, metric grid, findings card, prototype notice

**UI Polish Session 3 — build-verified only (commit `0fd801d`):**
- Sidebar toggle relocated inside sidebar brand area
- Sidebar persistent on all authenticated pages via shared `AppLayout`
- `/jobs` list page: empty state, job rows, status badges, result links
- Active nav state dynamic via `useLocation()`

**Login UI polish + error messages — build-verified only (uncommitted):**
- `auth.css`: card top accent bar, header/form separator, subtitle pill badge, always-visible input borders, button tactile `:active` state
- `LoginPage.jsx`: "Unauthorized" → "Incorrect email or password."; "String should have at least 8 characters" → "Password must be at least 8 characters."

---

## Out of Scope (do not add during Phase 1 demo prep)

- User onboarding page — Phase 2
- User profile page — Phase 2
- Cloud deployment — Phase 2
- PostgreSQL / database migration — Phase 2
- Real algorithm integration — Phase 2
- Admin roles or dashboards — Phase 2, only if approved
- Celery / Redis job queue — Phase 2
- Docker — Phase 2
- WSI image format support — Phase 2
- Real or de-identified patient data — requires institutional approval
- Formal HIPAA / PIPEDA / PHIPA compliance certification

See `docs/PHASE_2_PLAN.md` (local planning doc) for the full list, or refer to `docs/DECISIONS.md` for locked Phase 1 decisions.
