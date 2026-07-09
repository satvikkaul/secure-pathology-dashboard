# Phase 2 Plan

_Secure Pathology Dashboard — Phase 2 Planning Document_

_Prepared: 2026-06-27 | Updated: 2026-06-29 | Status: In progress — Phase 2A (onboarding) and Phase 2B (profile page + org locking) implemented in `5ccc6be`. Remaining workstreams not yet started._

---

## 1. Purpose

Phase 1 validated the full local end-to-end workflow: registration, login, image upload, algorithm selection, synchronous job execution, synthetic result report viewing, and jobs history — with per-user data isolation and a polished authenticated layout. The Phase 1 local prototype is complete and ready for professor review.

Phase 2 is about planning and gradually extending the system beyond the local prototype. The scope and order of Phase 2 work will be confirmed with the supervising professor and team after Phase 1 is reviewed.

**This document is:**
- A planning reference for Phase 2 workstreams
- A starting point for professor and team discussion
- A basis for more detailed implementation plans once priorities are confirmed

**This document is not:**
- A claim that every Phase 2 workstream is already underway
- A cloud deployment commitment
- A claim of HIPAA, PIPEDA, or PHIPA compliance
- A feature roadmap with committed timelines

Cloud deployment and real AI integration require professor and team confirmation before any implementation begins.

---

## 2. Phase 1 Completion Baseline

The following was built, verified, and committed in Phase 1.

**Backend (FastAPI + SQLite — all endpoints curl-verified):**
- User registration and login (email/password, bcrypt hashing, JWT)
- Protected `GET /auth/me` endpoint returning `full_name`
- Per-user image upload with content-type, extension, size, and Pillow magic-byte validation
- Algorithm listing (`placeholder_v1` seeded at startup)
- Synchronous job submission and synthetic result generation
- Per-user data isolation enforced at API level (`owner_id` filter on every image and job query)

**Frontend (React + Vite — core flows browser-verified, Session 3 build-verified):**
- Login, registration, and protected route handling with 401 in-memory logout
- Authenticated dashboard with image and job summary cards
- Upload page with drag-and-drop, step indicators, and algorithm selection
- Job result report page (two-column layout, metrics grid, findings, prototype notice)
- Jobs history page with status badges and result links
- Shared `AppLayout` sidebar persistent across all authenticated pages
- Collapsible sidebar (desktop) and mobile drawer

**Project infrastructure and docs:**
- README rewritten for professor demo readiness (commit `7c9119a`)
- Cloud-agnostic deployment plan created (`docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md`)
- Local SQLite database, local `backend/uploads/` file storage
- No cloud, no Docker, no real patient data, no real AI inference

---

## 3. Phase 2 Workstreams

### 3.1 User Onboarding

**Status:** Implemented in initial form in `5ccc6be`; manually browser-tested.

**Current implementation:**
- Role-required onboarding page shown after first login
- Onboarding gate blocks dashboard access until completion
- Prototype-use guidance and disclaimer included in the flow
- Optional professional-context fields captured alongside the required role
- Onboarding completion flag suppresses the page on subsequent visits after completion

**Remaining follow-up:**
- Add Playwright coverage
- Refine copy or field set only if professor/team feedback calls for it
- Keep the flow lightweight; do not expand into credential verification or RBAC

---

### 3.2 User Profile Page

**Status:** Implemented in initial form in `5ccc6be`; manually browser-tested.

**Current implementation:**
- Sidebar-accessible profile page
- Read-only account information (name, email, role, member-since date)
- Professional-context area with one-time confirm-and-lock behavior
- Locked-state notice with out-of-band contact path for corrections
- Profile chip in the top bar links to `/profile`

**Remaining follow-up:**
- Add Playwright coverage
- Replace the placeholder contact email in the locked state when the real address is known
- Avoid turning the page into full account management, admin settings, or password-management UI

---

### 3.3 Cloud-Agnostic Deployment Planning

**Reference:** `docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md`

The cloud-agnostic deployment plan has been written and covers the full provider-neutral architecture transition. No cloud provider has been selected.

**What remains for this workstream:**
- Professor and team confirmation of cloud provider preference or institutional requirement
- Creation of a provider-specific deployment plan once the provider is confirmed
- Stage 1 refactor planning (documentation only, no deployment): identify config boundaries, define storage abstraction, document job execution boundary

The current local prototype maps to cloud components as follows:

| Current Phase 1 | Cloud-Agnostic Future |
|---|---|
| SQLite via `DATABASE_URL` | Managed PostgreSQL-compatible database |
| `backend/uploads/` via `UPLOAD_DIR` | Private object storage |
| Synchronous `POST /jobs/` handler | Queued async job: API enqueues, worker executes |
| `backend/.env` secrets | Cloud secrets manager |

See `docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md` for the full architecture and provider mapping.

---

### 3.4 Database and Storage Migration Planning

**Current state:**
- SQLite stores users, images, jobs, and algorithm metadata
- `DATABASE_URL` env var is already supported — `database.py` conditionally handles SQLite vs. other drivers
- Image files stored in `backend/uploads/` keyed by UUID — `UPLOAD_DIR` env var is already abstracted
- The codebase uses `Base.metadata.create_all()` with no schema migration framework

**Future direction:**
- Managed relational database (PostgreSQL-compatible)
- Add Alembic or equivalent schema migration framework before any cloud migration — `create_all()` does not alter existing tables safely and will miss schema changes
- Private object storage for image files and any future result artifacts (heatmaps, masks, PDFs)
- Database stores metadata only; raw image bytes always live in object storage, keyed by UUID
- Retention and deletion policy must be defined before any real data is stored

---

### 3.5 Algorithm Integration Planning

