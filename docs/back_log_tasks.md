# Backlog Tasks

Code review findings and proposed implementation paths for the Secure Pathology Dashboard project.

This backlog intentionally excludes the temporary context-window guard item per request.

## Summary

The latest whole-codebase review produced five follow-up tasks. The two medium-priority items should be handled first because they can affect local demo correctness and user routing. The remaining low-priority items are still useful before professor review because they reduce friction, polish the locked-profile flow, and keep project memory reliable.

- Total backlog items: 5
- Medium priority: 2
- Low priority: 3

## Backlog Items

### 1. Anchor the local SQLite database path

**Priority:** Medium

**Finding:** The backend upload directory is anchored to the `backend/` folder, but the default SQLite database URL is still cwd-relative. Launching `uvicorn` from the repository root or another working directory can create or use a different `pathology.db` file.

**Impact:** Demo data can appear to disappear, schema checks can validate the wrong database, and developers may debug against different local databases depending on how they start the backend.

**Possible solution:** Resolve relative SQLite `DATABASE_URL` values against the backend directory, similar to the upload directory logic. Keep absolute `DATABASE_URL` values unchanged for future PostgreSQL or explicit local paths.

**Acceptance check:** Starting the backend from both the repository root and `backend/` uses the same `backend/pathology.db` file unless `DATABASE_URL` is explicitly absolute or points to a non-SQLite database.

**Likely files:** `backend/app/database.py`, `backend/.env.example`, README or `docs/NEXT_STEPS.md` startup notes if wording changes.

### 2. Handle profile load failure on the onboarding route

**Priority:** Medium

**Finding:** `AuthContext` records `profileError` when `GET /profile/me` fails, and `OnboardingGuard` shows a retry state, but the `/onboarding` route bypasses `OnboardingGuard`. Direct navigation to `/onboarding` during a transient profile failure can render an empty form path instead of a retry state.

**Impact:** A user may be sent through onboarding with stale or missing profile state, especially after an API failure. This can create confusing behavior and risks overwriting profile fields once the backend recovers.

**Possible solution:** Teach `OnboardingPage` to read `profileError` from `AuthContext` and show the same retry affordance as `OnboardingGuard` before rendering the form. Alternatively, wrap `/onboarding` in a lightweight guard that handles `profileError` while still allowing incomplete users through.

**Acceptance check:** When `GET /profile/me` fails, `/onboarding` shows a clear retry/error state and does not allow submit. When profile loading succeeds for a non-onboarded user, the onboarding form still works normally.

**Likely files:** `frontend/src/pages/OnboardingPage.jsx`, `frontend/src/components/OnboardingGuard.jsx` if shared retry UI is extracted.

### 3. Replace the locked-profile placeholder contact email

**Priority:** Low

**Finding:** The locked profile state still links to `admin@secure-pathology-dashboard.local` as the administrator contact address.

**Impact:** The profile locking flow can look unfinished during professor review, and users have no real out-of-band path to request corrections after locking organisation context.

**Possible solution:** Introduce a project contact value, preferably through a frontend environment variable such as `VITE_PROFILE_CONTACT_EMAIL` with a safe fallback for local development, then render the `mailto:` link from that value.

**Acceptance check:** Locked profile state shows a real prototype-owner contact address in demo configuration, and the fallback remains clearly marked as local-only if no address is configured.

**Likely files:** `frontend/src/pages/ProfilePage.jsx`, `frontend/.env.example`, `docs/NEXT_STEPS.md` once resolved.

### 4. Normalize email casing for registration and login

**Priority:** Low

**Finding:** Registration and login compare submitted email values directly. Depending on casing, `User@x.com` and `user@x.com` can behave like separate accounts or fail login unexpectedly.

**Impact:** Users can accidentally create duplicate accounts or be unable to log in with the same email typed in a different case, which is frustrating during demos and weakens account consistency.

**Possible solution:** Normalize email addresses to lowercase at the API boundary before uniqueness checks, storage, token subject creation, and login lookup. For existing local prototype data, document that a DB reset may be easiest if duplicates exist.

**Acceptance check:** Registering `User@Example.com` stores `user@example.com`. A later login using `USER@example.com` succeeds against the same account. Duplicate registration with different casing is rejected.

**Likely files:** `backend/app/routers/auth.py`, possibly `backend/app/schemas.py` if normalization is centralized with a Pydantic validator.

### 5. Refresh project memory docs after latest review-fix commit

**Priority:** Low

**Finding:** Some project memory files still describe the latest feature commit as `5ccc6be` and mark profile endpoint verification as incomplete, while the current branch is at `0d80816` with a recorded July 5 fix pass.

**Impact:** A new session may start from stale instructions, repeat completed work, or misjudge which verification gaps remain.

**Possible solution:** Update `docs/NEXT_STEPS.md` and any stale session-summary sections to reflect `HEAD` at `0d80816`, the completed WS1-WS4 fixes, and the remaining true gaps: onboarding/profile Playwright coverage, Session 3 browser verification, and contact email replacement.

**Acceptance check:** A fresh session reading `docs/SESSION_LOG.md` and `docs/NEXT_STEPS.md` sees a consistent current commit, completed work, verification status, unresolved issues, and exact next task.

**Likely files:** `docs/NEXT_STEPS.md`, `docs/SESSION_LOG.md` if phase/current-focus wording is updated.

## Suggested Next Order

1. Anchor the SQLite database path.
2. Handle `profileError` on `/onboarding`.
3. Replace the locked-profile contact email.
4. Normalize email casing for registration and login.
5. Refresh project memory docs.

## Verification Notes

For backend changes, run the existing backend self-check and targeted curl checks that exercise registration, login, profile loading, and startup from multiple working directories.

For frontend changes, run `npm run build` and browser-verify the affected route states.

Add Playwright coverage for onboarding/profile flows when the test harness is available.
