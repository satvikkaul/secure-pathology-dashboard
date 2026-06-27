# Secure Pathology Dashboard

> **Research Prototype — Phase 1**
>
> This software is a local workflow validation prototype. It is **not approved for clinical use**, **not validated for diagnostic purposes**, and **must not be used with real patient data** in any form. No HIPAA, PIPEDA, or PHIPA compliance certification is claimed or implied. All testing must use synthetic or publicly available sample images only.

---

## Overview

Secure Pathology Dashboard is a web-based prototype that allows authenticated users to upload pathology images, select an analysis algorithm, submit an analysis job, and view a generated result report. The system enforces per-user data isolation: users can only access their own uploads and results.

This project is a research prototype built to validate the end-to-end dashboard workflow before real algorithm integration or cloud deployment.

---

## Phase 1 Purpose

Phase 1 establishes and validates the full user-facing workflow in a local environment:

- Authentication (registration, login, protected routes, logout)
- Image upload with server-side validation
- Algorithm selection and synchronous job submission
- Result retrieval and report display
- Per-user data isolation enforced at the API level

The algorithm in Phase 1 is a synchronous placeholder that returns a synthetic result. No real AI inference is performed. The purpose is to confirm the platform architecture and UX flow before integrating real models or moving to cloud infrastructure.

---

## What This Prototype Demonstrates

- **User registration** with email and password (bcrypt-hashed, never stored in plaintext)
- **Login and logout** with JWT-based authentication; protected routes redirect unauthenticated users
- **Authenticated dashboard** showing the user's uploaded images and submitted jobs
- **Pathology image upload** (JPG/PNG, ≤ 10 MB) with server-side type, size, and image-byte validation
- **Algorithm selection** from a registered algorithm list
- **Placeholder analysis job** submitted synchronously; result stored inline on the job record
- **Synthetic result report** displaying prediction label, confidence score, and generated findings
- **Per-user data isolation**: users cannot read, list, or access another user's images or jobs

---

## Phase 1 Limits

- **Local prototype only.** No cloud infrastructure, no remote deployment.
- **No real patient data.** Only synthetic or publicly available sample images may be used.
- **No clinical or diagnostic use.** Results are synthetic and carry no medical meaning.
- **No real AI inference.** The algorithm is a placeholder returning fixed synthetic output.
- **No production deployment security model.** JWT tokens are stored in `localStorage` (acceptable for local prototyping; `httpOnly` cookies are preferred for any deployed environment).
- **No formal compliance certification.** HIPAA, PIPEDA, and PHIPA requirements are not addressed in this phase.

---

## Out of Scope (Phase 1)

- Cloud deployment (AWS Canada, Azure Canada, or any remote environment)
- PostgreSQL or any managed database
- Celery, Redis, or any asynchronous job queue
- Docker or containerised algorithm execution
- Real algorithm integration (Gleason grading, tissue classification, nuclei segmentation, etc.)
- Whole-slide image (WSI) format support (.svs, .ndpi, .tiff)
- Admin roles or admin dashboards
- File download functionality
- Multi-factor authentication (MFA) or single sign-on (SSO)
- `httpOnly` secure cookies
- Real or de-identified patient data
- Formal HIPAA / PIPEDA / PHIPA compliance certification

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, react-router-dom v7 |
| Backend | FastAPI 0.111.0, Uvicorn |
| Database | SQLite (via SQLAlchemy 2.0) |
| Authentication | JWT (python-jose), bcrypt (passlib + bcrypt 3.2.2) |
| Image validation | Pillow 10.3.0 (magic-byte verification) |
| Schema validation | Pydantic v2 |
| Environment config | python-dotenv |

---

## Repository Structure

