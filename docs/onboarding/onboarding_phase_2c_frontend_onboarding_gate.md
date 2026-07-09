# Onboarding Plan — Future Phase 2C: Frontend Onboarding Gate and Profile Readiness

## Goal

Plan the frontend onboarding experience and route-gating logic so users complete professional context onboarding before entering the dashboard.

This prepares the app for a future Profile page that displays the collected information.

This is a future extension plan only. It does not change the current immediate focus on professor demo prep, screenshots, README/demo materials, and professor communication.

## Proposed Future Frontend Flow

```text
User logs in
↓
AuthContext fetches user/profile
↓
If onboarding_completed is false → redirect to /onboarding
↓
User completes onboarding
↓
Redirect to /dashboard
```

## New Route

Add:

```text
/onboarding
```

This route should be protected, meaning only logged-in users can access it.

## Route Behavior

| User State | Behavior |
|---|---|
| Not logged in | Redirect to `/login` |
| Logged in, onboarding incomplete | Redirect to `/onboarding` |
| Logged in, onboarding complete | Allow `/dashboard`, `/upload`, `/jobs`, `/jobs/:id`, `/profile` later |
| Logged in, onboarding complete, visits `/onboarding` | Optionally redirect to `/dashboard` |

## OnboardingPage UI

The onboarding page should match the existing polished design system.

Suggested sections:

1. Header
   - “Professional Context”
   - “Help us understand your role for this research prototype.”

2. Role/User Type
   - Required dropdown

3. Organization Details
   - Organization name
   - Organization ID
   - Employee / Staff ID
   - Department

4. Intended Use
   - Optional textarea or select

5. Prototype Notice
   - “Prototype only — not for clinical use.”
   - “This information is collected for accountability and future access-control planning. It does not verify credentials.”

6. Submit Button
   - “Continue to Dashboard”

## Field Requirements

Required:

```text
Role / User Type
```

Optional:

```text
Organization Name
Organization ID
Employee / Staff ID
Department
Intended Use
```

## Frontend Data Source

Use one authoritative onboarding/profile endpoint:

```text
/auth/me      ← lightweight authenticated identity
/profile/me   ← authoritative onboarding/profile data
```

Route gating should fetch `/profile/me` after authentication to determine whether onboarding is complete.

AuthContext or a profile API helper may store profile/onboarding status, but it should not duplicate conflicting onboarding state from `/auth/me`.

The eventual implementation must avoid redirect loops and partial state bugs during:

- login
- refresh
- logout
- expired-session / 401 recovery

## AuthContext / Route Guard Changes

AuthContext could include or expose:

```text
user
profile
isAuthenticated
isLoading
onboardingCompleted
refreshProfile()
```

Protected routing should handle two concerns:

1. Authentication
2. Onboarding completion

Possible structure:

```text
ProtectedRoute
OnboardingGuard
```

Keep the implementation simple and consistent with the backend/frontend contract above.

## Existing Behavior Must Remain Working

Do not break:

- Login
- Registration
- Registration success banner
- Logout
- 401 auto-logout behavior
- Protected routes
- Dashboard
- Upload image
- Job submission
- Job result page
- Jobs page

## Profile Page Preparation

After this phase, ProfilePage can be implemented using the saved onboarding data.

Profile should later display:

```text
Full name
Email
Role
Organization name
Organization ID
Employee / Staff ID
Department
Intended use
Account created
Prototype status
```

Do not build the full profile page in this phase unless explicitly requested.

## Out of Scope

Do not add:

- Profile page editing
- Avatar upload
- Notifications/settings
- Admin approval
- Role-based permissions
- Credential verification
- License number verification
- Organization verification
- Cloud or deployment work

## Boundary

This onboarding planning does not mean:

- verified medical credentials
- clinical access approval
- organization verification
- admin roles
- RBAC
- production compliance

## Manual Verification Checklist

- New user registers.
- New user logs in.
- User is redirected to `/onboarding`.
- User cannot access `/dashboard` before completing onboarding.
- Role is required.
- Optional fields can be blank.
- User submits onboarding and lands on `/dashboard`.
- Refresh keeps user on dashboard after onboarding is complete.
- Logout works.
- Login again skips onboarding after completion.
- Existing user with incomplete onboarding is redirected to onboarding.
- Upload flow still works after onboarding.
- Job result flow still works after onboarding.
- Jobs page still works after onboarding.
- 401 auto-logout still works.
- No misleading verification or clinical-access wording appears.
