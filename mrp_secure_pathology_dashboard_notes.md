# MRP Consolidated Notes: Secure Pathology Image Analysis Dashboard

## 1. Updated MRP Direction

The MRP direction has changed after the meeting with the professor.

The project is now connected to a hospital-independent research team and will count as the Major Research Paper (MRP).

The new MRP is focused on designing and developing a secure web-based dashboard where approved users, likely physicians or research users, can upload pathology images, choose from multiple available algorithms, run selected algorithms, and view the results securely.

The previous Gleason grading / prostate cancer histopathology topic can still fit inside this broader platform as one possible algorithm or use case, but the main MRP direction is now the secure medical image analysis platform itself.

---

## 2. Working MRP Topic

Possible working title:

> Secure Cloud-Based Dashboard for Pathology Image Analysis with Modular Algorithm Integration

Alternative title:

> Design and Development of a Privacy-Preserving Web Dashboard for Pathology Image Analysis Using Modular AI Algorithms

More technical version:

> A Secure and Extensible Cloud-Based Platform for Pathology Image Upload, Algorithm Selection, AI Inference, and Result Visualization

---

## 3. Core Project Idea

The platform should allow a user to:

1. Sign up / sign in
2. Upload pathology images
3. Select one or more available algorithms
4. Run the selected algorithm on the uploaded image
5. View the generated results
6. Access only their own uploaded images and results
7. Support future addition of more algorithms, dashboard components, and menu options

The system is expected to be a website hosted on a reputable cloud server.

Because the uploaded data is medical image data, privacy, access control, data protection, and secure computation are central requirements.

---

## 4. High-Level System Workflow

```text
User Authentication
        ↓
Secure Image Upload
        ↓
Algorithm Selection
        ↓
Backend Processing / AI Inference
        ↓
Result Storage
        ↓
Secure Result Display
        ↓
Audit Logging / Access Control
```

---

## 5. Updated Research / Engineering Question

A strong way to frame the MRP is:

> How can we design and implement a secure, extensible, privacy-aware pathology image analysis platform that allows controlled execution of multiple algorithms on medical images while protecting user-uploaded data and results?

Another possible framing:

> How can a modular web-based dashboard support pathology image analysis workflows while maintaining strict user-level data isolation, secure algorithm execution, and cloud compliance considerations?

---

## 6. Key Functional Requirements

The dashboard should support:

- User registration and login
- User authentication
- Secure pathology image upload
- Storage of image metadata
- Private user-specific image access
- Algorithm selection interface
- Running selected algorithms
- Displaying algorithm results
- Viewing previous uploads and results
- Future support for additional algorithms
- Future support for additional dashboard/menu components
- Admin or researcher management features, depending on project scope

---

## 7. Key Non-Functional Requirements

The system should be:

- Secure
- Privacy-aware
- Extensible
- Modular
- Cloud deployable
- Maintainable
- Auditable
- Scalable enough for research use
- Designed with medical data protection in mind
- Built with future algorithm integration in mind

---

## 8. Important Clarification: Admin Access

One important point still needs to be verified with the professor / research team:

> Can admins view uploaded pathology images, or should even admins be restricted from viewing raw images?

This affects the access-control model.

Possible options:

### Option A: Admins can view uploaded images

This is simpler technically, but it requires strict policy controls and audit logging.

### Option B: Admins can only view metadata, not raw images

This is more privacy-preserving. Admins may be able to see upload status, job status, file IDs, and error logs without seeing the actual medical image.

### Option C: Images are masked, de-identified, or redacted before admin visibility

This depends on whether the pathology image contains identifiable information in the image, metadata, filename, slide label, or embedded annotations.

This needs to be clarified before finalizing the database design, access-control rules, and dashboard permissions.

---

## 9. Compliance Caution

The cloud provider being reputable or “HIPAA eligible” does not automatically make the application compliant.

Compliance depends on:

- Cloud provider capabilities
- Correct use of approved cloud services
- Business Associate Agreement, if HIPAA applies
- Data residency requirements
- Encryption
- Access control
- Audit logging
- Data retention policies
- Institutional approval
- Legal/privacy review
- User roles and permissions
- Whether data is identifiable or de-identified
- Whether real patient data is used

For Canada/Ontario, the project should consider:

