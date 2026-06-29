# Onboarding Plan — Future Phase 2A: Lightweight Onboarding Flow

## Goal

Plan a lightweight onboarding step after registration/login to collect professional context from users before they access the main dashboard.

This is **not credential verification**. The purpose is to collect basic professional/accountability information for a medical/research-oriented prototype.

This document is for Phase 2 planning only. It does not change the current repo priority: Phase 1 is complete, and the immediate focus remains professor demo prep, screenshots, demo materials, and professor communication.

## Why This Phase Matters

The professor’s use case involves physicians or approved medical/research users interacting with pathology images. Email and password alone are not enough context for this type of system.

This phase helps answer:

- Who is using the system?
- What role do they have?
- Are they associated with an organization, hospital, lab, or company?
- What is their intended use?

## Proposed Future Flow

```text
Register → Login → Onboarding → Dashboard
```

A new user would be redirected to onboarding after first login if onboarding is incomplete.

Existing users without onboarding data would also be redirected to onboarding after login.

## Onboarding Fields

| Field | Future Status | Notes |
|---|---:|---|
| Role / User Type | Required | Needed to identify user context |
| Organization Name | Optional | Hospital, lab, company, university, or independent |
| Organization ID | Optional | For future institutional tracking |
| Employee / Staff ID | Optional | For future accountability |
| Department | Optional | Example: Pathology, Research, Diagnostics |
| Intended Use | Optional | Example: research, prototype testing, education |

## Suggested Role Options

Use broad, non-permission-based labels:

```text
Physician
Pathologist
Researcher
Lab Staff
Student / Trainee
Other
```

Important: In a future implementation, these roles should be treated as **profile metadata only**, not permissions.

## Wording Guidance

Use:

```text
Professional Context
Prototype Onboarding
Accountability Information
Future Access-Control Planning
```

Avoid:

```text
Verified Physician
Credential Approved
Licensed User
Clinical Access Granted
```

## UX Requirements

The onboarding page should:

- Be simple and short.
- Clearly state this is a research prototype.
- Explain why professional context is being collected.
- Allow optional fields to remain blank.
- Require only the role/user type.
- Redirect to dashboard after completion.
- Preserve logout behavior.
- Preserve protected route behavior.

## Boundary

Onboarding planning does not mean:

- verified medical credentials
- clinical access approval
- organization verification
- admin roles
- RBAC
- production compliance

These remain future discussion items and should not be implied by the onboarding UI or wording.

## Out of Scope

Do not add:

- License verification
- Organization verification
- Admin approval
- Role-based permissions
- Credential document upload
- MFA/SSO
- Real clinical access claims

## Manual Verification Checklist

- New user registers successfully.
- New user logs in successfully.
- New user is redirected to onboarding before dashboard.
- Role/user type is required.
- Optional fields can be blank.
- User can complete onboarding with only required role.
- After onboarding, user lands on dashboard.
- Refresh after onboarding does not show onboarding again.
- Logout still works.
- Protected routes still work.
- No clinical/credential verification claims appear.
