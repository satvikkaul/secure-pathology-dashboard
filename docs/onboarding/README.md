# Onboarding Planning Reference — Future Phase 2 Expansion

This folder is a planning reference for a future onboarding/profile expansion.

It does not override the current project memory or current repo priorities in:

- `docs/AI_CONTEXT.md`
- `docs/NEXT_STEPS.md`
- the current Phase 1 scope and professor demo-prep focus

Current immediate focus remains:

- professor demo preparation
- README/demo materials
- demo walkthrough script
- screenshots
- professor update email

## Files

1. `onboarding_phase_2a_lightweight_onboarding_flow.md`
   - Future Phase 2A planning for the onboarding concept, fields, UX, and wording boundaries.

2. `onboarding_phase_2b_backend_profile_storage_api.md`
   - Future Phase 2B planning for backend data storage, profile API endpoints, and verification strategy.

3. `onboarding_phase_2c_frontend_onboarding_gate.md`
   - Future Phase 2C planning for frontend route gating, OnboardingPage behavior, and frontend verification.

## Recommended Order

```text
Professor demo prep → professor feedback → onboarding planning review → implementation
```

Do not treat these docs as an instruction to start implementation immediately. Onboarding and profile work remain future extensions to review after the current professor demo cycle.

## Planning Contract

When onboarding is implemented later, use this contract:

- `/auth/me` remains the lightweight authenticated identity endpoint.
- `/profile/me` is the authoritative source for onboarding/profile data.
- Frontend route gating should fetch `/profile/me` after authentication.
- AuthContext may cache profile/onboarding status, but should not duplicate conflicting onboarding state from `/auth/me`.
- The eventual implementation must avoid redirect loops and partial state bugs during login, refresh, logout, and expired-session handling.

## Boundary

Onboarding planning does not mean:

- verified medical credentials
- clinical access approval
- organization verification
- admin roles
- RBAC
- production compliance

These remain future discussion items and are not part of the current Phase 1 demo-prep scope.