- PIPEDA
- PHIPA, especially if Ontario health information is involved
- Institutional research ethics requirements
- Hospital privacy and security rules

Safer wording:

> The system is designed with HIPAA/PIPEDA/PHIPA-aligned safeguards, pending institutional legal, privacy, and ethics review.

Avoid claiming:

> The system is HIPAA/PIPEDA compliant.

Unless that has been formally verified by the institution/legal/privacy team.

---

## 10. Recommended Cloud Providers

The system should be hosted on a reputable cloud provider that supports healthcare/security compliance features.

Recommended options:

### Option A: AWS Canada

Good fit if the team wants flexibility for AI/ML infrastructure.

Relevant services:

- Amazon Cognito for authentication
- Amazon S3 for encrypted image storage
- Amazon RDS PostgreSQL for metadata
- ECS/Fargate or EKS for algorithm containers
- AWS Lambda for lightweight tasks
- CloudWatch for logging
- AWS KMS for encryption keys
- IAM for access control
- VPC/private networking

### Option B: Microsoft Azure Canada

Good fit if the hospital, university, or research team already uses Microsoft infrastructure.

Relevant services:

- Microsoft Entra ID / Entra External ID / B2C for authentication
- Azure Blob Storage for image storage
- Azure Database for PostgreSQL
- Azure Container Apps or AKS for algorithm execution
- Azure Key Vault for secrets and keys
- Azure Monitor for logging
- Private endpoints
- Defender for Cloud

### Option C: Google Cloud

Also possible, especially if the team already uses Google Cloud or specific GCP healthcare tooling.

Relevant services:

- Cloud Storage
- Cloud SQL
- Vertex AI or GKE
- Secret Manager
- IAM
- Cloud Logging

### Strong Recommendation

Use:

> Azure Canada if the hospital/research team is Microsoft-heavy.

Use:

> AWS Canada if the project needs more flexible AI/ML/cloud engineering options.

For hospital alignment, Azure may be easier. For ML/platform engineering flexibility, AWS is very strong.

---

## 11. Recommended Architecture

```text
Frontend Website
React / Next.js
        ↓
Authentication
Cognito / Azure Entra / Auth0 with healthcare-safe configuration
        ↓
Backend API
FastAPI / Django / Node.js
        ↓
Database
PostgreSQL for users, image metadata, jobs, algorithm registry, and results
        ↓
Secure Object Storage
S3 / Azure Blob Storage for pathology images and output files
        ↓
Algorithm Execution Layer
Dockerized algorithms
        ↓
Job Queue
Celery/RQ + Redis, SQS, or Azure Queue
        ↓
Result Service
Stores predictions, heatmaps, masks, reports, and output metadata
        ↓
Audit Logging
Tracks upload, access, algorithm run, result view, and admin actions
```

---

## 12. Recommended Tech Stack

### Frontend

- React or Next.js
- Tailwind CSS
- Role-based dashboard UI
- Secure upload interface
- Result visualization pages

### Backend

- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- JWT/OAuth2 or managed cloud authentication
- REST API

### Storage

- AWS S3 or Azure Blob Storage
- Private buckets/containers only
- Short-lived signed URLs for controlled access
- Server-side encryption

### Algorithm Execution

- Dockerized algorithms
- Standard input/output interface
- Job queue for long-running inference
- GPU support later if required

### Queue

Prototype:

- Celery + Redis

Production-style cloud version:

- AWS SQS
- Azure Queue Storage
- Azure Service Bus

### Security

- HTTPS/TLS
- KMS or Azure Key Vault
- Role-based access control
- Audit logging
- Secrets management
- Environment-based configuration

---

## 13. Modular Algorithm Design

The platform should not hard-code each algorithm directly into the dashboard.

Instead, it should use a plugin-style or registry-based design.

Example structure:

```text
algorithms/
│
├── gleason_grading_resnet/
│   ├── config.yaml
│   ├── model.py
│   ├── inference.py
│   └── requirements.txt
│
├── nuclei_segmentation/
│   ├── config.yaml
│   ├── inference.py
│   └── requirements.txt
│
├── tissue_classification/
│   ├── config.yaml
│   ├── inference.py
│   └── requirements.txt
```

Each algorithm should expose a standard interface.

Example:

