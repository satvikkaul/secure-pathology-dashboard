# Onboarding Plan — Future Phase 2B: Backend Profile Storage and API

## Goal

Plan how onboarding information would be stored cleanly in the backend and exposed through simple authenticated API endpoints for reading and updating the current user’s professional context.

This is future planning only. It is not an immediate implementation task during the current professor demo-prep phase.

## Recommended Backend Approach

For a future implementation, use the simplest reliable option that fits the repo state at that time.

### Option A — Add Fields to User Table

This is the simplest path if the team chooses a lightweight extension first.

Add fields such as:

```text
role
organization_name
organization_id
employee_id
department
intended_use
onboarding_completed
```

Pros:

- Simple
- Fast to implement
- Easier for an early Phase 2 extension
- Minimal API complexity

Cons:

- User table becomes broader
- Less flexible if profile data grows later

### Option B — Create Separate UserProfile Table

Better long-term design.

Example:

```text
User
UserProfile
```

Pros:

- Cleaner separation
- Better for future profile expansion
- More scalable if onboarding grows

Cons:

- More implementation work
- More relationships/schemas to manage

## Recommendation

Use **Option A** for the first onboarding/profile implementation unless the backend is already being refactored.

The purpose later would be to support onboarding and profile display, not build a full user-management system.

## Backend/Frontend Contract

Use one authoritative source per concern:

- `/auth/me` remains the lightweight authenticated user identity endpoint.
- `/profile/me` is the authoritative source for onboarding/profile data.
- The frontend should fetch `/profile/me` after authentication when deciding whether onboarding is complete.
- AuthContext may store profile/onboarding status for convenience, but should not duplicate conflicting onboarding state from `/auth/me`.
- The eventual implementation must avoid redirect loops and partial state bugs caused by loading identity and onboarding state from different places.

## API Design

Preferred endpoints:

```text
GET /profile/me
PUT /profile/me
```

### GET /profile/me

Returns the authenticated user’s profile/onboarding information.

Expected fields:

```json
{
  "full_name": "Satvik Kaul",
  "email": "satvik@example.com",
  "role": "Researcher",
  "organization_name": "University Research Lab",
  "organization_id": null,
  "employee_id": null,
  "department": "Pathology Research",
  "intended_use": "Prototype testing",
  "onboarding_completed": true,
  "created_at": "..."
}
```

### PUT /profile/me

Updates onboarding/profile fields for the current authenticated user.

Minimum requirement:

- `role` should be required for completion.
- Optional fields may be blank/null.
- Once role is saved, `onboarding_completed` can be set to true.

## Data Rules

| Field | Required? | Validation |
|---|---:|---|
| role | Yes | Must be one of allowed values |
| organization_name | No | Optional string |
| organization_id | No | Optional string |
| employee_id | No | Optional string |
| department | No | Optional string |
| intended_use | No | Optional string |
| onboarding_completed | System-controlled | True after required onboarding is complete |

## Security / Privacy Notes

- These fields are professional context only.
- Do not collect sensitive credential documents in this onboarding scope.
- Do not claim identity has been verified.
- Continue enforcing user-specific data isolation.
- Do not expose another user’s profile.
- Do not commit `.env`, database files, or uploaded files.

## Backend Files Likely Affected

Likely files:

```text
backend/app/models.py
backend/app/schemas.py
backend/app/main.py
backend/app/routers/profile.py
backend/app/dependencies.py
```

Potentially affected:

```text
backend/app/routers/auth.py
```

Do not turn `/auth/me` into a second authoritative onboarding-status endpoint. Keep it lightweight and identity-focused.

## Migration Note

Because this project uses SQLite locally and does not yet have migrations, changing the User schema may require resetting the local development database:

```bash
rm backend/pathology.db
```

Warning: Do not delete the local database during demo prep unless you intentionally want to reset all demo users, uploads, jobs, and verification data.

Safer alternatives:

- back up the database first
- use a fresh local branch/environment
- seed new demo data after schema changes

This is not an immediate action. Treat it as a future implementation consideration only.

## Out of Scope

Do not add:

- Admin review
- Credential verification
- Organization verification
- License number verification
- File/document upload
- RBAC permissions
- Audit log dashboard
- Cloud database migration

## Boundary

This planning does not imply:

- verified medical credentials
- clinical access approval
- organization verification
- admin roles
- RBAC
- production compliance

## Manual Verification Checklist

- Backend starts with updated schema.
- New user can register.
- New user has `onboarding_completed = false`.
- `GET /profile/me` requires authentication.
- `GET /profile/me` returns only current user profile.
- `PUT /profile/me` saves role and optional fields.
- `onboarding_completed` becomes true after valid onboarding submission.
- Invalid role is rejected.
- Another user cannot access or update this user’s profile.
- Existing auth, upload, algorithm, and job endpoints still work.
