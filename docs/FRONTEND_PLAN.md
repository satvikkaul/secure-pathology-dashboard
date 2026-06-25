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
└── src/
    ├── main.jsx            ← ReactDOM.createRoot + BrowserRouter
    ├── App.jsx             ← all route definitions
    │
    ├── api/
    │   ├── client.js       ← fetch wrapper: injects Bearer token, surfaces errors
    │   ├── auth.js         ← register(), login(), getMe()
    │   ├── images.js       ← uploadImage(), listImages(), getImage()
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
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.jsx
        ├── UploadPage.jsx
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

Each step is independently runnable and verifiable before the next begins.

| Step | What gets built | Verify by |
|---|---|---|
| 1 | Vite scaffold + proxy config + `client.js` | `npm run dev` loads blank page, no console errors |
| 2 | `AuthContext` + `ProtectedRoute` + `App.jsx` routes | Navigate to `/dashboard` redirects to `/login` |
| 3 | `LoginPage` + `auth.js` | Can log in with a known account; token lands in localStorage |
| 4 | `RegisterPage` | Can register a new account; redirected to `/login` |
| 5 | `DashboardPage` + `listImages()` + `listJobs()` | Shows welcome with `full_name`; lists empty state cleanly |
| 6 | `UploadPage` + `uploadImage()` + `listAlgorithms()` + `submitJob()` | Can pick a file, select `placeholder_v1`, submit; redirects to result |
| 7 | `JobResultPage` + `getJob()` | Displays `result_summary` fields: prediction, confidence, findings, disclaimer |

---

## Open Question

The Vite proxy rewrites `/api/auth/register` → `http://localhost:8000/auth/register`. The backend URL and port are set once in `vite.config.js`.

**Does the backend always run on port 8000, or should the port be configurable via a `.env` file** (e.g. `VITE_API_PORT=8000`)?

This must be decided before `vite.config.js` is written.
