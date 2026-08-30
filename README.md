# 🚀 ORIGIN '26 — Full-Stack Hackathon Platform

A two-repo, full-stack system that runs the **Origin Hackathon** (Data Science Club,
VIT Bhopal): a **Next.js 16** marketing site + team/admin/jury dashboard, talking to a
standalone **Express + TypeScript API** backed by **NeonDB (Postgres)**, **Upstash
Redis**, and **ImageKit**.

This README documents the *whole system* — both repos, how they're wired together,
every major data flow, and how to run/extend it.

```
origin-hackathon/
├── backend/     ← Express + TypeScript API (Node server or Vercel Function)
└── frontend/    ← Next.js 16 App Router site (marketing + team/admin/jury UI)
```

---

## Table of Contents

1. [System Architecture (Big Picture)](#system-architecture-big-picture)
2. [How Frontend ↔ Backend Are Wired](#how-frontend--backend-are-wired)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Authentication — Four Separate Systems](#authentication--four-separate-systems)
6. [End-to-End Data Flows](#end-to-end-data-flows)
7. [State Management on the Frontend](#state-management-on-the-frontend)
8. [File Upload Pipeline](#file-upload-pipeline)
9. [Database Schema](#database-schema)
10. [API Reference](#api-reference)
11. [Environment Variables](#environment-variables)
12. [Running Everything Locally](#running-everything-locally)
13. [Deployment](#deployment)
14. [Known Inconsistencies & Gotchas](#known-inconsistencies--gotchas)
15. [Design Decisions & Trade-offs](#design-decisions--trade-offs)

---

## System Architecture (Big Picture)

```
                              ┌────────────────────────────────────────┐
                              │              Browser (User)              │
                              └───────────────────┬──────────────────────┘
                                                  │  HTTPS
                                                  ▼
                    ┌──────────────────────────────────────────────────────┐
                    │        FRONTEND — Next.js 16 (App Router)             │
                    │  frontend/app/**                                     │
                    │  - Marketing pages (/, /schedule, /faq)               │
                    │  - Team pages (/register, /team, /submit)             │
                    │  - Admin dashboard (/admin) — Clerk + OTP gated       │
                    │  - Jury dashboard (/jury) — static passcode gated     │
                    │  - useTeams() hook polls backend every 5s             │
                    └───────────────────┬────────────────────────────────┘
                                        │  fetch('/api/...')
                                        │  (same-origin, browser-relative)
                                        ▼
                    ┌──────────────────────────────────────────────────────┐
                    │   next.config.ts  →  rewrites()                       │
                    │   /api/:path*  ⇒  proxied to BACKEND_URL/api/:path*   │
                    │   (dev: http://localhost:4000, prod: your backend URL)│
                    └───────────────────┬────────────────────────────────┘
                                        │  HTTP (server-to-server, invisible
                                        │  to the browser — no CORS needed)
                                        ▼
                    ┌──────────────────────────────────────────────────────┐
                    │        BACKEND — Express + TypeScript API             │
                    │  backend/src/**                                       │
                    │  routes → middleware → controllers → services         │
                    │  Mounted at /api (health, teams, admin, announcements, │
                    │  upload, export-csv, export-excel)                    │
                    └───────┬─────────────────┬─────────────────┬──────────┘
                            ▼                 ▼                 ▼
                 ┌─────────────────┐ ┌────────────────┐ ┌──────────────────┐
                 │  NeonDB (Postgres)│ │ Upstash Redis  │ │  ImageKit.io      │
                 │  source of truth  │ │ cache-aside     │ │  file storage     │
                 │  (teams, admins,  │ │ layer (optional)│ │  (payment proofs, │
                 │  announcements,   │ │                 │ │  PPT/PDF decks)   │
                 │  settings)        │ │                 │ │                   │
                 └─────────────────┘ └────────────────┘ └──────────────────┘
```

**Key idea:** the browser never talks to the backend directly. It only ever calls
relative paths like `/api/teams`, which Next.js's `rewrites()` config silently proxies
to the real Express server. This means **no CORS configuration is needed** anywhere in
this system — from the browser's point of view, frontend and backend are the same
origin.

---

## How Frontend ↔ Backend Are Wired

This is the single most important integration detail in the whole project.

**`frontend/next.config.ts`:**
```ts
rewrites: async () => [
  {
    source: "/api/:path*",
    destination:
      process.env.NODE_ENV === "production"
        ? "https://your-backend-url.com/api/:path*"   // set to your deployed backend
        : "http://localhost:4000/api/:path*",           // local backend dev server
  },
],
```

**`backend/src/app.ts`:**
```ts
app.use('/api', routes);   // all backend routes live under /api/*
```

So a browser call to `fetch('/api/teams')` on the frontend:
1. Hits the Next.js server (or Vercel edge) at `/api/teams`.
2. Next.js's rewrite silently forwards it to `http://localhost:4000/api/teams` (dev)
   or your production backend's `/api/teams` (prod) — same path, different host.
3. The Express app's `router.use('/api', routes)` → `teamRoutes` → `listTeams`
   controller handles it and returns JSON.
4. The response is streamed back through Next.js to the browser, looking exactly
   like it came from the frontend's own domain.

**Practical consequence:** you must update the hardcoded production URL in
`next.config.ts` (`https://your-backend-url.com`) to point at wherever the `backend/`
folder is actually deployed, or every API call in production will fail.

---

## Backend Architecture

Standard layered Express architecture.

```
Routes → Middleware (validate, auth) → Controllers → Services → Config (DB/Redis/ImageKit)
```

| Layer | Responsibility | Location |
|---|---|---|
| Routes | HTTP verb + path → middleware chain → controller | `src/routes/*` |
| Middleware | Cross-cutting: validation, admin auth, error handling | `src/middleware/*` |
| Controllers | Parse `req`, call services, shape `res` | `src/controllers/*` |
| Services | Business logic + Redis cache-aside orchestration | `src/services/*` |
| Config | Raw I/O: Postgres queries, Redis calls, ImageKit uploads | `src/config/*` |

**Resilience pattern:** every external dependency (NeonDB, Redis, ImageKit) has a
built-in fallback — in-memory arrays if Postgres is unreachable, no-op caching if
Redis isn't configured, Base64 Data-URI embedding if ImageKit isn't configured. The
backend is designed to **never hard-crash** due to a missing/misconfigured
integration; it just silently degrades.

**Two run modes** from the same codebase:
- `server.ts` — a standalone long-running Node process (`npm run dev` / `npm start`),
  used for local development and any traditional host. In dev mode it also boots a
  Vite dev-server in middleware mode alongside Express.
- `api/index.ts` — a thin wrapper (`export default app`) that lets the same Express
  app run as a Vercel Serverless Function if you deploy the backend to Vercel too.

**Cache-aside pattern (used everywhere a list is read/written):**
```
read:  check Redis → miss? read Postgres (or in-memory) → populate Redis → return
write: write Postgres (or in-memory) → invalidate the relevant Redis key
```

**Storage fallback chain (per operation):**
```
NeonDB configured & reachable? ──yes──▶ use it, mirror the query into Redis + local vars
        │ no / errors out
        ▼
fall back to in-memory JS arrays (localTeams, localAdmins, localAnnouncements)
```

---

## Frontend Architecture

Next.js 16, App Router, almost entirely client components (`"use client"` — this is a
highly interactive dashboard-style app, not a static content site).

```
frontend/
├── app/
│   ├── (routes)/                 ← route group, one page.tsx per route
│   │   ├── page.tsx               → "/"        (marketing home)
│   │   ├── register/page.tsx      → "/register" (team registration)
│   │   ├── team/page.tsx          → "/team"     (team workspace/pass)
│   │   ├── submit/page.tsx        → "/submit"   (project submission)
│   │   ├── admin/page.tsx         → "/admin"    (admin dashboard)
│   │   ├── jury/page.tsx          → "/jury"     (jury evaluation portal)
│   │   ├── schedule/page.tsx      → "/schedule"
│   │   └── faq/page.tsx           → "/faq"
│   ├── components/
│   │   ├── layout/                ← AppShell, Navbar, Footer, LoadingScreen,
│   │   │                            LiveAnnouncementsBanner, BackgroundVeins
│   │   ├── sections/              ← Hero, Sponsors, Prizes, Schedule/Rules, FAQ
│   │   ├── team/                  ← RegistrationForm, TeamPassTicket,
│   │   │                            TeamLoginModal, ProjectSubmissionModal
│   │   ├── admin/AdminPortal.tsx  ← the entire admin dashboard (huge single file)
│   │   └── jury/JuryPortal.tsx    ← the entire jury dashboard
│   ├── globals.css                ← Tailwind + custom design tokens + Clerk theming
│   └── layout.tsx                 ← Root layout: wraps app in <ClerkProvider>
├── data/mockData.ts               ← static content: tracks, rules, schedule, sponsors
├── hooks/useTeams.ts               ← the ONE hook that owns all server data
├── lib/
│   ├── clerk.ts                    ← @vitbhopal.ac.in email domain validator
│   ├── deadline.ts                 ← client-side mirror of backend deadline logic
│   ├── fileValidation.ts           ← client-side mirror of backend magic-byte checks
│   └── imagekitClient.ts           ← upload helper with client-side image compression
└── types/index.ts                  ← shared TypeScript types (mirrors backend types.ts)
```

### `AppShell` — the layout backbone

`app/layout.tsx` wraps everything in `<ClerkProvider>` (for the admin login flow),
and every page is rendered inside `<AppShell>` (`app/components/layout/AppShell.tsx`),
which:
- Mounts `useTeams()` **once** at the top of the tree and hands data down via props
  to `Navbar` and `LiveAnnouncementsBanner`.
- Runs a `Lenis` smooth-scroll instance for the whole app.
- Shows the `LoadingScreen` splash animation on first paint.
- Renders `BackgroundVeins`, an animated particle-canvas background.

Individual route pages (`app/(routes)/**/page.tsx`) call `useTeams()` **again**
themselves to get `teams`, `activeTeam`, `setActiveTeam`, `refreshData`, etc. — since
each call to the hook re-fetches independently, this means the app effectively runs
**two or more parallel polling loops** (one from `AppShell`, one from whatever page
is active). This is a real duplication (see
[Known Inconsistencies](#known-inconsistencies--gotchas)), not an intentional
architecture — but harmless functionally since all instances read the same backend.

---

## Authentication — Four Separate Systems

This system has **four independent, non-interoperating auth mechanisms**, one per
audience. There is no shared session or SSO between them.

| Audience | Mechanism | Where | Persistence |
|---|---|---|---|
| **Team members** | Team ID or leader email + 4-digit PIN (`accessCode`) | `TeamLoginModal` → `POST /api/teams/auth/team-login` | `localStorage: origin_active_team_id/_data` |
| **Admins (primary)** | Clerk (`@clerk/nextjs`) — full OAuth/email sign-in UI | `AdminPortal.tsx`, gated by `useUser()`/`useClerk()` | Clerk's own session cookie |
| **Admins (legacy/fallback)** | Custom 6-digit OTP flow talking to the backend | `AdminPortal.tsx` `handleVerifyOtp` → `/api/admin/auth/verify-otp` | `localStorage: origin_active_admin` |
| **Jury members** | Hardcoded static passcode `"JURY2026"` checked **entirely client-side** | `JuryPortal.tsx` `handleLogin` | `localStorage: origin_jury_auth` |

### Admin auth is unusually layered
`AdminPortal.tsx` actually wires up **both** Clerk and the backend's OTP system
simultaneously:
1. If the person is signed in via **Clerk** and their email matches an entry in the
   admin whitelist (fetched from `GET /api/admin/whitelist`, cached in
   `localStorage: origin_admin_whitelist`), they're treated as authenticated
   immediately — no OTP required.
2. If Clerk-signed-in but **not** whitelisted, the UI shows an "Access Denied" card
   and offers to sign out of Clerk.
3. The **OTP flow** (`emailInput` → `POST /admin/auth/request-otp` → 6-digit code →
   `POST /admin/auth/verify-otp`) exists as an alternative path in the same component,
   though the currently-shipped UI mostly surfaces the Clerk `<SignIn>` widget when
   no admin is active — the OTP form state (`authStep`, `otpInput`, etc.) is wired up
   in the component logic but not always rendered, suggesting an in-progress
   migration from OTP-based auth toward Clerk.
4. Every subsequent admin-only API call (toggle submissions, verify payment, delete
   team, etc.) sends the admin's email as a plain HTTP header:
   `x-admin-email: <email>`. The backend's `requireAdminAuth` middleware checks this
   header against the whitelist on **every request** — there is no signed token, so
   this is "trust the client to keep sending the right header," which is acceptable
   for an internal organizer tool but not hardened for public exposure.

### Jury auth is not real security
`JURY_PASSCODE = "JURY2026"` is a string literal baked into
`app/components/jury/JuryPortal.tsx` and compared entirely in the browser. Anyone who
reads the shipped JS bundle can read the passcode. This is a "soft gate," not an
access-control boundary — fine for keeping honest people on-track during an event,
not for anything sensitive.

---

## End-to-End Data Flows

### 1. Team registration
```
RegistrationForm.tsx (frontend)
  │ 1. Checks GET /api/admin/registrations-status on mount → shows/hides form
  │ 2. Validates every member email ends in @vitbhopal.ac.in (lib/clerk.ts)
  │ 3. Uploads payment screenshot via uploadDirectToImagekit()
  │     → compresses image client-side (canvas resize to ≤1600px, JPEG @0.82)
  │     → POST /api/upload (multipart) → falls back to base64 JSON → falls back
  │       to a pure client-side Data URL if the network call fails entirely
  │ 4. Computes total fee client-side (₹100/Hosteller, ₹219/Day Scholar) — for
  │    display only; the backend recomputes this independently and doesn't trust it
  │ 5. POST /api/teams/register  { teamName, leader, member2..5, transactionRef,
  │                                 paymentProofUrl, amountPaid }
  ▼
teamController.registerTeam() (backend)
  │ - Checks registration is open (teamService.getRegistrationStatus)
  │ - Idempotency: if leader email already has a team, returns the existing team
  │   instead of erroring (protects against double-submit)
  │ - Rejects duplicate transactionRef (UTR reuse)
  │ - Generates ORIGIN-XXXX id + 4-digit accessCode
  │ - Recomputes amountPaid server-side (never trusts the client's number blindly —
  │   only accepts it if it's a positive number, otherwise recalculates)
  │ - saveTeam() → Postgres upsert + Redis cache invalidation
  ▼
Response: { success: true, team }
  │
  ▼
RegistrationForm.tsx
  - Fires canvas-confetti
  - Calls onRegisteredSuccess(team) → parent page calls setActiveTeam(team) →
    useTeams() persists it to localStorage → router.push('/team')
```

### 2. Admin payment verification
```
AdminPortal "Teams" tab
  │ Admin clicks "Approve" on a pending team
  ▼
onUpdateTeamStatus(teamId, { paymentStatus: 'verified', ticketIssued: true })
  │ (this callback lives in app/(routes)/admin/page.tsx, wired as a prop)
  ▼
PATCH /api/teams/:id/status   headers: { x-admin-email }
  ▼
requireAdminAuth middleware → adminController.updateTeamStatus()
  - Mutates team.paymentStatus, team.ticketIssued
  - updateTeam() → Postgres UPDATE + Redis invalidate
  ▼
refreshData() re-fetches /api/teams, /api/announcements, /api/stats
  │
  ▼
Team's own polling (useTeams every 5s) picks up the change → TeamPassTicket.tsx
now shows "VERIFIED PASS ISSUED" and unlocks the QR pass + project submission tab
```

### 3. Project submission (with live deadline + admin kill-switch)
```
ProjectSubmissionModal.tsx
  │ Polls GET /api/admin/submissions-status every 10s (independent of the
  │ 5s team/announcement/stats poll in useTeams — a THIRD polling loop)
  │ Renders a live countdown timer computed from `deadline`
  │ Blocks submission client-side if: !team, team.paymentStatus !== 'verified',
  │ deadline passed, or admin has closed submissions
  │ Uploads PPT/PDF via POST /api/upload (10MB hard limit, enforced client- AND
  │ server-side)
  ▼
PUT /api/teams/:id/project
  ▼
teamController.submitProject()
  - Re-checks deadline server-side (utils/deadline.ts) — client-side blocking is UX
    only, the server is the actual authority
  - Re-checks isSubmissionsOpen server-side
  - Re-checks team.paymentStatus === 'verified' server-side
  - Writes team.project = {...}, preserves any existing score
  ▼
Response updates local team state → confetti → AdminPortal "Submissions" tab and
JuryPortal both see the new submission on their next poll
```

### 4. Jury evaluation
```
JuryPortal.tsx (client-side passcode gate, see Authentication section)
  │ Filters teams to those with `team.project` set
  │ Opens scoring modal → 5 rubric fields (0–20 each) + feedback textarea
  ▼
onScoreProject(teamId, scores)
  │ (wired in app/(routes)/jury/page.tsx — NOTE: currently a stub, see
  │  Known Inconsistencies)
  ▼
POST /api/admin/teams/:id/score   headers: { x-admin-email }
  ▼
adminController.scoreProject()
  - Sums the 5 fields into total (out of 100)
  - Writes team.project.score
  ▼
AdminPortal "Leaderboard" tab (sorted by score.total desc) reflects it on next poll
```

---

## State Management on the Frontend

There is **no global state library** (no Redux/Zustand/Context beyond Clerk's own).
All server state flows through one hook:

**`hooks/useTeams.ts`:**
```ts
const { teams, announcements, stats, activeTeam, setActiveTeam, refreshData } = useTeams();
```

- On mount, fires `Promise.all([fetch('/api/teams'), fetch('/api/announcements'),
  fetch('/api/stats')])` and repeats it on a **5-second `setInterval`** — this is a
  simple polling architecture, not WebSockets/SSE, so "live" updates (e.g. new
  announcements banner, admin verifying a payment) have up to a 5-second lag.
- `activeTeam` (the logged-in team, distinct from the full `teams` list) is persisted
  to `localStorage` under `origin_active_team_id` / `origin_active_team_data`, and
  re-synced against the freshly-fetched `teams` array on every poll — so if an admin
  edits *your* team's data, your own browser tab picks up the change within 5 seconds
  automatically, without you doing anything.
- Every page that needs data calls `useTeams()` itself (see the *Frontend
  Architecture* section above) — each call spins up its own independent poll.

**Other bespoke localStorage keys used across the app** (outside the hook):
| Key | Set by | Purpose |
|---|---|---|
| `origin_active_admin` | `AdminPortal` | Currently signed-in admin's profile |
| `origin_admin_whitelist` | `AdminPortal` | Cached copy of the admin whitelist |
| `origin_jury_auth` | `JuryPortal` | `"true"` once the static passcode is entered |

---

## File Upload Pipeline

Two entry points on the frontend, one shared backend endpoint:

```
RegistrationForm (payment screenshot)         ProjectSubmissionModal (PPT/PDF)
        │                                              │
        ▼                                              ▼
 uploadDirectToImagekit(file, folder)          fetch('/api/upload', {multipart})
   - compresses images client-side               (no client-side compression;
     (canvas, max 1600px, JPEG q=0.82)             10MB hard cap enforced before
   - tries multipart /api/upload                   the request is even sent)
   - falls back to base64 JSON /api/upload
   - ultimate fallback: pure client-side
     Data URL (no network call at all)
        │                                              │
        └──────────────────┬───────────────────────────┘
                            ▼
              backend: uploadController.uploadFile()
              - multer (10MB limit) for multipart, manual base64 decode for JSON
              - validateFileSignature() checks magic bytes (defends against a
                client lying about file type/extension)
              - uploadFileToImagekit(): real upload if IMAGEKIT_PRIVATE_KEY is
                set, otherwise returns a Base64 Data URI as the "url"
                            ▼
              Response: { success, url, publicId }
              → frontend stores `url` directly on the team/project record
```

The frontend's `imagekitClient.ts` has its **own** three-tier fallback (compress →
multipart → base64 → pure client Data URL) that is independent of, and layered on
top of, the backend's own fallback (real ImageKit → Base64 Data URI). In the worst
case (backend totally unreachable, ImageKit unconfigured), the app still "works" by
embedding the file directly as a Data URI string in the team record — at the cost of
a much larger JSON payload stored in Postgres/localStorage.

---

## Database Schema

(Owned entirely by the backend — see `backend/src/config/database.ts`.)

```sql
teams (
  id, team_name, access_code, track,
  payment_status, payment_proof_url, transaction_ref, registered_at,
  checked_in_venue, ticket_issued, notes, amount_paid,
  data JSONB   -- full Team object: leader + up to 4 members + project + score
)
admin_users (email PK, name, role, department, added_at)
announcements (id PK, title, message, category, timestamp, sender)
settings (key PK, value)   -- 'submissions_open' | 'registrations_open'
```

`teams.data` is a JSONB blob holding the **entire nested TypeScript `Team` object**
(see `types/index.ts` on the frontend and `utils/types.ts` on the backend — these two
files are hand-kept in sync, not generated from a shared source). The handful of
duplicated top-level columns (`payment_status`, `checked_in_venue`, etc.) exist purely
so admin queries and filters don't need to deserialize JSON in application code.

---

## API Reference

All endpoints are under `/api` on the backend, reached from the frontend via the
rewrite proxy described above.

| Method | Path | Auth | Used by (frontend) |
|---|---|---|---|
| GET | `/api/health` | none | — (ops check) |
| GET | `/api/stats` | none | `useTeams()` |
| GET | `/api/teams` | none | `useTeams()` |
| GET | `/api/teams/:id` | none | — |
| POST | `/api/teams/auth/team-login` | none | ⚠️ see note below |
| POST | `/api/teams/register` | none | `RegistrationForm` |
| PUT | `/api/teams/:id/project` | none | `ProjectSubmissionModal` |
| DELETE | `/api/teams/:id` | `x-admin-email` | `AdminPortal` |
| GET | `/api/announcements` | none | `useTeams()` |
| POST | `/api/announcements` | `x-admin-email` | `AdminPortal` (broadcast) |
| DELETE | `/api/announcements/:id` | `x-admin-email` | `AdminPortal` |
| POST | `/api/admin/auth/request-otp` | none | `AdminPortal` (legacy path) |
| POST | `/api/admin/auth/verify-otp` | none | `AdminPortal` (legacy path) |
| GET / POST / DELETE | `/api/admin/whitelist[/:email]` | `x-admin-email` | `AdminPortal` |
| POST | `/api/admin/submissions-toggle` | `x-admin-email` | `AdminPortal` |
| POST | `/api/admin/registrations-toggle` | `x-admin-email` | `AdminPortal` |
| GET | `/api/admin/submissions-status` | none | `AdminPortal`, `ProjectSubmissionModal`, `RegistrationForm` |
| GET | `/api/admin/registrations-status` | none | `AdminPortal`, `RegistrationForm` |
| POST | `/api/admin/clear-database` | `x-admin-email` | `AdminPortal` (danger zone) |
| PATCH | `/api/admin/teams/:id/status` | `x-admin-email` | `AdminPortal` |
| POST | `/api/admin/teams/:id/score` | `x-admin-email` | `AdminPortal`, intended for `JuryPortal` |
| POST | `/api/upload` | none (signature-validated) | `imagekitClient.ts` |
| GET | `/api/export-csv` | `x-admin-email` | `AdminPortal` |
| GET | `/api/export-excel` | `x-admin-email` | `AdminPortal` |

> ⚠️ **`TeamLoginModal.tsx` calls `POST /api/auth/team-login`**, but the backend only
> registers this route as `POST /api/teams/auth/team-login` (mounted under
> `router.use('/teams', teamRoutes)`). This is a real path mismatch in the current
> code — `TeamLoginModal`'s login call will 404 against the backend as documented.
> `TeamPassTicket`'s "not logged in" screen and the register-page's flow don't go
> through this modal, so the bug is currently isolated to that one component; fix by
> pointing the fetch at `/api/teams/auth/team-login`, or by adding a route alias on
> the backend.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` / `NEON_DATABASE_URL` | Recommended | NeonDB Postgres connection |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Optional | Redis caching |
| `IMAGEKIT_PRIVATE_KEY` | Optional | Real file hosting (else Base64 fallback) |
| `SUBMISSION_DEADLINE` | Optional | ISO datetime, overrides the hardcoded default |
| `PORT` | Optional | Default `4000` |
| `NODE_ENV` | Optional | `'production'` disables Vite dev middleware |

### Frontend (`frontend/.env.local`)
| Variable | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes (for admin login) | Clerk client SDK |
| `CLERK_SECRET_KEY` | Yes (for Clerk server-side, if using Clerk middleware) | Clerk server SDK |
| `NODE_ENV` | Set by Next.js | Determines which backend URL `next.config.ts` proxies to |

You must also **manually edit** the production backend URL hardcoded in
`frontend/next.config.ts` (`https://your-backend-url.com`) — it is not read from an
environment variable in the current code.

---

## Running Everything Locally

Two terminals, one per repo:

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL etc. if you have them; all optional
npm run dev
# → 🚀 Origin Hackathon Backend running at http://localhost:4000

# Terminal 2 — frontend
cd frontend
npm install
# create frontend/.env.local with your Clerk keys
npm run dev
# → Next.js dev server on http://localhost:3000
#   /api/* requests are proxied to http://localhost:4000/api/* automatically
```

Open `http://localhost:3000` — the browser only ever talks to port 3000; Next.js
transparently forwards `/api/*` calls to port 4000 behind the scenes.

Smoke test once both are running:
```bash
curl http://localhost:3000/api/health     # should proxy through to the backend
curl http://localhost:3000/api/stats
```

---

## Deployment

The two halves deploy **independently** and are stitched together only by the
`next.config.ts` rewrite target:

- **Backend**: deploy `backend/` to Vercel (via `api/index.ts`), Render, Railway, or
  any Node host. Set `DATABASE_URL`, Redis creds, `IMAGEKIT_PRIVATE_KEY` there.
- **Frontend**: deploy `frontend/` to Vercel. Set the Clerk env vars there, and update
  the hardcoded production backend URL inside `next.config.ts`'s `rewrites()` to
  point at wherever you deployed the backend.

Because the frontend proxies API calls server-side (Next.js rewrites happen on the
Vercel edge/server, not in the browser), **the backend never needs CORS
configuration** even across two different Vercel projects/domains — from the
browser's perspective, everything is same-origin.

---

## Known Inconsistencies & Gotchas

These are real characteristics of the current codebase worth knowing before you
extend it:

- **Team login path mismatch** — `TeamLoginModal.tsx` posts to `/api/auth/team-login`;
  the backend only exposes `/api/teams/auth/team-login`. See the API Reference note
  above.
- **Three independent polling loops** — `useTeams()` (5s, called from multiple
  components including `AppShell` itself), `AdminPortal`'s own status polls (on
  mount only, not intervalled), and `ProjectSubmissionModal`'s submissions-status
  poll (10s). None of these are deduplicated or shared via context.
- **Admin auth has two live code paths** (Clerk + legacy OTP) simultaneously wired
  into `AdminPortal.tsx`; which one a given admin uses depends on how they arrive at
  the page. Both are functional, but this suggests the OTP system was the original
  design and Clerk was layered on top later without fully removing it.
- **Jury scoring wiring is incomplete** — `app/(routes)/jury/page.tsx`'s
  `handleScoreProject` is a stub (`// implement`) that never actually calls the
  backend; `JuryPortal.tsx` itself calls the `onScoreProject` prop expecting it to
  persist, so as shipped, jury scores entered through `/jury` are **not saved**. The
  admin dashboard's own scoring UI (`AdminPortal` → Submissions/Leaderboard tabs)
  *is* fully wired and does persist correctly via the same
  `POST /api/admin/teams/:id/score` endpoint.
- **Client-computed fees/deadlines are UX-only** — the frontend independently
  recomputes registration fees (`RegistrationForm`) and deadline status
  (`lib/deadline.ts`, mirrored from the backend's `utils/deadline.ts`) purely for
  responsive UI; the backend always re-derives the authoritative values itself on
  every write, so a modified/stale frontend can't bypass business rules.
- **Two copies of shared logic** — `fileValidation.ts`, `deadline.ts`, and the
  `Team`/`Announcement`/etc. type definitions all exist once in `backend/src` and
  again in `frontend/lib` or `frontend/types`, hand-synced rather than shared via a
  common package. Changing a validation rule or type shape means editing it in two
  places.

---

## Design Decisions & Trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| Rewrite-proxy instead of direct cross-origin fetch | Zero CORS config, same-origin cookies/headers work naturally | Backend URL is a build-time constant in `next.config.ts`, not runtime-configurable |
| Polling instead of WebSockets/SSE | Much simpler to implement and reason about; fine for a single-event, hundreds-of-teams scale | Up to 5–10s staleness on "live" features (announcements, admin actions) |
| Four separate auth systems | Each audience (team/admin/jury) has wildly different security needs and UX expectations | No unified session; four different code paths to maintain |
| Client-side + server-side duplicate validation everywhere | Fast, responsive UI feedback without waiting on a round-trip; server remains authoritative | Two places to update every time a business rule changes |
| JSONB blob per team instead of normalized member tables | Simple schema, no joins needed for up to 5 members + project + score | Some data duplication between JSONB and flat columns |

For the backend's own internal architecture in more depth (caching, DB fallback
mechanics, upload validation internals), see the inline documentation throughout
`backend/src/` — the code is intentionally verbose with comments at every fallback
branch.