# ShortScale

URL shortener with a **real API**: PostgreSQL for users and links, Redis for the atomic counter and redirect cache, httpOnly JWT cookies for auth, and **HTTP 302** redirects that work for anyone who opens the short link.

The React UI is still a system-design lab (architecture traces, Base62 explorer, capacity notes). Writes, logins, and redirects now go through the backend, not `localStorage`.

## Local setup

**Requirements:** Node.js 18+, Docker

```bash
cp .env.example .env
npm install
npm run docker:up
npm run dev
```

This starts Postgres, Redis, the API on `http://localhost:4000`, and the UI on `http://localhost:3000`.

Open `http://localhost:3000`. Sign in with a one-click demo account, create a link, then open `http://localhost:3000/{shortCode}` (or `http://localhost:4000/{shortCode}`) in another browser. That is a real 302.

### Demo accounts

| Username | Role | Password |
| --- | --- | --- |
| `alice_dev` | User | `password123` |
| `bob_user` | User | `password123` |
| `system-admin` | Admin | `adminpassword` |

Passwords are bcrypt-hashed in Postgres. Prefer the one-click demo buttons. New registrations are always standard users.

## What is now real

- Shared Postgres database (users, URLs, click events)
- Redis `INCR` for IDs and `SETEX` for redirect cache
- JWT session cookie (survives a new device after you sign in; survives clearing the UI cache)
- Public 302 redirects and 410 for expired links

## Deploy

### 1. Hosted database and Redis

Create:

- Postgres: [Neon](https://neon.tech) or Vercel Postgres
- Redis: [Upstash](https://upstash.com)

### 2. Vercel project

Import the repo (Vite + serverless `api/`). Set:

```
DATABASE_URL
REDIS_URL
JWT_SECRET
APP_URL=https://your-app.vercel.app
PUBLIC_SHORT_ORIGIN=https://your-app.vercel.app
DATABASE_SSL=true
DEMO_LOGIN_ENABLED=true
```

Do **not** set `VITE_API_URL` if the UI and API share the same Vercel domain.

`vercel.json` sends `/api/*` to the Express function and `/{code}` to the redirect function.

After the first request, run seed once if demo users are missing: `npm run db:seed` against the production `DATABASE_URL`, or sign in by registering.

### Custom short domain

Point a domain (for example `go.yourdomain.com`) at the same Vercel project and set `PUBLIC_SHORT_ORIGIN` / `APP_URL` to that origin. Copied links will use it.

## Scripts

```bash
npm run docker:up      # Postgres + Redis
npm run dev            # API + Vite together
npm test
npm run build
npm run db:migrate
npm run db:seed
```

## Layout

```
server/     Express API, SQL, Redis, auth
api/        Vercel function entrypoints
src/        React lab UI (talks to /api)
```
