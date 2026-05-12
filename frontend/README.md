# Budgeter – Frontend

Vite + React + TypeScript + Tailwind CSS frontend with **Auth0 React SDK** configured.

## Tech stack

| Layer | Library |
|-------|---------|
| Build tool | [Vite](https://vitejs.dev/) |
| UI library | [React 18](https://react.dev/) |
| Language | TypeScript |
| Styling | [Tailwind CSS v3](https://tailwindcss.com/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| Auth | [Auth0 React SDK](https://github.com/auth0/auth0-react) |

## Getting started

### 1. Prerequisites

- Node.js 18+
- An Auth0 tenant with a **Single-Page Application** registered

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your Auth0 domain, client ID, and API audience
```

### 4. Start the dev server

```bash
npm run dev
```

Open <http://localhost:5173> in your browser.

> The Vite dev server proxies `/api/*` to `http://localhost:8000` so you can
> run the FastAPI backend side-by-side without CORS issues during development.

## Project layout

```
frontend/
├── index.html
├── package.json
├── vite.config.ts        # Vite config + /api proxy
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.tsx           # Entry point – Auth0Provider + BrowserRouter
    ├── App.tsx            # Route definitions
    ├── index.css          # Tailwind base/components/utilities
    ├── auth/
    │   └── auth0-config.ts  # Auth0 config (reads VITE_ env vars)
    ├── components/
    │   ├── NavBar.tsx       # Top nav with login/logout + user avatar
    │   └── PrivateRoute.tsx # Guard that redirects unauthenticated users
    └── pages/
        ├── Home.tsx         # Landing / hero page
        └── Dashboard.tsx    # Protected dashboard (calls /api/users/me)
```

## Authentication flow

1. `Auth0Provider` (in `main.tsx`) wraps the entire app with Auth0 context.
2. `NavBar` exposes login / logout buttons via `useAuth0()`.
3. `PrivateRoute` checks `isAuthenticated` and calls `loginWithRedirect()` if not.
4. `Dashboard` calls `getAccessTokenSilently()` and sends the token as a
   `Bearer` header to the backend API.
