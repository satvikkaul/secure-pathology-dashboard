# Claude Project Instructions

## Project
Secure web-based dashboard for pathology image analysis. MRP project.

Goal: authenticated users can register, log in, upload pathology images, select an analysis algorithm, run it, and view results. Currently a local prototype for technical and UX validation.

## Read These First
Before starting any work, read:
- `docs/AI_CONTEXT.md` — project scope and long-term direction
- `docs/ASSUMPTIONS.md` — confirmed Phase 1 assumptions
- `docs/DECISIONS.md` — all locked and pending decisions
- `docs/SESSION_LOG.md` — current repo state, what is done, what is broken
- `docs/NEXT_STEPS.md` — the immediate next task

## Core Rules
- Do not assume uploaded medical/pathology images are public.
- Do not design features where one user can view another user's uploads or results.
- Do not log uploaded image contents, filenames with identifying information, or sensitive result data.
- Prefer simple, secure architecture. Do not over-engineer.
- Ask before introducing major new dependencies.
- Prefer small, reviewable changes.
- Explain architectural tradeoffs clearly.

## Phase Status

**Phase 1 — Complete.** Backend and core frontend flows curl and Playwright verified. README rewritten for demo readiness (`7c9119a`).

**Phase 2 — In progress** (commit `5ccc6be`):
- Phase 2A (lightweight onboarding): role-required onboarding page after first login; `OnboardingGuard` blocks dashboard until complete. Backend: `GET/PUT /profile/me`, `onboarding_completed` flag.
- Phase 2B (profile page + org locking): read-only account card; editable Professional Context with one-time confirm-and-lock flow. Backend: `POST /profile/me/lock-org`, `org_fields_locked` flag, 409 guard.
- Both browser-tested. No Playwright coverage yet; Session 3 UI still needs browser re-verification.
- Current focus: remaining verification cleanup, replacing the placeholder contact email in locked profile state, and professor demo/review prep.

Remaining Phase 2 items (not yet started): cloud architecture planning, PostgreSQL migration, real algorithm integration, async job queue.

## Out of Scope (do not add)
- Cloud deployment (AWS Canada / Azure Canada)
- Real or de-identified patient data / REB approval
- Admin roles or admin dashboards
- Real algorithm integration (Gleason grading, etc.)
- Job queues (Celery, Redis)
- Dockerized algorithm containers
- WSI image format support
- httpOnly secure cookies / MFA / SSO
- File download functionality
- Formal HIPAA / PIPEDA / PHIPA compliance certification

## Coding Style
- Build incrementally.
- Prefer readable code over clever code.
- Add comments only where they clarify non-obvious decisions.
- Keep frontend, backend, database, and algorithm execution modular.

## Security Priorities
1. Authentication (including safe password validation)
2. User-specific authorization
3. Secure image upload handling
4. Private result access
5. Secrets management
6. Minimal logging of sensitive data


## Git Safety Rules

Before any commit:
- Run git status --short.
- Confirm no .env, database, virtual environment, cache, uploaded image, or node_modules files are included.
- Do not commit or push unless explicitly instructed.
