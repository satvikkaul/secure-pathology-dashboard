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

## Phase 1 Constraints (do not add until Phase 1 backend is verified)
- No frontend yet — backend must be verified in Swagger first.
- No cloud deployment.
- No real patient data.
- No Celery, Redis, Docker, or real AI.
- No admin roles or dashboards.
- No WSI image support.
- No formal compliance claims.

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