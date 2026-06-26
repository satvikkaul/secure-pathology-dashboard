---
name: session-handoff
description: Update project memory files before ending a Claude session
---

Before ending the session, update:
- docs/SESSION_LOG.md
- docs/NEXT_STEPS.md

Include:
1. What was completed.
2. What was verified.
3. Files changed.
4. Current unresolved issues.
5. Exact next task.
6. Things explicitly out of scope.

Rules:
- Keep it concise.
- Do not change source code.
- Do not create frontend unless explicitly instructed.
- Do not commit or push unless explicitly instructed.