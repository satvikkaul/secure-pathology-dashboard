---
name: backend-verify
description: Verify the Phase 1 FastAPI backend workflow before frontend work
---

Verify the backend only. Do not create frontend code.

Read:
- CLAUDE.md
- docs/SESSION_LOG.md
- docs/NEXT_STEPS.md

Verify in this order:
1. Backend starts successfully.
2. POST /auth/register returns 201.
3. POST /auth/login returns 200 with access_token.
4. GET /auth/me returns 200 with Bearer token.
5. GET /algorithms/ works with Bearer token.
6. POST /images/ accepts valid JPG/PNG under 10 MB.
7. POST /images/ rejects invalid file types.
8. POST /jobs/ runs placeholder_v1 on the uploaded image.
9. GET /jobs/ and GET /jobs/{job_id} return only the current user's jobs.
10. Create a second user and confirm User B cannot see User A's images/jobs.

Rules:
- Do not create frontend.
- Do not add cloud, Docker, Celery, Redis, admin roles, WSI, or real AI.
- If a bug is found, fix only that bug.
- After verification, update docs/SESSION_LOG.md and docs/NEXT_STEPS.md.