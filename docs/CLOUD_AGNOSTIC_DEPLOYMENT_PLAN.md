# Cloud-Agnostic Deployment Plan

_Secure Pathology Dashboard — Architecture Transition Planning Document_

_Prepared: 2026-06-27 | Status: Planning only — no provider selected, no deployment implemented_

---

## 1. Purpose

This document defines a provider-neutral deployment architecture for a future cloud version of the Secure Pathology Dashboard. Its purpose is to describe what cloud components are required and how the current local prototype maps to them, so that a provider-specific design can be created once a cloud provider is confirmed.

**This document is not:**
- A deployment implementation plan
- A cloud provider selection or recommendation
- A claim of HIPAA, PIPEDA, or PHIPA compliance
- A commitment to any Phase 2 timeline or scope

**This document is:**
- An architecture-transition reference for discussions with the supervising team
- A basis for a future provider-specific design once a provider is selected

For Canada-region compute pricing, GPU costs, scenario cost estimates, and a provider comparison, see `docs/cloud_server_options.md`. That document remains the pricing and provider reference; it is not duplicated here.

---

## 2. Assumptions and Non-Goals

These constraints apply to this planning document and to all phases described here. They are consistent with the locked Phase 1 decisions in `docs/DECISIONS.md`.

**Assumptions:**
- The current Phase 1 local prototype is the only deployed system. No cloud infrastructure exists.
- Only synthetic or publicly available sample images may be used until institutional approval is obtained for real data.
- No cloud provider has been selected. This document does not change that.
- Canada-region data residency is the working assumption for any future cloud deployment unless the institution explicitly approves otherwise.

**Non-goals of this document:**
- Selecting a cloud provider
- Claiming compliance with HIPAA, PIPEDA, or PHIPA
- Designing a production-ready system
- Replacing the Phase 1 prototype for the professor review
- Introducing new features or dependencies to the existing codebase

---

## 3. Current Local Prototype Architecture

The Phase 1 prototype consists of a React + Vite frontend and a FastAPI backend, both running locally. The database is a SQLite file. Uploaded images are stored in a private local folder. The only algorithm is a synchronous placeholder function. Per-user data isolation is enforced by filtering every database query on `owner_id`.

| Current Component | Current Implementation | Cloud Limitation |
|---|---|---|
| Database | SQLite file; `DATABASE_URL` env var defaults to `sqlite:///./pathology.db` | File-based, single-writer; not suitable for multi-process or cloud deployment |
| Image storage | `backend/uploads/`; path from `UPLOAD_DIR` env var; UUID-based filenames | Local disk only; not durable, replicated, or accessible from a separate compute node |
| Job execution | Algorithm called synchronously inside `POST /jobs/` request handler | HTTP request blocks for the full duration of the algorithm run; not suitable for long-running inference |
| Algorithm registration | In-process `ALGORITHM_REGISTRY` dict in `jobs.py`; separate DB row seeded at startup | Two mechanisms to keep in sync; not usable across separate worker processes |
| Auth token storage | JWT stored in client `localStorage` | Acceptable for local prototype; not recommended for any deployed environment |
| CORS | Allowed origin hardcoded as `http://localhost:5173` in `main.py` | Must be updated for any deployed frontend URL |
| Secrets | `SECRET_KEY` in `backend/.env` file | `.env` file is not appropriate for cloud; secrets manager required |

---

## 4. Current Verified State

The following has been verified in the Phase 1 prototype and represents the factual baseline this plan builds on.

**Backend — verified via `curl` (all passing):**
- Auth: register (201), login (200), `/auth/me` (200 with `full_name`)
- Images: upload valid JPG/PNG (201); wrong type → 422; renamed extension → 422; file over 10 MB → 413; Pillow magic-byte check rejects non-image bytes
- Algorithms: list (200), returns `placeholder_v1`
- Jobs: submit (201, `status: completed`, `result_summary` populated); list (200); get by ID (200)
- Per-user isolation: User B receives 404 on User A's image and job IDs; User B's list endpoints return empty