**Current state:**
- `placeholder_v1` is a synchronous Python function in `backend/app/algorithms/placeholder.py`
- Called directly inside the `POST /jobs/` request handler; HTTP response blocks for the algorithm's full duration
- Returns fixed synthetic output; receives only `image_id` and does not read image bytes
- Two separate registries exist: a DB row seeded at startup and an in-process `ALGORITHM_REGISTRY` dict in `jobs.py` — both must stay in sync manually

**Future direction:**
- Define a stable algorithm interface so multiple algorithms can be registered cleanly
- Resolve the two-registry issue (DB row and in-process dict) before cloud refactor
- Separate model execution from the API process (worker service or separate container)
- Async queue and worker pattern:
  - API: create job record, enqueue message, return job ID
  - Worker: fetch image from storage, run algorithm, write result, update job status
- Support CPU or GPU depending on algorithm requirements; do not assume always-on GPU
- Confirm model, data, and compute requirements with the professor and team before integrating any real algorithm

Job status lifecycle to implement:
```
pending → queued → running → completed
                           → failed
```

---

### 3.6 Security and Privacy Planning

The following are Phase 2 planning items. None are implemented in Phase 1.

- **Stronger deployed auth** — `httpOnly` secure cookies with token refresh, or institutional SSO; `localStorage` JWT is acceptable for local prototype only
- **Secrets manager** — replace `.env` files with a cloud-managed secret store before any deployment
- **Audit logging** — append-only record of user actions (upload, job submit, result view) with user ID and timestamp; required before any real data
- **Least-privilege access** — service accounts with only the permissions they need
- **Admin access policy** — define whether admins can view uploaded images or only metadata; implement technically before any real data is stored
- **Encryption at rest and in transit** — enforce TLS for all connections; encrypt database and object storage at rest
- **Data residency** — Canada-region by default unless the institution explicitly approves otherwise
- **No compliance claims** — compliance requires institutional review, legal agreements, correct configuration, and ongoing governance; it is not conferred by using a cloud provider's services

---

### 3.7 Demo and Professor Feedback Loop

Before deeper remaining Phase 2 work begins, the current local prototype should be demonstrated to the professor and team and feedback collected.

**Feedback needed on:**
- Dashboard workflow: does it match the intended research use case?
- Whether user onboarding and a profile page are wanted now or later
- Cloud provider preference or institutional requirement
- Whether administrators should be able to view uploaded images or only metadata
- Expected image formats and sizes beyond JPG/PNG and 10 MB
- Which real algorithm or model should be integrated first
- Data governance constraints: real, de-identified, or synthetic data only?
- Any institutional privacy, security, or ethics review requirements

---

## 4. Proposed Phase 2 Order

This order reflects the current state after Phase 2A/2B implementation and will still be confirmed with the professor and team.

1. Professor review and demo of the current local prototype
2. Address any minor UI or workflow fixes from feedback
3. Add Playwright coverage for onboarding/profile and finish remaining verification cleanup
4. Provider-neutral cloud architecture review (using `docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md`)
5. Provider-specific deployment plan, once cloud provider is confirmed
6. Algorithm interface design
7. Real algorithm integration planning (requirements, compute, data governance)
8. Async job / worker / storage migration planning
9. Cloud pilot implementation (Stage 2 in `docs/CLOUD_AGNOSTIC_DEPLOYMENT_PLAN.md`), only after steps 1–8 are complete

---

## 5. What Not To Do Yet

- Do not deploy to cloud until the provider is confirmed and the cloud-ready refactor is complete
- Do not migrate the database until Alembic or equivalent is in place and tested
- Do not introduce real or de-identified patient data without institutional approval
- Do not integrate a real AI algorithm until requirements, compute needs, and data governance are confirmed with the team
- Do not add an admin dashboard or role-based access control unless explicitly approved
- Do not claim HIPAA, PIPEDA, or PHIPA compliance
- Do not assume a specific cloud provider (AWS / Azure / GCP) — keep planning provider-neutral until the team confirms
- Do not add Docker, Celery, or Redis ahead of confirmed need; add them when their specific role is defined

---

## 6. Open Questions

These must be answered before specific Phase 2 implementation decisions can be made.

1. Which cloud provider has the team or institution selected, if any?
2. Is Canada-region hosting mandatory, or can another region be used with institutional approval?
3. Will real patient data ever be used, or only synthetic or de-identified images?
4. What image formats and sizes are expected beyond JPG/PNG and 10 MB?
5. Which real algorithm or model will be integrated first?
6. Will inference require GPU? If so, always-on or job-triggered?
7. Should analysis jobs run synchronously (current), queued and async, or scheduled?
8. What user roles are needed beyond the current single authenticated user role?
9. Can administrators access uploaded images, or should admin access be restricted to metadata only?
10. What data retention period is required for uploaded images and generated results?
11. Is institutional privacy review, security assessment, or REB/ethics approval required before any real data is used, and who initiates that process?

---

## 7. Immediate Next Step

The immediate next step is professor review and demo of the current local prototype, including the Phase 2A/2B onboarding and profile extensions.

**Before the demo meeting:**
- Take screenshots of each page (Login, Register, Dashboard, Upload, Jobs List, Job Result) for the README and any presentation materials
- Prepare a brief demo walkthrough: register → login → onboarding → dashboard → upload a sample image → select Placeholder Analysis v1 → run → view result report → profile → logout
- Add Playwright coverage for onboarding/profile and browser-verify Session 3 flows if time allows

**After professor review:**
- Collect feedback on the workflow and Phase 2 priorities
- Confirm Phase 2 order based on feedback
- Continue remaining Phase 2 work in the order described in Section 4
