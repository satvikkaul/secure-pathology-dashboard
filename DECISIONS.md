# Decision Log

## Phase 1 Decisions (Decided)

### Frontend Framework
**Status: Decided**
**Decision:** React + Vite
**Rationale:** Lightweight, fast dev server, widely used, and sufficient for a local prototype without the overhead of Next.js SSR/routing.

---

### Backend Framework
**Status: Decided**
**Decision:** FastAPI (Python)
**Rationale:** Fast to develop, async-capable, built-in OpenAPI docs, natural fit for future AI/ML integration. Consistent with the recommended MRP stack.

---

### Database
**Status: Decided — Phase 1**
**Decision:** SQLite (local file via SQLAlchemy)
**Rationale:** Zero setup for local prototyping. SQLAlchemy ORM means switching to PostgreSQL later requires minimal code changes.
**Phase 2+:** Migrate to PostgreSQL (local or managed cloud).

---

### Authentication
**Status: Decided**
**Decision:** Email/password with bcrypt hashing + JWT tokens
**Rationale:** Simple to implement, no external service dependency, sufficient for a prototype with a single user role.
**Token storage:** localStorage for Phase 1 (simple, no CORS cookie complexity). httpOnly secure cookies are preferred for production.

---

### Image Upload Storage
**Status: Decided — Phase 1**
**Decision:** Local private folder (`backend/uploads/`) with UUID-based filenames
**Rationale:** Keeps files off the public web root, avoids filename collisions and sensitive-name exposure. No cloud account needed for local prototype.
**Phase 2+:** Migrate to private S3 or Azure Blob Storage with signed URLs.

---

### Image Formats
**Status: Decided — Phase 1**
**Decision:** JPG, JPEG, PNG only
**Rationale:** Sufficient for demo/synthetic pathology patches. Keeps file validation simple.
**Phase 2+:** Evaluate whole-slide image (WSI) formats (.svs, .ndpi, .tiff) if needed.

---

### Algorithm Execution
**Status: Decided — Phase 1**
**Decision:** Synchronous placeholder functions; no job queue, no Docker
**Rationale:** The professor's request is to validate the dashboard workflow first. A placeholder is enough to demonstrate end-to-end flow. Synchronous execution avoids Celery/Redis infrastructure complexity.
**Phase 2+:** Dockerized algorithms + Celery+Redis (or cloud queue) for real inference.

---

### Data for Prototype
**Status: Decided — Phase 1**
**Decision:** Sample, synthetic, or demo pathology images only
**Rationale:** Avoids REB/ethics review dependency. Keeps Phase 1 unblocked.
**Phase 2+:** Clarify with professor whether de-identified or real data will be used and obtain appropriate approvals.

---

### User Roles
**Status: Decided — Phase 1**
**Decision:** Single user role (normal authenticated user)
**Rationale:** The professor's Phase 1 scope does not require admin features. Adding RBAC now would over-complicate the prototype.
**Phase 2+:** Add admin role; decide on admin image-access policy (raw vs metadata-only vs masked).

---

### Result Storage
**Status: Decided — Phase 1**
**Decision:** `result_summary` column directly on the `algorithm_jobs` table
**Rationale:** Eliminates a separate results table and endpoint for Phase 1. The job endpoint returns the result inline after synchronous execution.
**Phase 2+:** Separate `results` table if results include files (heatmaps, masks, PDFs).

---

### Deployment
**Status: Decided — Phase 1**
**Decision:** Local development only
**Rationale:** Cloud deployment adds cost and complexity before the workflow is validated.
**Phase 2+:** AWS Canada or Azure Canada (decision pending on cloud provider alignment with hospital/institution).

---

## Open Decisions (Phase 2+)

| Decision | Options | Blocking? |
|----------|---------|-----------|
| Cloud provider | AWS Canada vs Azure Canada | No — Phase 2 |
| Admin access model | Raw images vs metadata-only vs masked | No — Phase 2 |
| Real data type | De-identified, synthetic, or public dataset (e.g., TCGA) | No — Phase 2, needs REB |
| First real algorithm | Gleason grading, tissue classification, nuclei segmentation | No — Phase 2 |
| WSI support | OpenSlide + tiling required | No — Phase 2+ |
| REB/ethics approval status | Required if real patient data used | No — Phase 2 |
| Data retention policy | Image + result retention period, deletion rules | No — Phase 2 |