**Frontend — verified via Playwright (41/41 checks, commit `0b1e51d`):**
- Register → login → dashboard → upload → job result end-to-end
- 401 in-memory logout without page reload; ProtectedRoute blocks unauthenticated access
- Client-side validation: short password, mismatched passwords, invalid file type, oversized file
- Dashboard sidebar (collapse/expand, mobile drawer, Sign Out); Upload page; Job Result page

**UI Polish Session 3 — build-verified only (39 modules, 0 warnings, commit `0fd801d`):**
- Shared `AppLayout` component; sidebar persistent across Dashboard, Upload, and Job Result pages
- `/jobs` list page with status badges and result links
- These changes compiled cleanly but have not been Playwright-verified; browser verification is recommended before the professor demo

---

## 5. Target Cloud-Agnostic Architecture

A cloud deployment of this system requires the following provider-neutral components. No provider is selected here; specific mappings appear in Section 13.

**Architecture flow:**

```
User
 └─→ Frontend  (static hosting / CDN)
      └─→ Backend API  (containerized managed compute)
           ├─→ Managed Database  (user, image, and job metadata)
           ├─→ Private Object Storage  (image files, result artifacts)
           └─→ Job Queue
                └─→ Worker / Inference Service
                     ├─→ Private Object Storage  (reads image)
                     ├─→ Algorithm execution  (CPU or GPU)
                     └─→ Managed Database  (writes result, updates job status)
                          └─→ User views report via Backend API
```

| Component | Cloud-Agnostic Description |
|---|---|
| Frontend hosting | Static build (HTML/JS/CSS) served from managed hosting or CDN; no server-side rendering required |
| Backend API | Containerized FastAPI process; stateless; horizontally scalable; CORS configured for deployed frontend origin |
| Managed relational database | PostgreSQL-compatible; automated backups; accessed via `DATABASE_URL` env var (already supported in `database.py`) |
| Private object storage | Bucket or container with no public access; server-side encryption at rest; objects keyed by UUID (already implemented locally) |
| Job queue | Durable message queue; decouples API from worker; enables asynchronous job processing |
| Worker / inference service | Separate compute process or container; consumes queue messages; fetches image from storage; runs algorithm; writes result; updates job status |
| Secrets management | Cloud-managed secret store; replaces `.env` files for all deployed environments |
| Identity / auth layer | Managed auth service or institutional SSO; admin access policy to be defined before real data |
| Logging / monitoring | Centralized structured logging; health check endpoints; error alerting; basic metrics |
| Audit trail | Append-only record of user actions (upload, job submit, result view); required before any real data |
| Backup / retention | Automated DB backups; object lifecycle and retention policy; deletion rules defined before real data |
| Network boundary | Private subnets; storage not publicly accessible; API behind load balancer or ingress |

---

## 6. Mapping Current Prototype to Future Cloud Components

| Current Phase 1 | Cloud-Agnostic Future | Notes |
|---|---|---|
| SQLite (`pathology.db`) | Managed PostgreSQL-compatible database | `DATABASE_URL` env var already supported in `database.py`; SQLAlchemy ORM reduces driver-level changes, but schema migration requires explicit planning — the codebase uses `Base.metadata.create_all()` with no migration framework, so adding Alembic or equivalent is a prerequisite before schema evolution in any cloud environment |
| `backend/uploads/` local disk | Private object storage | `UPLOAD_DIR` env var already abstracted; UUID filenames already enforced; storage client library integration required |
| `placeholder_v1` in-process function | Separate model / inference service | Keep algorithm execution decoupled from API process; real algorithms need image bytes from storage, not just image ID |
| Synchronous algorithm call inside `POST /jobs/` | Queued async job: API enqueues, worker executes | Requires job status polling or notification; job status lifecycle already modelled in the DB |
| In-process `ALGORITHM_REGISTRY` dict in `jobs.py` | Worker-side registry or plugin system | Resolve the two-registry issue (DB row + in-process callable dict) before cloud refactor |
| `backend/.env` file | Cloud secrets manager | `SECRET_KEY`, `DATABASE_URL`, storage credentials, and future algorithm keys must be managed via secrets manager |
| Hardcoded CORS `localhost:5173` in `main.py` | Environment-driven allowed origins | One-line change; `CORS_ORIGINS` should be an env var |
| Local uvicorn process | Containerized API service | Dockerfile needed; no architectural change to FastAPI application code |
| `localStorage` JWT | `httpOnly` secure cookies or managed session tokens | Phase 1 decision; must be updated before any deployed environment |
| No structured logging | Centralized logging service | Add structured log format; route to cloud logging; confirm no image contents or filenames appear in logs |

