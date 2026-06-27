# Frontend Plan — Phase 1 Scaffold

## New Dependency

One new package beyond the Vite scaffold:

| Package | Purpose |
|---|---|
| `react-router-dom` v6 | Client-side routing |

No axios (native `fetch` is sufficient). No UI component library. No Redux. Styling: plain CSS files co-located with pages.

---

## Folder Structure

```
frontend/
├── index.html
├── vite.config.js          ← proxy: /api/* → http://localhost:8000/*
├── package.json
├── mockups/                ← static HTML reference mockups (not shipped)
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── sidebar.html
│   ├── upload_img.html
│   └── job_result.html
└── src/
    ├── main.jsx            ← ReactDOM.createRoot + BrowserRouter
    ├── App.jsx             ← all route definitions
    ├── index.css           ← global tokens: slate/blue palette, typography resets
    │
    ├── api/
    │   ├── client.js       ← fetch wrapper: injects Bearer token, surfaces errors
    │   ├── auth.js         ← register(), login(), getMe()
    │   ├── images.js       ← uploadImage(), listImages(), getImage(id)
    │   ├── algorithms.js   ← listAlgorithms()
    │   └── jobs.js         ← submitJob(), listJobs(), getJob()
    │
    ├── context/
    │   └── AuthContext.jsx ← user + token state, login(), logout()
    │
    ├── components/
    │   └── ProtectedRoute.jsx  ← redirects to /login if no token in localStorage
    │
    └── pages/
        ├── auth.css            ← shared card/input/button styles (Login + Register)
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.css   ← dashboard + sidebar/topbar + shared header classes
        ├── DashboardPage.jsx   ← sidebar layout (dash-app shell)
        ├── UploadPage.css      ← upload page layout, drop zone, step indicators
        ├── UploadPage.jsx
        ├── JobResultPage.css   ← report layout, metrics, aside cards
        └── JobResultPage.jsx
```

---

## Route Map

| Path | Component | Auth required |
|---|---|---|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/dashboard` | DashboardPage | Yes |
| `/upload` | UploadPage | Yes |
| `/jobs/:id` | JobResultPage | Yes |
| `/` | Redirect → `/dashboard` | — |

---

## API Layer Design

`src/api/client.js` is the single place that reads the token from `localStorage` and adds the `Authorization: Bearer` header. All other API files import it. A `401` response triggers `logout()` and redirects to `/login` — only one place to maintain this logic.

The Vite proxy (`/api → localhost:8000`) means all frontend fetch calls use relative paths like `/api/auth/register`, avoiding CORS entirely in dev.

---

## Implementation Order

All steps complete and Playwright-verified (41/41 checks, 2026-06-27).

| Step | What gets built | Status |
|---|---|---|
| 1 | Vite scaffold + proxy config + `client.js` | ✓ Done + verified |
| 2 | `AuthContext` + `ProtectedRoute` + `App.jsx` routes | ✓ Done + verified |
| 3 | `LoginPage` + `auth.js` | ✓ Done + styled + verified |
| 4 | `RegisterPage` | ✓ Done + styled + verified |
| 5 | `DashboardPage` + `listImages()` + `listJobs()` | ✓ Done + sidebar navigation + verified |
| 6 | `UploadPage` + `uploadImage()` + `listAlgorithms()` + `submitJob()` | ✓ Done + drag-and-drop UI + step indicators + verified |
| 7 | `JobResultPage` + `getJob()` + `getImage()` | ✓ Done + two-column report layout + verified |

**Beyond original plan (added and verified):**
- Collapsible sidebar on DashboardPage (256px expanded / 72px collapsed on desktop; mobile drawer)
- Profile chip (initials + name) in dashboard topbar
- Drag-and-drop file zone on UploadPage with step indicator progression
- `getImage(id)` added to images.js for image summary in JobResultPage aside
- 5 color tokens added to index.css (`--c-secondary`, `--c-success`, `--c-success-bg`, `--c-warning`, `--c-warning-bg`)

---

## Open Question (resolved)

Backend port is configurable via `VITE_BACKEND_URL` in `frontend/.env`. Defaults to `http://localhost:8000` in `vite.config.js`. Documented in `frontend/.env.example`.