```python
def run_inference(image_path: str, output_dir: str, params: dict) -> dict:
    ...
```

The dashboard should only need to know:

- Algorithm name
- Input type
- Allowed parameters
- Output format
- Docker image/container name
- Version
- Required resources
- Permissions

This allows new algorithms to be added later without rewriting the entire platform.

---

## 14. Algorithm Registry Concept

The backend can maintain an algorithm registry.

Example algorithm metadata:

```json
{
  "id": "gleason_resnet_v1",
  "name": "Gleason Grading ResNet",
  "description": "Classifies prostate histopathology patches into Gleason-related categories.",
  "input_type": "image",
  "output_type": "classification",
  "version": "1.0.0",
  "container_image": "registry/gleason-resnet:v1",
  "enabled": true
}
```

This design supports future algorithms and menu options.

---

## 15. Data Privacy Model

Basic rule:

> A user can only access images, jobs, and results that they uploaded or are explicitly authorized to view.

Backend authorization is mandatory.

Do not rely only on frontend hiding.

Every backend query should enforce user ownership.

Example:

```sql
SELECT * FROM images
WHERE uploaded_by_user_id = current_user.id;
```

---

## 16. Suggested Database Tables

Possible tables:

```text
users
images
algorithms
algorithm_jobs
results
audit_logs
roles
permissions
```

### users

```text
- id
- name
- email
- role
- created_at
- last_login
- is_active
```

### images

```text
- id
- uploaded_by_user_id
- storage_path
- original_filename
- file_type
- file_size
- checksum
- upload_time
- status
- deidentified_flag
```

### algorithms

```text
- id
- name
- description
- version
- container_image
- input_type
- output_type
- enabled
- created_at
```

### algorithm_jobs

```text
- id
- image_id
- user_id
- algorithm_id
- status
- submitted_at
- started_at
- completed_at
- error_message
```

### results

```text
- id
- image_id
- job_id
- user_id
- algorithm_id
- result_path
- result_summary
- created_at
```

### audit_logs

```text
- id
- user_id
- action
- resource_type
- resource_id
- timestamp
- ip_address
- outcome
```

---

## 17. AI Computation Leakage Prevention

Medical images should not be sent to external AI APIs or third-party model services unless there is formal approval and proper legal/data-processing agreements.

For the MRP prototype, the safest design is:

- Inference runs inside the controlled cloud environment
- Algorithms run in internal containers
- No public external AI API calls
- No raw medical image logging
- No PHI in prompts
- No use of public hosted AI services for medical image processing unless approved
- No developer downloading real patient images locally unless approved
- No model training on uploaded user data unless explicitly approved

Safe workflow:

```text
Upload image
        ↓
Encrypted cloud storage
        ↓
Internal inference container
        ↓
Encrypted result storage
        ↓
User-specific result display
```

---

## 18. Security Controls to Include

### Authentication

- Email/password or institutional login
- MFA if possible
- Strong password policy
- Session expiry
- Refresh token rotation

### Authorization

- Role-based access control
- User-specific data boundaries
- Backend-level authorization checks
- No cross-user access
- Admin access rules to be confirmed

Possible roles:

- Physician/user
- Researcher
- Admin
- Algorithm developer

### Encryption

- HTTPS/TLS in transit
- Encryption at rest for images
- Database encryption
- Object storage encryption
- Key management through AWS KMS or Azure Key Vault

### Upload Security

- File type validation
- File size limits
- Malware scanning if possible
- Metadata stripping/de-identification if required
- Hash/checksum verification
- Private storage only
- No public buckets/containers

### Audit Logs

Track:

- Login
- Logout
- Upload
- Image access
- Algorithm execution
- Result access
- Failed access attempts
- Admin actions
- Permission changes

### Data Retention

Define:

- How long uploaded images are kept
- How long results are kept
- Who can delete images
- Who can delete results
- Backup retention period
- Whether images/results are anonymized for research
- What happens when a user account is disabled

---

## 19. Suggested Build Phases

### Phase 1: Local MVP

Build locally first.

Features:

- Sign up / sign in
- Upload image
- Store image metadata
- Show uploaded image list
- Add dummy algorithm
- Run dummy algorithm
- Show result

Dummy algorithm output example:

```json
{
  "prediction": "Demo pathology result",
  "confidence": 0.82,
  "notes": "This is a placeholder algorithm output."
}
```