---

## 7. Refactor Boundaries — What Must Stay Stable

The following are not subject to change during cloud planning. Architecture discussions should not trigger rewrites to these areas.

- **Frontend user flows** — register, login, upload, job submission, result view, logout. These are Playwright-verified and professor-demo ready. Cloud planning does not require touching them.
- **Auth behavior** — JWT-based protected routes, 401 in-memory logout, `ProtectedRoute` redirect. This behavior is Phase 1 complete and must be preserved for the current demo.
- **Per-user authorization model** — `owner_id` filter on every image and job database query. This enforcement model carries forward unchanged regardless of which auth system is adopted in deployment.
- **Upload validation rules** — content-type check, extension check, Pillow magic-byte verification, 10 MB size limit. These rules carry forward to cloud; only the storage destination changes, not the validation logic.
- **API contract** — request and response schemas for all endpoints. The frontend depends on these. Any schema change requires a coordinated frontend update and is out of scope for cloud planning.
- **Algorithm result schema** — `prediction`, `confidence`, `findings` JSON structure in `result_summary`. The frontend report page parses this directly. Any real algorithm replacing `placeholder_v1` must match this schema or the frontend must be updated in coordination.

---

## 8. Recommended Deployment Stages

### Stage 0 — Current Local Prototype
**Status: Complete.**

Phase 1 local prototype. React + Vite frontend, FastAPI backend, SQLite, local uploads, placeholder algorithm, synthetic data only. No cloud infrastructure.

**Exit criteria (already met):**
- All backend endpoints verified via `curl`
- Frontend Playwright 41/41 verified (commit `0b1e51d`)
- Per-user isolation confirmed
- Build clean: 39 modules, 0 warnings (commit `0fd801d`)

---

### Stage 1 — Cloud-Ready Refactor Planning
**Status: Not started. No deployment.**

Identify the exact configuration and abstraction boundaries that must change before a cloud pilot. No code is deployed to cloud. This stage is documentation and internal design only.

**Exit criteria:**
- Config boundaries confirmed: `DATABASE_URL`, `UPLOAD_DIR`, `SECRET_KEY`, and CORS origins all environment-driven (first two already are; CORS and secrets need updating)
- Storage abstraction defined: document the interface for read/write of image bytes (local disk vs. object storage) so the switch requires minimal API changes
- Job execution boundary documented: define exactly what the API creates and what the worker consumes
- Auth token model decision documented for any deployed environment (`httpOnly` cookies vs. managed service)

---

### Stage 2 — Minimal Cloud Pilot
**Status: Not started.**

Frontend + backend + managed database + private object storage. No job queue, no GPU, no real data. Synthetic or de-identified images only.

**Exit criteria:**
- Frontend deployed to managed static hosting and reachable via HTTPS
- Backend deployed as containerized service, accessible from frontend
- Database migrated from SQLite to managed PostgreSQL; all endpoints verified
- Images stored in private object storage; upload and retrieve verified end-to-end
- No public storage access confirmed
- Secrets managed via cloud secrets manager, not `.env` files

---

### Stage 3 — Research Deployment
**Status: Not started.**

Add job queue, worker service, audit logging, automated backups, monitoring, and updated auth model. Synthetic or de-identified data only unless institutional approval has been obtained.

**Exit criteria:**
- Job queue connected; API enqueues jobs; worker consumes and executes asynchronously
- Job status lifecycle (`pending → queued → running → completed / failed`) working end-to-end
- Audit log records uploads, job submissions, and result views with user ID and timestamp
- Automated database backup verified and restore tested
- Health check endpoint returning correct status under load balancer
- Auth model updated per team decision (`httpOnly` cookies, institutional SSO, or managed service)

---

### Stage 4 — Real Model Integration
**Status: Not started. Blocked on algorithm selection and Stage 3 completion.**

