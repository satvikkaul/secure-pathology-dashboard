# Assumptions

## Phase 1 Scope (Local Prototype)

These assumptions are confirmed for Phase 1. They will be revisited before Phase 2 (real algorithm integration) and Phase 3 (cloud deployment).

## Product Assumptions

1. Users must register and log in before accessing the dashboard.
2. Each uploaded image belongs to the user who uploaded it.
3. Users can only view their own uploads and job results — no cross-user access.
4. The first algorithm is a synchronous placeholder that returns a synthetic result summary.
5. The purpose of Phase 1 is to validate the end-to-end workflow, not produce clinical-grade outputs.
6. Only sample, synthetic, or demo pathology images are used in Phase 1 — no real patient data.
7. Only JPG, JPEG, and PNG image formats are supported in Phase 1.

## Technical Assumptions

1. The dashboard uses a web-based architecture with a separated frontend and backend.
2. Frontend: React + Vite.
3. Backend: FastAPI (Python).
4. Database: SQLite for local prototype (PostgreSQL in a later phase).
5. The backend exposes REST APIs for authentication, image upload, algorithm listing, job submission, and job/result retrieval.
6. Uploaded files are stored in a private local folder (`backend/uploads/`) outside the public web root.
7. The algorithm layer is modular so new algorithms can be registered later without rewriting the platform.
8. JWT tokens are stored in localStorage for this prototype. httpOnly secure cookies are preferred for production.

## Security Assumptions

1. Uploaded images are treated as sensitive data even in prototype mode.
2. Access control is enforced server-side on every endpoint — frontend-only hiding is not sufficient.
3. Passwords are hashed with bcrypt before storage; plaintext passwords are never stored or logged.
4. Secrets (JWT secret key, etc.) are stored in environment variables, not committed to Git.
5. Logs must not contain uploaded image contents, original filenames, or result data.
6. File uploads are validated for type (extension check) and size before being accepted.
7. HTTPS is assumed for any future deployment.

## Out of Scope for Phase 1

- Real or de-identified patient data
- REB/ethics-dependent data handling
- Cloud deployment
- Admin roles or admin dashboards
- Whole-slide image (WSI) support
- Job queues (Celery, Redis, SQS, etc.)
- Dockerized algorithm containers
- Formal HIPAA/PIPEDA/PHIPA compliance certification
- File download functionality
- MFA or SSO
