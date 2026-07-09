# AI Context

## Project Summary
Secure pathology image analysis dashboard for physicians/research users.

## Prototype Scope
The first prototype should show:
- User registration
- Login/logout
- Dashboard access after authentication
- Image upload
- Algorithm selection
- Placeholder or simple algorithm execution
- Basic generated report/result page

## Long-Term Direction
The platform should later support:
- Multiple algorithms
- Modular algorithm registration
- Protected storage of uploaded images
- Protected storage of generated results
- Per-user access control
- Potential cloud deployment in a compliant environment

## Non-Goals for First Prototype
- Full HIPAA/PHIPA/PIPEDA compliance certification
- Real diagnostic claims
- Production-grade AI inference
- Multi-hospital deployment
- Complex admin dashboards unless requested

## Phase 1 Status
Phase 1 is complete. The local prototype has been built, verified, and is ready for professor review. Tech stack is decided and implemented: React + Vite frontend, FastAPI backend, SQLite database.

## Phase 2 Direction

**Implemented (commit `5ccc6be`):**
- User onboarding page — role required after first login; gate blocks dashboard until complete
- User profile page — read-only account info; editable org context with one-time confirm-and-lock
- Both flows manually browser-tested; no Playwright coverage yet

**Not yet started (pending professor feedback and team confirmation):**
- Cloud architecture planning (no deployment yet; provider not yet confirmed)
- Database migration planning — managed PostgreSQL with a schema migration framework
- Private object storage integration planning
- Real algorithm integration planning
- Async job queue and worker service design
- Stronger deployed auth and security model planning

## Open Questions (Phase 2)
- Whether admins can view user uploads/results or only metadata
- Whether users are physicians only or broader approved researchers
- Which algorithm should be integrated first
- Expected deployment target and cloud provider preference
- Expected image formats and sizes beyond JPG/PNG and 10 MB
- Data governance constraints (real, de-identified, or synthetic data only)