Replace `placeholder_v1` with a validated algorithm. Worker may require GPU. Algorithm execution must remain isolated from the API process.

**Exit criteria:**
- Placeholder replaced by a real algorithm in the worker service, reviewed by supervising team
- GPU provisioned only if required by the algorithm's compute profile (on-demand or scheduled, not always-on by default)
- Result schema compatible with the frontend report page, or frontend updated in coordination
- No always-on GPU unless usage pattern confirms the need

---

### Stage 5 — Production-Style Readiness
**Status: Not started. Blocked on institutional and legal review.**

Only after institutional/privacy/legal review. Add formal controls appropriate to the data sensitivity of the deployment.

**Exit criteria (defined jointly with the institution):**
- Privacy impact assessment or threat-risk assessment complete
- REB/ethics approval obtained if required for the data being used
- Admin access policy defined and implemented technically
- Data retention and deletion rules implemented and verified
- Incident response process documented
- Security review or penetration test conducted if required by institution

---

## 9. Data and Storage Design

**What goes in the database:**
The relational database stores metadata only: user records, image metadata (UUID filename, content type, file size, `owner_id`, timestamp), and job records (status, algorithm name, `result_summary` JSON, timestamps). No image bytes are stored in the database.

**What goes in object storage:**
Image bytes live in private object storage, keyed by UUID. The UUID-based naming convention is already enforced in `images.py`; original filenames are never stored. If future algorithms produce larger result artifacts (heatmaps, segmentation masks, PDFs), those should also go to object storage, with the database storing only a reference key.

**Storage key rules:**
- Keys must be UUIDs, not original filenames. This is already implemented locally.
- No key should expose user identity, original filename, or content.

**Access rules:**
- No public buckets or containers at any stage.
- Images must not be directly accessible via a public URL.
- The API retrieves images on behalf of the authenticated, authorized user only.

**Retention and deletion:**
- A retention and deletion policy must be defined and implemented before any real data is stored.
- Images must not accumulate indefinitely with no deletion path.
- Retention rules should align with any applicable institutional or legal requirements.

**External services:**
- No raw image bytes should be sent to external AI APIs or third-party model services without explicit institutional approval and a documented legal/privacy agreement.

---

## 10. Algorithm Execution Design

**Current state in Phase 1:**
The algorithm is imported directly into `jobs.py`. An in-process registry dict (`ALGORITHM_REGISTRY`) maps algorithm name strings to callables. The algorithm is called synchronously inside the `POST /jobs/` request handler — the HTTP response blocks until the algorithm returns. The placeholder currently receives only `image_id` and does not read the image file.

This design is appropriate for a local prototype with a one-second simulated delay. It is not appropriate for long-running real inference.

**Future design principles:**
- The API creates a job record (`status: pending`), enqueues a message containing the job ID and the image storage key, and returns immediately.
- A worker service (separate process or container) consumes queue messages, fetches image bytes securely from private object storage, runs the algorithm, writes the result, and updates the job status.
- The frontend polls `GET /jobs/:id` until the status is `completed` or `failed`.
- The API remains stateless and does not hold algorithm code or model weights.
- Algorithm code should be isolated in the worker service, not imported into the API process. This resolves the current two-registry issue (DB row and in-process callable dict).

**Job status lifecycle:**

```
pending → queued → running → completed
                           → failed
```

**GPU provisioning:**
- GPU should not be assumed always-on.
- Provision GPU on-demand per job or on a scheduled window, based on actual workload.
- Refer to `docs/cloud_server_options.md` for Canada-region GPU pricing before making a provisioning decision.

---

## 11. Security and Privacy Controls

These controls apply to any cloud deployment of this system, regardless of provider.