### Phase 2: Real Algorithm Integration

Add one real or semi-real pathology image algorithm.

Possible algorithms:

- Gleason grading classifier
- Tissue classification
- Nuclei segmentation
- Tumor/benign classifier
- Artifact detection

### Phase 3: Security Layer

Add:

- Role-based access control
- User-specific image access
- Audit logs
- Encrypted storage
- File validation
- Access-control tests
- Admin restrictions depending on team decision

### Phase 4: Cloud Deployment

Deploy to AWS Canada or Azure Canada.

Include:

- HTTPS
- Private object storage
- Managed database
- Managed secrets
- Logging
- Backup
- Restricted network access
- Environment separation

---

## 20. Suggested MVP Scope

A realistic MRP MVP should include:

```text
Secure login
+ pathology image upload
+ private user-specific image storage
+ algorithm selection
+ one working algorithm
+ result visualization
+ audit logging
+ cloud deployment design or prototype deployment
```

This is enough for a strong MRP.

Do not promise a full production-grade hospital system.

---

## 21. Features to Leave for Future Work

Possible future extensions:

- More algorithms
- More user roles
- Hospital SSO
- GPU autoscaling
- Clinical validation
- Regulatory review
- Advanced reporting
- More visualization tools
- DICOM/WSI support
- Integration with hospital systems
- FHIR/HL7 integration
- Algorithm upload through UI
- Model monitoring
- Usage analytics
- De-identification pipeline

---

## 22. Suggested MRP Report Structure

```text
1. Introduction
   - Medical image analysis problem
   - Pathology workflow challenge
   - Need for secure AI dashboard
   - Research objectives

2. Background
   - Digital pathology
   - Pathology image analysis algorithms
   - Gleason grading or relevant pathology use case
   - Medical AI dashboards
   - Privacy and security requirements
   - HIPAA/PIPEDA/PHIPA-aligned system design

3. Requirements Analysis
   - Functional requirements
   - Non-functional requirements
   - Security requirements
   - Privacy requirements
   - Extensibility requirements

4. System Architecture
   - Frontend
   - Backend
   - Database
   - Storage
   - Authentication
   - Algorithm execution layer
   - Cloud deployment

5. Algorithm Integration Framework
   - Plugin-style design
   - Dockerized algorithms
   - Input/output contracts
   - Adding new algorithms

6. Security and Privacy Design
   - Access control
   - Encryption
   - Audit logs
   - Data isolation
   - Cloud compliance considerations
   - Threat model

7. Implementation
   - Technologies used
   - Database schema
   - API endpoints
   - Dashboard screens
   - Upload workflow
   - Result visualization

8. Evaluation
   - Functional testing
   - Security testing
   - Performance testing
   - Usability feedback if available
   - Algorithm execution tests

9. Discussion
   - Limitations
   - Compliance limitations
   - Future work
   - Clinical deployment considerations

10. Conclusion
```

---

## 23. Suggested Evaluation Plan

The MRP should not only show that the dashboard works.

It should evaluate the platform.

Possible evaluation categories:

### Functional Testing

- Can users sign in?
- Can users upload images?
- Can users select algorithms?
- Can users run jobs?
- Can users view results?
- Can users see past uploads?

### Access-Control Testing

- User A cannot view User B’s images
- User A cannot view User B’s results
- Unauthorized users cannot access private endpoints
- Expired sessions are rejected
- Admin behavior matches the final access policy

### Security Testing

- Invalid file types are rejected
- Oversized files are rejected
- Private storage is not publicly accessible
- Secrets are not exposed in code
- API endpoints require authentication

### Performance Testing

- Upload time
- Algorithm execution time
- Result retrieval time
- Concurrent job behavior

### Extensibility Testing

- Add a dummy new algorithm
- Register it in the algorithm registry
- Run it through the same dashboard workflow
- Confirm that the frontend/backend do not need major rewrites

---

## 24. Questions to Ask the Professor / Team

These should be clarified before building too much.