```
secure-pathology-dashboard/
├── backend/
│   ├── app/
│   │   ├── algorithms/          — placeholder algorithm (synchronous, synthetic output)
│   │   ├── routers/             — auth, images, algorithms, jobs
│   │   ├── auth.py              — bcrypt hashing, JWT creation and decoding
│   │   ├── database.py          — SQLite engine, SessionLocal, Base
│   │   ├── dependencies.py      — get_db, get_current_user
│   │   ├── main.py              — FastAPI app, lifespan (creates tables, seeds algorithm)
│   │   ├── models.py            — User, Image, Algorithm, AlgorithmJob ORM models
│   │   └── schemas.py           — Pydantic request/response schemas
│   ├── uploads/                 — private upload storage (outside web root)
│   ├── .env.example             — environment variable template
│   └── requirements.txt
├── docs/                        — project context, decisions, assumptions, session log
├── frontend/
│   ├── mockups/                 — static HTML reference mockups (not shipped)
│   ├── src/
│   │   ├── api/                 — fetch wrappers: auth, images, algorithms, jobs
│   │   ├── components/          — AppLayout (shared shell), ProtectedRoute
│   │   ├── context/             — AuthContext (token + user state)
│   │   └── pages/               — Login, Register, Dashboard, Upload, Jobs, JobResult
│   └── vite.config.js           — dev proxy: /api/* → localhost:8000
├── CLAUDE.md
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later
- `pip` and `venv`

### 1. Clone the repository

```bash
git clone https://github.com/satvikkaul/secure-pathology-dashboard.git
cd secure-pathology-dashboard
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create the environment file from the template
cp .env.example .env
```

Open `backend/.env` and replace the `SECRET_KEY` placeholder with a real secret:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Paste the output as the value of `SECRET_KEY` in `backend/.env`. The server will refuse to start if this value is missing or still set to the placeholder.

### 3. Frontend setup

```bash
cd frontend
npm install
```

The frontend uses a Vite dev proxy (`/api/* → http://localhost:8000`) so no additional environment configuration is required for a standard local setup. An `.env.example` is provided if the backend port needs to be changed.

---

## Running the Application

**Start the backend** (from the `backend/` directory, with the virtual environment active):

```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

**Start the frontend** (from the `frontend/` directory, in a separate terminal):

```bash
npm run dev
```

**URLs:**

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Swagger / OpenAPI docs | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |

> On first run, SQLAlchemy creates the SQLite database (`backend/pathology.db`) and seeds the placeholder algorithm automatically. No manual database setup is required.

---

## Demo Workflow

1. Open http://localhost:5173 in a browser.
2. Click **Create Account** and register with a name, email, and password (minimum 8 characters).
3. After registration, log in with the same credentials.
4. The **Dashboard** shows your uploaded images and submitted analysis jobs (empty on first login).
5. Click **Upload Image** in the sidebar.
6. Drag and drop or select a JPG or PNG file (maximum 10 MB).
7. Select the **Placeholder Analysis v1** algorithm from the dropdown.
8. Click **Upload and Run**. The job is submitted and executed synchronously.
9. The **Job Result** page displays the synthetic report: prediction label, confidence score, and generated findings.
10. Click **Analysis Jobs** in the sidebar to review all submitted jobs.
11. Click **Sign Out** to log out and confirm the session is cleared.

---

## Verification Summary

**Backend** — all endpoints verified via `curl`:
- Auth: register (201), login (200), `/auth/me` (200)
- Images: upload valid JPG (201); wrong type → 422; renamed extension → 422; file over 10 MB → 413
- Algorithms: list (200), returns `placeholder_v1`
- Jobs: submit (201, `status: completed`, `result_summary` populated); list (200); get by ID (200)
- Per-user isolation: User B receives 404 on User A's image and job IDs; User B's list endpoints return empty

**Frontend** — verified via Playwright (41/41 checks, commit `0b1e51d`):
- Register → login → dashboard → upload → job result flow end-to-end
- 401 in-memory logout: expired or invalid token clears session without page reload
- Protected routes block unauthenticated access
- Client-side validation: short password, mismatched passwords, invalid file type, oversized file
- Error messages surface correctly (duplicate email, wrong password, Pydantic validation errors)
- Sidebar: collapse/expand on desktop, mobile drawer, active nav state, Sign Out

**UI Polish Session 3** — build-verified (39 modules, 0 warnings, commit `0fd801d`):
- Sidebar persistent across Dashboard, Upload, Jobs, and Job Result pages via shared `AppLayout`
- Jobs list page (`/jobs`) with status badges and result links
- Sidebar toggle button relocated inside sidebar brand area

---

## Screenshots

_Screenshots will be added prior to the professor demo._

| Screen | Description |
|---|---|
| Login | Authentication page |
| Register | Account creation page |
| Dashboard | Image and job summary cards |
| Upload Image | Drag-and-drop upload with step indicators |
| Jobs List | Full job history with status badges |
| Job Result Report | Synthetic prediction, confidence, and findings |

---

## Phase 2 Direction

Phase 2 planning will begin after Phase 1 is reviewed. Possible directions include:

- **Real model integration** — replacing the placeholder with a validated algorithm (e.g., tissue classification or nuclei segmentation) using appropriate compute infrastructure
- **Cloud architecture** — evaluating deployment to a Canadian cloud environment (AWS Canada or Azure Canada) with private storage and encrypted transit
- **Stronger authentication** — `httpOnly` secure cookies, token refresh, and optionally MFA or institutional SSO
- **Role-based access** — adding an admin role if required, with a defined policy on whether admins can access user data
- **Larger image format support** — whole-slide image (.svs, .ndpi) handling via OpenSlide with tiling, if required by the algorithm

No Phase 2 scope is committed. Decisions will be made in consultation with the supervising team and subject to any applicable ethics or data governance requirements.