- **Encryption in transit** — HTTPS/TLS for all client-to-API communication; TLS for API-to-database and API-to-storage connections.
- **Encryption at rest** — Object storage and database encrypted at rest using cloud-managed or customer-managed keys.
- **Least-privilege access** — The API service has only the permissions it needs (read/write to its database and storage bucket). The worker has read access to the image storage location and write access to results. No service has broader permissions than required.
- **Private storage** — No public bucket or container policy at any stage. Images are never directly accessible via a public URL.
- **Audit trail** — Append-only log of user actions (upload, job submit, result view) with user ID, timestamp, and resource ID. Required before any real data is stored. Retained per the institution's policy.
- **Secrets management** — `DATABASE_URL`, object storage credentials, `SECRET_KEY`, and any algorithm API keys must be managed via a cloud secrets manager, not `.env` files or source code.
- **Data residency** — Canada-region by default. A different region requires explicit institutional approval.
- **Admin access policy** — It is currently unresolved whether administrators can view uploaded images or only metadata. This policy must be defined and implemented technically before any real data enters the system. See Section 12.
- **Backup and retention** — Automated database backups; object lifecycle and retention policies; verified restore procedure. All required before real data.
- **No compliance claims** — Using a cloud provider's compliance-eligible services does not make this dashboard compliant. Formal compliance requires institutional review, signed legal agreements, correct configuration, and ongoing governance. No compliance claim is made here.

---

## 12. Identity and Access Model

**Current Phase 1:**
Local email/password registration with bcrypt hashing and JWT tokens stored in client `localStorage`. Acceptable for a local prototype with synthetic data. Not recommended for any deployed environment.

**Future options (not yet selected):**

| Option | Description | When appropriate |
|---|---|---|
| Email/password with `httpOnly` secure cookies + token refresh | Simplest upgrade; retains local accounts; eliminates `localStorage` token exposure | Small known-user research group with no institutional SSO requirement |
| Managed identity service | Cloud-provided auth (e.g., Cognito, Azure AD B2C, Firebase Auth); offloads credential management | Preferred if institutional SSO is not required but a hardened auth layer is |
| Institutional SSO | Federated login via hospital or university identity provider; avoids maintaining a separate user database | Required or strongly preferred if users are hospital staff or university researchers with existing credentials |

**Unresolved questions for the team:**
- Can administrators view uploaded images, or should admin access be restricted to metadata only? This must be defined and enforced technically before real data is stored.
- Should user accounts be open registration, invitation-only, or managed entirely by an institutional identity system?
- Should tokens be short-lived with refresh, or session-based?

**Note:** The per-user authorization model (`owner_id` filter on every image and job query) is independent of the authentication mechanism and carries forward unchanged regardless of which auth system is selected.

---

## 13. Illustrative Provider Mapping

Once the team selects a cloud provider, this provider-neutral architecture maps directly to provider services. The table below is illustrative only. No provider is selected or recommended here.

| Component | AWS | Azure | GCP |
|---|---|---|---|
| Frontend hosting | S3 + CloudFront / Amplify | Static Web Apps | Cloud Storage + CDN / Firebase Hosting |
| Backend API | ECS Fargate / App Runner | App Service / Container Apps | Cloud Run |
| Database | RDS PostgreSQL | Azure Database for PostgreSQL | Cloud SQL PostgreSQL |
| Object storage | S3 | Blob Storage | Cloud Storage |
| Job queue | SQS | Service Bus / Storage Queue | Pub/Sub / Cloud Tasks |
| Secrets | Secrets Manager | Key Vault | Secret Manager |
| Logging / monitoring | CloudWatch | Azure Monitor | Cloud Logging / Cloud Monitoring |
| Managed auth (optional) | Cognito | Entra ID / Azure AD B2C | Firebase Auth / Identity Platform |

`docs/cloud_server_options.md` remains the reference for Canada-region pricing, GPU cost estimates, scenario cost ranges, compliance documentation per provider, and the provider analysis. Refer to that document when making a provider decision.

---

## 14. Observability and Operations

These are commonly deferred until deployment is imminent, which results in retrofitting. Brief coverage here so they are not forgotten.

