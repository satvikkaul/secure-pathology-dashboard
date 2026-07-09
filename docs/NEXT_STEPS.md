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
| **Fix code-review findings (sequenced into 4 workstreams)** | ✓ Done — 2026-07-05 | All 15 fixed (WS1–WS4). Backend curl-verified; frontend build + browser spot-checked. See SESSION_LOG 2026-07-05 |

### Fix sequencing (smallest blast radius first) — completed 2026-07-05

**WS1 — Redesign org-lock state model (findings 1, 3, 7 + dedup 14).** One backend pass on `profile.py`: `lock_org` requires `onboarding_completed`; both endpoints use `model_dump(exclude_unset=True)`; the 409 guard rejects only org fields the payload touches (not the whole PUT, so role stays editable). Dedup the twin endpoint bodies in the same pass so the fix lands once.

**WS2 — Onboarding routing/guard (findings 2, 4).** Reverse-guard `/onboarding` (onboarded users → `/dashboard`); in `AuthContext.jsx:38` distinguish a real getProfile failure from "no profile yet" instead of collapsing to `onboardingCompleted=false`; prefill the onboarding form from profile.

**WS3 — Independent correctness fixes (6, 8, 9), parallelizable.** #6 startup schema check or Alembic migration (fail loud, not `no such column`); #8 `Field(max_length=…)`; #9 parse `created_at` as UTC.

**WS4 — Cleanup (10, 11, 12, 13, 15), last.** Finding 5 (refreshProfile conflation) resolves almost for free once #12 makes mutations update context directly.

Verify per workstream (register→onboard→lock is the critical path), not at the end.
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
| **Algorithm interface design** | ✓ Built — 2026-07-06 | Result template system implemented per `docs/ALGORITHM_RESULT_TEMPLATE_PLAN.md`: `ResultEnvelope` validated at job completion, `result_type` registry + generic fallback, Classification template, 3 `Algorithm` metadata columns. Curl + browser verified. Dormant until a second algorithm exists |
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