1. Will uploaded pathology images contain identifiable patient information?
2. Will the images be de-identified before upload?
3. Is the project governed by PHIPA, PIPEDA, HIPAA, or all of them?
4. Does the hospital require Canadian data residency?
5. Is there a required cloud provider?
6. Will the MRP use real patient data, de-identified data, synthetic/demo data, or public data?
7. Can admins view uploaded images, or only metadata?
8. If admins cannot view images, how should images be masked or access-restricted?
9. How long should uploaded images be retained?
10. How long should algorithm results be retained?
11. Who owns the data and model outputs?
12. Does this project require REB / ethics approval?
13. Who are the expected users?
14. What user roles are needed?
15. Do algorithms need GPU support?
16. What image formats need to be supported?
17. Are whole-slide images required, or only smaller image patches?
18. Should new algorithms be added by developers through code, or by users through the UI?
19. Does the dashboard need hospital SSO?
20. Is this meant to be a research prototype or a clinically deployable system?

Important distinction:

> A research prototype and a clinically deployable system are not the same thing.

---

## 25. Career / Resume Positioning

This MRP is valuable because it combines:

- Medical AI
- Full-stack development
- Cloud engineering
- Security/privacy engineering
- MLOps
- Modular AI systems
- Healthcare software design

This is stronger than only saying that the project trains a Gleason grading model.

---

## 26. Resume Bullet Ideas

Current version:

```text
- Designing and developing a secure cloud-based medical image analysis dashboard for pathology workflows, enabling authenticated users to upload images, select algorithms, run inference, and view protected results.

- Building a modular algorithm integration framework using FastAPI, Docker, PostgreSQL, and cloud object storage to support extensible pathology image analysis pipelines.

- Implementing privacy-aware architecture for medical image data, including user-level access control, encrypted storage, audit logging, secure upload workflows, and HIPAA/PIPEDA/PHIPA-aligned design considerations.

- Developing a full-stack healthcare AI platform with React, FastAPI, PostgreSQL, and cloud deployment for physician-facing pathology image analysis.
```

Once deployed:

```text
- Deployed a secure full-stack medical AI dashboard on AWS/Azure Canada with encrypted image storage, role-based access control, and containerized algorithm execution.
```

---

## 27. Internship / Job Angles

This MRP can support applications for several categories of roles.

### Healthcare AI Roles

- Medical AI Intern
- Healthcare ML Intern
- Clinical AI Research Assistant
- Computational Pathology Intern
- Medical Imaging Software Intern

### MLOps / Platform Roles

- ML Platform Intern
- MLOps Intern
- AI Infrastructure Intern
- Applied ML Engineer Intern

### Full-Stack Healthcare Roles

- Full-Stack Developer Intern — Healthcare
- HealthTech Software Engineer Intern
- Cloud Software Developer — Medical AI

### Security / Privacy Adjacent Roles

- Healthcare Data Platform Intern
- Privacy Engineering Intern
- Secure AI Systems Intern

---

## 28. Strong Project Pitch

Short pitch:

> I am building a secure cloud-based pathology image analysis dashboard for a hospital-linked research project. The system supports authenticated physician users, protected image uploads, modular AI algorithm execution, and privacy-aware result access.

Technical pitch:

> My MRP focuses on designing and developing a secure, extensible web platform for pathology image analysis. The platform allows approved users to upload pathology images, select from multiple algorithms, run AI inference, and view results while enforcing user-level data isolation, encrypted storage, audit logging, and HIPAA/PIPEDA/PHIPA-aligned design considerations.

---

## 29. Honest Scope Recommendation

This is a strong MRP, but the danger is scope creep.

The full vision includes:

- Dashboard
- Cloud deployment
- Security
- Multiple algorithms
- User roles
- Compliance
- Pathology image handling
- AI inference
- Future extensibility

That can become too large.

The recommended MRP scope is:

> Build a secure prototype platform with one working algorithm and a clean architecture that allows future algorithms to be added.

The MRP should not promise a complete production-grade hospital system.

---

## 30. Final Strategic Framing

The MRP is now best described as:

> A secure medical AI platform project, not just a model-training project.

The strongest contribution is likely:

- Secure dashboard design
- Modular algorithm integration
- Protected image upload and result access
- Cloud-ready architecture
- Privacy-aware medical AI workflow

Final positioning:

> Design and implementation of a secure, extensible, cloud-based pathology image analysis dashboard that allows authenticated users to upload medical images, select algorithms, run controlled AI inference, and view protected results with strict user-level data isolation.