- **Health checks** — Add a `GET /health` endpoint to the FastAPI app. The load balancer or orchestrator uses this to confirm the service is up and route traffic accordingly.
- **Structured logging** — Replace or augment current Python `logging` calls with structured JSON format (including log level, timestamp, request ID, and user ID where appropriate). Route to a centralized log service. Confirm that logs do not contain image contents, original filenames, or result data.
- **Error monitoring** — Alert on elevated 5xx error rates. Track job failure rate by algorithm name. Configure alerting thresholds before any real-data deployment.
- **Metrics** — At minimum: API request latency (p50, p95), upload size distribution, job queue depth, job completion time. More granular metrics can be added once usage patterns are known.
- **Audit trail** — Separate from application logs. Records who uploaded what and when, who submitted which job, and who viewed which result. Append-only. Retained per policy. Required before real data.
- **Backup and recovery** — Automated daily database snapshots. Object storage versioning or lifecycle policy aligned with the retention requirement. Test a restore from backup before any real data is stored.
- **Incident response** — Define who is notified on errors, what the escalation path is, and what the expected response time is. This process must be documented before any real-data deployment.

---

## 15. Open Questions for the Team

These questions must be answered before a provider-specific deployment plan can be written.

1. Which cloud provider has the hospital or research team already selected, if any?
2. Is Canada-region hosting mandatory, or can another region be used with institutional approval?
3. Will real patient data be uploaded at any stage, or only synthetic or de-identified images?
4. Will authentication remain local email/password accounts initially, or must institutional SSO be supported before any cloud pilot?
5. What authentication model is expected for researchers: email/password, institutional SSO, or hospital identity system?
6. Can administrators view uploaded images, or should admin access be restricted to metadata only?
7. What image formats and sizes are expected beyond JPG/PNG and 10 MB?
8. Will algorithms require CPU, GPU, or both? Should GPU be always-on, scheduled, or job-triggered?
9. What is the expected monthly image upload volume and estimated storage growth?
10. What retention period is required for uploaded images and generated results?
11. Is REB/ethics approval, privacy impact assessment, or threat-risk assessment required before using real data, and who initiates that process?

---

## 16. Immediate Recommendation

- **Keep the Phase 1 local prototype unchanged** for the professor review. It is feature-complete, verified, and committed.
- **Do not implement cloud infrastructure yet.** The provider is not confirmed and the open questions in Section 15 have not been answered.
- **Use this document for architecture discussion** with the supervising team. The goal is to align on cloud components, deployment stages, and open questions before selecting a provider.
- **Once a provider is confirmed**, create a provider-specific deployment plan using `docs/cloud_server_options.md` as the pricing and provider reference and this document as the architecture foundation.
- **Stage 1** (cloud-ready refactor planning) can begin as a documentation-only exercise — identifying config boundaries, defining the storage abstraction, and documenting the job execution boundary — without deploying anything.
- **Phase 1 development and cloud planning are independent tracks** and can proceed in parallel without one blocking the other.

---

## 17. Risks and Deferred Decisions

### Risks

| Risk | Impact | Notes |
|---|---|---|
| Unclear real-data approval path | Could block Stage 3 or Stage 4 even if all engineering work is complete | It is not yet known whether REB/ethics approval is required, who initiates it, or how long it takes. Clarify early. |
| Unresolved admin-access policy | Retrofitting access controls after real data is stored is significantly harder than implementing them first | If admins should not view uploaded images, this requires storage policies, RBAC, and audit trail before any real data. |
| Unknown image volume and storage growth | Storage costs and retention policy cannot be finalized without a usage estimate | Start with a conservative assumption; adjust once usage patterns from the pilot are known. |
| Unknown GPU need and cost profile | Cloud GPU costs are significant at Canada-region rates (see `docs/cloud_server_options.md`) | Do not provision GPU until a real algorithm with known compute requirements is selected. Avoid always-on GPU by default. |
| Algorithm correctness is unvalidated | No real algorithm has been reviewed, tested, or approved | The placeholder is not a stand-in for a real model. Algorithm selection and validation are a separate workstream. |

### Deferred Decisions

| Decision | Blocked On |
|---|---|
| Cloud provider selection | Team or institution preference; see `docs/cloud_server_options.md` |
| Managed auth service | SSO vs. local accounts decision (Question 4, Section 15) |
| Job queue technology | Provider selection |
| Object storage client integration | Provider selection |
| Final data retention and deletion policy | Institutional or legal review |
| Admin access model | Stakeholder decision (Question 6, Section 15) |
| GPU provisioning strategy | Real algorithm selection and compute profiling |
