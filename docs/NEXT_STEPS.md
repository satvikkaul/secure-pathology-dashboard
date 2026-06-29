# Next Steps

## Current Status

**Phase 2 — In progress.**

- Phase 1 complete (auth, upload, jobs, results, sidebar, per-user isolation — all curl and Playwright verified).
- Phase 2A (lightweight onboarding) and Phase 2B (profile page + org locking) implemented and committed in `5ccc6be`.
- Latest feature commit: `5ccc6be` (`feat: add user onboarding flow and profile page`).

To start the backend (requires a real `SECRET_KEY` in `backend/.env`):

```bash
cd backend
# First time: cp .env.example .env, then set SECRET_KEY:
#   python3 -c "import secrets; print(secrets.token_hex(32))"
source venv/bin/activate
uvicorn app.main:app --reload
```

> **DB schema changed in Phase 2A/2B.** If your local `backend/pathology.db` was created before commit `5ccc6be`, the backend will fail to start or produce 500 errors because the new columns (`role`, `organization_name`, `org_fields_locked`, etc.) don't exist in the old schema. SQLite's `create_all()` does not ALTER existing tables.
>
> **To reset:** `rm backend/pathology.db` — this permanently deletes all local users, uploaded images, jobs, and demo data. Back up the file first if you need it. The backend recreates the schema automatically on next start.

To start the frontend:

```bash
cd frontend
npm run dev
```

---

## Immediate Tasks

| Task | Status | Notes |
|---|---|---|
| **Onboarding + profile Playwright coverage** | Not done | Manually browser-tested; no automated coverage yet — add before next demo cycle |
| **Browser-verify Session 3 flows** | Not done | Jobs list page, AppLayout persistence, active nav — build-verified only since `0fd801d` |
| **Set contact email in locked profile state** | Not done | `ProfilePage.jsx` locked state shows a placeholder `mailto:` — replace with the real prototype-owner contact address when known |
| **Professor demo / review** | Not done | Present Phase 1 + Phase 2 progress; collect priority feedback for next workstream |

---

## Phase 2 Workstreams

| Item | Status | Notes |
|---|---|---|
| **User onboarding** | ✓ Done — `5ccc6be` | Role required; org fields optional; redirects new users before dashboard |
| **User profile page** | ✓ Done — `5ccc6be` | Read-only account info; editable org context with one-time confirm & lock |
| **Cloud architecture planning** | Not started | Provider-neutral plan in `docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md` (local only) |
| **Provider-specific cloud plan** | Not started | Blocked on provider confirmation from professor / institution |
| **Algorithm interface design** | Not started | Define stable interface for real algorithm registration |
| **Real algorithm integration planning** | Not started | Requirements, compute needs, data governance |
| **Async job / worker / storage migration** | Not started | Queue + worker pattern; PostgreSQL + object storage |

---

## Verification Status (cumulative)

**Backend (curl) — all passing, committed (`0b1e51d` and prior):**
- All auth, image, algorithm, and job endpoints pass
- Per-user data isolation confirmed (User B cannot see User A's data)
- Upload validation: wrong type → 422; renamed extension → 422; 11 MB → 413

**Profile endpoints — manually browser-tested, not curl-verified:**
- `GET /profile/me`, `PUT /profile/me`, `POST /profile/me/lock-org`
- Onboarding gate, org locking, 409 guard on locked profiles

**Frontend (Playwright) — as of `0b1e51d` (41 checks, all pass):**
- Register → login → dashboard → upload → job result flow end-to-end
- 401 in-memory logout, protected routes, client-side validation, error messages
- Dashboard sidebar: collapse/expand, mobile drawer, Sign Out, profile chip

**Manually browser-tested, no Playwright coverage yet:**
- Onboarding flow: register → onboarding → dashboard; refresh skips onboarding (`5ccc6be`)
- Profile page: view, edit org fields, confirm & lock, locked state, topbar chip navigation (`5ccc6be`)

**Build-verified only (no browser or Playwright verification):**
- Session 3 flows: jobs list, AppLayout persistence, active nav (`0fd801d`)

---

## Out of Scope (Phase 2)

- Cloud deployment (AWS Canada / Azure Canada) — planning only until provider confirmed
- PostgreSQL / database migration — Phase 2+
- Real algorithm integration — Phase 2+, pending professor feedback
- Admin roles or dashboards — Phase 2+, pending professor approval
- Celery / Redis job queue — Phase 2+
- Docker — Phase 2+
- WSI image format support — Phase 2+
- Real or de-identified patient data — requires REB / institutional approval
- Formal HIPAA / PIPEDA / PHIPA compliance certification
- Profile field editing after org lock (out-of-band only — user emails the prototype owner; no backend override or admin role involved)
- Playwright test suite expansion — not prioritised until demo cycle complete
