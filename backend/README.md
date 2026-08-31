# 🚀 Origin Hackathon — Backend

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Amazon S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Neon DB](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![Vercel](https://img.shields.io/badge/Vercel_Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

A production-grade **Node.js + TypeScript + Express** backend that powers a hackathon
management platform: team registration, payment verification, project submission,
judging/scoring, admin auth, announcements, and live stats.

It is built to run **both** as a traditional long-running Node server (`server.ts`)
**and** as a **Vercel Serverless Function** (`api/index.ts`), with a resilient
multi-tier storage strategy: **NeonDB (Postgres) → Upstash Redis cache → in-memory fallback**, with **Amazon S3** for PPT and presentation files.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Request Lifecycle (End-to-End)](#request-lifecycle-end-to-end)
5. [Layered Architecture Explained](#layered-architecture-explained)
6. [Data Storage Strategy](#data-storage-strategy)
7. [Caching Strategy (Redis)](#caching-strategy-redis)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Upload Pipeline](#file-upload-pipeline)
11. [Domain Model](#domain-model)
12. [API Reference](#api-reference)
13. [Validation Layer](#validation-layer)
14. [Error Handling & Logging](#error-handling--logging)
15. [Deployment Models](#deployment-models)
16. [Environment Variables](#environment-variables)
17. [Local Development](#local-development)
18. [Design Decisions & Trade-offs](#design-decisions--trade-offs)
19. [Known Limitations / Future Work](#known-limitations--future-work)

---

## High-Level Architecture

```
                                   ┌─────────────────────────┐
                                   │        Client(s)         │
                                   │ (Web app / Admin panel)  │
                                   └────────────┬─────────────┘
                                                │ HTTPS (JSON / multipart)
                                                ▼
                      ┌───────────────────────────────────────────────┐
                      │                Express App (app.ts)            │
                      │  - JSON/body parsing                          │
                      │  - Request logger middleware                 │
                      │  - Mounted at /api                            │
                      └───────────────────┬───────────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────────────┐
                      │              Routes (src/routes/*)             │
                      │  teamRoutes, adminRoutes, announcementRoutes,  │
                      │  publicRoutes, + upload/export in index.ts     │
                      └───────────────────┬───────────────────────────┘
                                          ▼
                ┌────────────────────────────────────────────────────┐
                │      Middleware: validate.ts, auth.ts (admin)       │
                └───────────────────┬────────────────────────────────┘
                                    ▼
                      ┌───────────────────────────────────────────────┐
                      │          Controllers (src/controllers/*)       │
                      │  Parse req, orchestrate services, shape res   │
                      └───────────────────┬───────────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────────────┐
                      │            Services (src/services/*)           │
                      │  Business logic + cache-aside orchestration   │
                      └─────────┬───────────────────────┬─────────────┘
                                ▼                       ▼
                 ┌───────────────────────┐   ┌───────────────────────────┐
                 │   config/redis.ts      │   │   config/database.ts       │
                 │  (Upstash REST Redis)  │   │  (NeonDB Postgres pool,    │
                 │  cache-aside layer     │   │   with in-memory fallback) │
                 └───────────────────────┘   └───────────────────────────┘
                                                            │
                                                            ▼
                                              ┌───────────────────────────┐
                                              │  config/imagekit.ts        │
                                              │  (external file storage,   │
                                              │   Base64 Data-URI fallback)│
                                              └───────────────────────────┘
```

**Core idea:** every layer is *defensive*. If Redis is not configured, the app still
works (just without caching). If NeonDB is unreachable or misconfigured, the app
falls back to an **in-memory store** so the API never hard-crashes. If ImageKit is
not configured, uploaded files are stored as Base64 Data URIs instead of failing.

This "graceful degradation" pattern is the single most important architectural
decision in this codebase — it means the backend can be deployed with **zero required
environment variables** and still function (with reduced persistence guarantees).

---

## Tech Stack

| Concern              | Technology                                   | File(s) |
|-----------------------|-----------------------------------------------|---------|
| Web framework          | Express 4                                    | `src/app.ts` |
| Language               | TypeScript (strict), compiled via `tsx`/`esbuild` | `tsconfig.json` |
| Database                | NeonDB (serverless Postgres) via `@neondatabase/serverless` | `src/config/database.ts` |
| Cache                    | Upstash Redis (REST-based, serverless-friendly) | `src/config/redis.ts` |
| File storage             | ImageKit.io (with Base64 fallback)             | `src/config/imagekit.ts` |
| File uploads (multipart) | `multer` (in-memory storage, 10 MB limit)     | `src/controllers/uploadController.ts` |
| Validation                | `express-validator`                          | `src/validators/index.ts` |
| Logging                    | `pino` + `pino-pretty` (dev)                 | `src/utils/logger.ts` |
| Spreadsheet export           | `xlsx` (SheetJS)                          | `src/controllers/exportController.ts` |
| Dev server                    | `vite` (middleware mode, dev only)        | `server.ts` |
| Deployment (serverless)         | Vercel Function entrypoint              | `api/index.ts` |
| Build (production)                | `esbuild` → single CJS bundle          | `package.json` |

---

## Directory Structure

```
api/
  index.ts                 # Vercel serverless entrypoint — re-exports the Express app
src/
  config/
    database.ts             # NeonDB pool + in-memory fallback + all raw SQL/CRUD
    redis.ts                # Upstash Redis client + cache-aside helpers
    imagekit.ts              # External file upload (ImageKit) + Data-URI fallback
  controllers/                # HTTP layer: parse req -> call service -> shape res
    adminController.ts
    announcementController.ts
    exportController.ts
    statsController.ts
    teamController.ts
    uploadController.ts
  middleware/
    auth.ts                  # requireAdminAuth — header-based admin gate
    errorHandler.ts           # centralized Express error handler
    validate.ts                # express-validator result checker
  routes/
    adminRoutes.ts
    announcementRoutes.ts
    index.ts                    # mounts all sub-routers under /api
    publicRoutes.ts
    teamRoutes.ts
  services/                      # business logic + cache-aside orchestration
    adminService.ts
    announcementService.ts
    statsService.ts
    teamService.ts
  utils/
    deadline.ts                   # submission deadline calculation
    fileValidation.ts               # magic-byte file signature checks
    logger.ts                        # pino logger instance
    types.ts                          # shared TypeScript domain types
  validators/
    index.ts                          # express-validator chains per route
  app.ts                                # Express app assembly (middleware + routes)
package.json
server.ts                                # standalone Node server bootstrap (dev/prod)
tsconfig.json
```

---

## Request Lifecycle (End-to-End)

Take a concrete example: **a team registers for the hackathon.**

```
1. Client → POST /api/teams/register  { teamName, leader, member2..5, transactionRef, ... }

2. app.ts
   - express.json() parses the body
   - request-logging middleware logs { method, url, ip }
   - routes to `routes/index.ts` → `/teams` → `teamRoutes.ts`

3. teamRoutes.ts
   - `registerTeamValidation` (express-validator chain) runs field-level checks
     (required fields, email format, enum values, XSS-escaping via `.escape()`)
   - `validate` middleware short-circuits with 400 if validation failed

4. teamController.registerTeam()
   - calls teamService.getRegistrationStatus() → is registration currently open?
   - calls teamService.findTeamByIdentifier(leaderEmail) → idempotency check
     (if the leader already registered, return the existing team instead of erroring)
   - calls teamService.isTransactionRefUsed(ref) → prevents UTR/transaction reuse
   - generates a random team ID (`ORIGIN-XXXX`) and 4-digit access code
   - computes `amountPaid` server-side (Day Scholar ₹219 vs Hosteller ₹100, per member)
   - calls teamService.saveTeam(newTeam)

5. teamService.saveTeam()
   - delegates to config/database.saveTeam() (raw SQL upsert into `teams` table,
     storing both normalized columns AND the full JSON blob in `data`)
   - invalidates the Redis cache key `origin:teams` (cache-aside pattern)

6. Response: 201 { success: true, team: {...} }
```

Every mutating operation (`save`, `update`, `delete`) follows the same pattern:
**write to Postgres (or memory) → invalidate the relevant Redis key.** Every read
operation follows: **check Redis → if miss, read Postgres (or memory) → populate Redis.**

---

## Layered Architecture Explained

The codebase strictly separates four responsibilities. This is a classic **N-tier /
clean-ish layered architecture** adapted for a small Express service:

### 1. Routes (`src/routes/*`)
Pure wiring. Maps an HTTP verb + path to a `[validationChain?, authMiddleware?, controllerFn]`
pipeline. Contains **zero business logic**.

```ts
router.post('/register', registerTeamValidation, validate, registerTeam);
```

### 2. Middleware (`src/middleware/*`)
Cross-cutting concerns that apply *before* a controller runs:
- `validate.ts` — turns `express-validator` errors into a uniform 400 response.
- `auth.ts` — `requireAdminAuth` reads the `x-admin-email` (or `Authorization: Bearer`)
  header, checks it against the admin whitelist, and attaches `req.adminUser`.
- `errorHandler.ts` — catches anything thrown/`next(err)`-ed anywhere downstream and
  returns a uniform `{ success: false, message }` JSON error, logged via `pino`.

### 3. Controllers (`src/controllers/*`)
The HTTP boundary. Responsibilities:
- Read `req.body` / `req.params` / `req.query`.
- Call one or more **service** functions (never touch `config/database.ts` directly).
- Translate service results/errors into HTTP status codes + JSON shape.

Controllers intentionally contain some "orchestration" logic (e.g. `registerTeam`
computing the team ID and payment amount) — in a stricter architecture this would live
in the service layer, but here it's kept controller-side because it's tightly coupled
to request-shaping concerns (defaults, trimming, normalization of the incoming payload).

### 4. Services (`src/services/*`)
The **business/domain logic + caching orchestration layer**. Each service:
- Wraps the corresponding `config/database.ts` functions.
- Implements the **cache-aside pattern**: check Redis first, fall back to DB, populate
  cache on read; invalidate cache on write.

```ts
// services/teamService.ts
export async function getAllTeams(): Promise<Team[]> {
  const cached = await getCachedData<Team[]>(CACHE_KEYS.TEAMS);
  if (cached) return cached;
  const teams = await getStoredTeams();       // hits Postgres (or memory)
  await setCachedData(CACHE_KEYS.TEAMS, teams);
  return teams;
}
```

> Note: `config/database.ts` *also* has its own internal Redis read/write calls as a
> second safety net (e.g. inside `getAllTeams` in `database.ts` itself). This means
> caching is intentionally layered twice — once at the service layer, once at the
> data-access layer — so that even code paths which call `config/database.ts` directly
> still benefit from caching. It's redundant by design for resilience, not a bug.

### 5. Config (`src/config/*`)
The actual I/O layer — talks to NeonDB, Upstash Redis, and ImageKit. This is the
**only** layer allowed to run raw SQL or call external HTTP APIs.

---

## Data Storage Strategy

```
                     ┌─────────────────────────────┐
        write/read   │        Service Layer          │
       ┌────────────▶│  (teamService, adminService…) │
       │              └──────────────┬───────────────┘
       │                             │
       │                 ┌───────────┴────────────┐
       │                 ▼                        ▼
       │      ┌─────────────────────┐   ┌───────────────────────┐
       │      │  Redis (Upstash)     │   │  config/database.ts    │
       │      │  cache-aside layer   │   │  "source of truth"     │
       │      └─────────────────────┘   └───────────┬─────────────┘
       │                                            │
       │                              useNeon = true?│
       │                              ┌──────────────┴───────────────┐
       │                              ▼                              ▼
       │                   ┌─────────────────────┐      ┌─────────────────────────┐
       └───────────────────│   NeonDB (Postgres)   │      │  In-memory JS arrays     │
                            │   (persistent)        │      │  (localTeams, etc.)      │
                            └─────────────────────┘      │  — reset on cold start    │
                                                          └─────────────────────────┘
```

- **`useNeon` flag**: set once at process boot, based on whether `DATABASE_URL` /
  `NEON_DATABASE_URL` is present and the `Pool` was constructed successfully.
- **Automatic downgrade**: if a query fails with Postgres auth error code `28P01`
  (or any error, generically logged), `handleDBError()` flips `useNeon = false` for
  the remainder of the process lifetime, and every subsequent call silently falls
  back to the in-memory arrays. This means a single bad connection string won't
  crash the whole API — it just degrades to ephemeral storage.
- **Dual-write pattern in `saveTeam`/`updateTeam`**: the full `Team` object is stored
  both as **normalized SQL columns** (for fast filtering/sorting, e.g.
  `payment_status`, `checked_in_venue`) **and** as a single `data JSONB` column
  (the full object, used to reconstitute the `Team` type on read). This gives you
  SQL-queryability for the columns that matter operationally, while keeping the
  full nested structure (all 5 members, project, score) intact without needing a
  fully normalized relational schema (no join tables for members).

---

## Caching Strategy (Redis)

`src/config/redis.ts` wraps **Upstash Redis** (a REST-based Redis client — works in
serverless environments without persistent TCP connections, which is why it pairs
well with Vercel Functions).

```ts
export const CACHE_KEYS = {
  TEAMS: 'origin:teams',
  ANNOUNCEMENTS: 'origin:announcements',
  ADMINS: 'origin:admins',
  SUBMISSION_STATUS: 'origin:submission_status',
  REGISTRATION_STATUS: 'origin:registration_status',
};
export const DEFAULT_TTL = 3600; // 1 hour
```

Pattern used everywhere: **cache-aside**
1. `getCachedData(key)` — try Redis, `JSON.parse` if it's a string, return `null` on
   miss or error (never throws to the caller).
2. On DB read, `setCachedData(key, value, ttl)` — writes back with a 1-hour TTL.
3. On any write (create/update/delete), `invalidateCache(key)` — deletes the key so
   the next read repopulates it from Postgres.

If Redis env vars are absent, `redisClient` stays `null` and every cache function
becomes a safe no-op — the app just always reads from Postgres/memory. **Redis is
purely a performance optimization, never a correctness dependency.**

---

## Database Schema

Defined in `initDatabase()` (`src/config/database.ts`), run once at boot if NeonDB
is configured:

```sql
CREATE TABLE IF NOT EXISTS teams (
  id                 VARCHAR(50) PRIMARY KEY,      -- e.g. "ORIGIN-4821"
  team_name          VARCHAR(255) NOT NULL,
  access_code        VARCHAR(10)  NOT NULL,        -- 4-digit login PIN
  track              VARCHAR(100) NOT NULL,
  payment_status     VARCHAR(50)  DEFAULT 'pending',
  payment_proof_url  TEXT,
  transaction_ref    VARCHAR(100),
  registered_at      VARCHAR(100),
  checked_in_venue   BOOLEAN DEFAULT FALSE,
  ticket_issued      BOOLEAN DEFAULT FALSE,
  notes              TEXT,
  amount_paid        INTEGER DEFAULT 150,
  data               JSONB NOT NULL                -- full Team object (all members, project, score)
);

CREATE TABLE IF NOT EXISTS admin_users (
  email       VARCHAR(255) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(100),
  department  VARCHAR(100),
  added_at    VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS announcements (
  id         VARCHAR(100) PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  category   VARCHAR(50),
  timestamp  VARCHAR(100),
  sender     VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS settings (
  key    VARCHAR(100) PRIMARY KEY,     -- 'submissions_open' | 'registrations_open'
  value  TEXT NOT NULL                 -- 'true' | 'false' (string-encoded booleans)
);
```

Notice the **hybrid relational/document design**: `teams.data` holds the entire
nested object (leader + up to 4 members + project + score), while a handful of
"hot path" fields are duplicated into real columns purely so that lookups like
`findTeamByIdentifier` can use `WHERE data->'leader'->>'email' = $1`-style JSONB
path queries efficiently, and admin dashboards can filter/sort without deserializing
JSON in application code.

`settings` is a generic key-value table used for the two global feature flags
(`submissions_open`, `registrations_open`) — a simple pattern that avoids needing a
dedicated table/migration every time a new toggle is needed.

---

## Authentication & Authorization

There are **two separate identity concepts** in this system — teams and admins —
and they are authenticated completely differently.

### Team "auth" (lightweight, PIN-based)
- No passwords, no JWTs, no sessions.
- `POST /api/teams/auth/team-login` — a team logs in with `{ identifier, accessCode }`
  where `identifier` is either the team ID or any member's email, and `accessCode` is
  the 4-digit PIN generated at registration time.
- This is intentionally low-friction (hackathon participants, not high-security
  accounts) — there's no server-side session; the client is expected to just hold
  onto the returned `team` object (e.g. in local storage) for subsequent requests.

### Admin auth (OTP + header-based)
```
┌────────────┐   1. POST /admin/auth/request-otp {email}   ┌────────────┐
│   Client    │ ────────────────────────────────────────▶ │   Server    │
│ (Admin UI)  │                                            │             │
│             │ ◀──────────────────────────────────────── │ generates    │
│             │   { demoOtp } (email is checked against    │ 6-digit OTP, │
│             │      the admin whitelist first)            │ stores in    │
│             │                                            │ Map w/ 10min │
│             │   2. POST /admin/auth/verify-otp            │ expiry       │
│             │      {email, otp}                           │             │
│             │ ◀──────────────────────────────────────── │ validates,   │
│             │   { admin: {name,email,role} }              │ deletes OTP  │
└────────────┘                                            └────────────┘
       │
       │ 3. All subsequent admin requests attach:
       │      x-admin-email: <email>          (or Authorization: Bearer <email>)
       ▼
┌──────────────────────────────────────────────────────────────┐
│  requireAdminAuth middleware (src/middleware/auth.ts)          │
│  - reads header, looks up email in getAuthorizedAdmins()       │
│  - 401 if header missing, 403 if not whitelisted                │
│  - attaches req.adminUser and calls next()                     │
└──────────────────────────────────────────────────────────────┘
```

Key characteristics:
- OTPs are held in an **in-process `Map<email, {otp, expiresAt}>`** — this means OTPs
  do **not** survive a cold start / new serverless instance. This is fine for a
  short-lived, low-stakes internal admin tool, but worth knowing if you deploy on
  Vercel where each invocation may be a fresh instance.
- There is no long-lived session token — the client is expected to keep resending the
  verified admin's email on every request via the `x-admin-email` header. This is
  effectively "trust the client to remember who they are" — acceptable for an internal
  admin tool behind a known URL, **not** suitable as-is for a public-facing app without
  hardening (see [Limitations](#known-limitations--future-work)).
- `requireAdminAuth` is applied via `router.use(requireAdminAuth)` in `adminRoutes.ts`
  *after* the two OTP endpoints, so OTP request/verify remain public, but every other
  `/admin/*` route requires the header.

---

## File Upload Pipeline (Amazon S3 & Storage)

```
Client
  │  either:
  │   (a) multipart/form-data  field "file"
  │   (b) JSON { fileData: "data:<mime>;base64,...", fileName, mimeType }
  ▼
uploadController.uploadFile()
  │
  ├─▶ (a) multer.single('file')  — 50MB limit, mimetype/extension allow-list (.ppt, .pptx, .pdf, images)
  │        │
  │        ▼
  │   validateFileSignature(buffer, mimetype, filename)
  │        — checks magic bytes (PDF: %PDF, JPEG: FFD8FF, PNG: 89504E47, presentations)
  │        — this defends against a client lying about the Content-Type/extension
  │
  └─▶ (b) handleBase64Upload() — decodes the Data URI / raw base64 into a Buffer,
           then runs the same signature validation
  ▼
uploadFileToS3(buffer, filename, mimetype, folder='presentations')
  │
  ├─ if AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY configured:
  │     Executes PutObjectCommand on Amazon S3 client
  │     Bucket: AWS_S3_BUCKET (default: dsc-hackathon-storage)
  │     Key: presentations/<timestamp>_<random>_<filename>
  │     → returns { url: "https://<bucket>.s3.<region>.amazonaws.com/<key>", key, filename, size }
  │
  └─ fallback / offline mode:
        returns secure structured S3 URI reference and metadata
  ▼
Response: { success: true, url, key, publicId, filename, size }
```

This is used for **project presentation files** (PPT/PPTX/PDF up to 50MB) at submission time and **payment proof screenshots** at registration time.

---

## Domain Model

```
Team
 ├─ id: "ORIGIN-XXXX"
 ├─ teamName, accessCode (4-digit PIN), track
 ├─ leader: TeamMember (required)
 ├─ member2..member5: TeamMember (optional, up to 5 total members)
 ├─ paymentStatus: 'pending' | 'verified' | 'rejected'
 ├─ paymentProofUrl, transactionRef, amountPaid
 ├─ registeredAt, checkedInVenue, ticketIssued, notes
 └─ project?: ProjectSubmission
      ├─ title, tagline, problemStatement, solutionDescription, track, techStack[]
      ├─ githubUrl, deploymentUrl?, presentationUrl?, videoUrl?
      ├─ submittedAt
      └─ score?: { innovation, technicalComplexity, uiUx, presentation, impact, feedback?, total }
                   (each criterion scored 0–20 by a judge/admin, summed into `total`)

TeamMember
 ├─ name, email, phone
 ├─ role?, college?
 ├─ registrationNumber? (VIT student reg no.)
 └─ residentialStatus?: 'Hosteller' | 'Day Scholar'   (drives per-head fee calc)
 └─ messName?

Announcement
 ├─ id, title, message
 ├─ category: 'urgent' | 'schedule' | 'food' | 'mentorship' | 'general'
 └─ timestamp, sender

AdminUser
 ├─ email, name
 ├─ role: 'Superadmin' | 'Lead Organizer' | 'Jury Chair' | 'Operations Lead' | 'Faculty Advisor'
 └─ department?, addedAt?
```

**Fee logic** (computed server-side in `teamController.registerTeam`, never trusted
from the client unless explicitly overridden by `amountPaid`):
`Day Scholar → ₹219/head`, `Hosteller → ₹100/head`, summed across all present members.

---

## API Reference

All routes are mounted under `/api`. 🔒 = requires `x-admin-email` header (admin whitelist).

### Health & Public
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/stats` | Aggregate hackathon stats (team counts, track distribution, etc.) |

### Teams
| Method | Path | Description |
|---|---|---|
| GET | `/api/teams` | List all teams |
| GET | `/api/teams/:id` | Get one team by ID |
| POST | `/api/teams/auth/team-login` | Login with `{identifier, accessCode}` |
| POST | `/api/teams/register` | Register a new team (see fee/idempotency logic above) |
| PUT | `/api/teams/:id/project` | Submit/update a project (blocked after deadline or if submissions closed, or team unverified) |
| DELETE | `/api/teams/:id` 🔒 | Remove a team |

### Announcements
| Method | Path | Description |
|---|---|---|
| GET | `/api/announcements` | List announcements |
| POST | `/api/announcements` 🔒 | Create an announcement |
| DELETE | `/api/announcements/:id` 🔒 | Delete an announcement |

### Admin
| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/auth/request-otp` | Send OTP to a whitelisted admin email |
| POST | `/api/admin/auth/verify-otp` | Verify OTP, get admin profile |
| GET | `/api/admin/whitelist` 🔒 | List authorized admins |
| POST | `/api/admin/whitelist` 🔒 | Add an admin |
| DELETE | `/api/admin/whitelist/:email` 🔒 | Remove an admin |
| POST | `/api/admin/submissions-toggle` 🔒 | Open/close project submissions globally |
| POST | `/api/admin/registrations-toggle` 🔒 | Open/close team registration globally |
| GET | `/api/admin/submissions-status` 🔒 | Current submission toggle state |
| GET | `/api/admin/registrations-status` 🔒 | Current registration toggle state |
| POST | `/api/admin/clear-database` 🔒 | ⚠️ Wipes all teams + announcements |
| PATCH | `/api/admin/teams/:id/status` 🔒 | Update payment status / check-in / ticket / notes / amount |
| POST | `/api/admin/teams/:id/score` 🔒 | Submit judging scores for a team's project |

### Uploads & Exports
| Method | Path | Description |
|---|---|---|
| POST | `/api/upload` | Upload a file (multipart or base64 JSON) → ImageKit or Data-URI |
| GET | `/api/export-csv` 🔒 | Export all teams as CSV |
| GET | `/api/export-excel` 🔒 | Export all teams as `.xlsx` (via SheetJS) |

---

## Validation Layer

`src/validators/index.ts` centralizes all `express-validator` chains, one per route
that accepts a body. Each route wires its chain + the shared `validate` middleware:

```ts
router.post('/register', registerTeamValidation, validate, registerTeam);
```

`validate` (in `src/middleware/validate.ts`) simply checks
`validationResult(req).isEmpty()` and returns a uniform `400 { success:false, errors }`
if not. Notable validation choices:
- `.escape()` on free-text fields (names, notes, feedback, announcement text) — a
  basic defense against stored-XSS if this JSON is ever rendered unsanitized in an
  admin dashboard.
- `.normalizeEmail()` + `.isEmail()` on every email field, across the leader and all
  4 optional members.
- Score fields (`innovation`, `technicalComplexity`, `uiUx`, `presentation`, `impact`)
  are bounded `0–20` each by `isInt({min:0, max:20})`.

---

## Error Handling & Logging

- **Logging**: `pino` structured JSON logger (pretty-printed in dev via
  `pino-pretty`). Every incoming request is logged with `{method, url, ip}`.
  Database/Redis/ImageKit failures are logged with context but generally **do not
  propagate as fatal errors** — they trigger the fallback paths described above.
- **Centralized error handler**: `src/middleware/errorHandler.ts` is the last
  middleware in `app.ts`. Any error passed via `next(err)` or thrown inside an async
  controller (Express 4 requires you to catch/forward these manually — most
  controllers here use `try/catch` for this reason) is logged and converted into
  `{ success: false, message }` with the appropriate status code.
- **Uniform response envelope**: virtually every endpoint responds with
  `{ success: boolean, message?, ...payload }`, making client-side handling
  predictable across the whole API surface.

---

## Deployment Models

This backend supports **two deployment modes from the same codebase**:

### 1. Long-running Node server (`server.ts`)
```
npm run build   # esbuild bundles server.ts + src/** into dist/server.cjs (CJS, node platform)
npm start        # node dist/server.cjs
```
In development (`NODE_ENV !== 'production'`), `server.ts` also boots a **Vite dev
server in middleware mode** and mounts it onto the Express app — this is likely so a
frontend SPA can be served from the same process during local development, with API
routes still reachable under `/api`.

### 2. Vercel Serverless Function (`api/index.ts`)
```ts
import app from '../src/app.js';
export default app;
```
Vercel treats any exported Express app under `api/` as a serverless handler. Note
that `api/index.ts` imports `src/app.ts` **directly** (not `server.ts`), so the
Vite-dev-server bootstrap and `app.listen()` call are skipped entirely in this mode —
Vercel's platform handles the actual HTTP listening/routing.

**Why this matters architecturally**: because Vercel Functions are ephemeral and can
cold-start on any request, the in-memory fallbacks (local teams, admin OTPs, etc.)
are **not durable across invocations** in this mode. For production use, `DATABASE_URL`
and the Redis credentials should always be configured when deploying to Vercel —
the in-memory paths exist mainly for local development without any cloud services.

---

## Environment Variables

| Variable | Required? | Used by | Purpose |
|---|---|---|---|
| `DATABASE_URL` / `NEON_DATABASE_URL` | Recommended | `config/database.ts` | NeonDB Postgres connection string. Falls back to in-memory store if absent. `channel_binding=require` is stripped automatically for compatibility. |
| `UPSTASH_REDIS_REST_URL` | Optional | `config/redis.ts` | Upstash Redis REST endpoint (caching layer). |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | `config/redis.ts` | Upstash Redis REST auth token. |
| `IMAGEKIT_PRIVATE_KEY` | Optional | `config/imagekit.ts` | ImageKit private key for real file hosting. Falls back to Base64 Data URIs if absent. |
| `SUBMISSION_DEADLINE` | Optional | `utils/deadline.ts` | ISO datetime overriding the default project-submission deadline (`2026-09-02T12:00:00+05:30`). |
| `PORT` | Optional | `server.ts` | Port for the standalone Node server (default `4000`). |
| `NODE_ENV` | Optional | `server.ts`, `logger.ts` | `'production'` disables Vite dev middleware and pretty logging. |
| `LOG_LEVEL` | Optional | `utils/logger.ts` | pino log level (default `'info'`). |

> None of these are strictly required to boot the app — every integration has a
> fallback — but for a real hackathon in production you should configure at least
> `DATABASE_URL` (persistence) and ideally the Redis + ImageKit credentials.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. (optional) create a .env file
cat > .env <<EOF
DATABASE_URL=postgres://user:pass@host/db?sslmode=require
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxx
EOF

# 3. Run in dev mode (tsx, hot process restart on change)
npm run dev
# → 🚀 Origin Hackathon Backend running at http://localhost:4000

# 4. Type-check without emitting (useful in CI)
npm run lint

# 5. Build production bundle
npm run build
npm start
```

Quick smoke test:
```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/stats
curl -X POST http://localhost:4000/api/teams/register \
  -H "Content-Type: application/json" \
  -d '{"teamName":"Test","track":"AI & Machine Learning","leader":{"name":"A","email":"a@vitbhopal.ac.in","phone":"9999999999"},"transactionRef":"TXN123"}'
```

---

## Design Decisions & Trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| In-memory fallback for DB/Redis | Zero-config local dev, resilience against misconfigured cloud creds in prod | Silent data loss on process restart if `useNeon` ends up `false` in production |
| JSONB blob + duplicated columns | Simple schema (no join tables for up to 5 members), still queryable/filterable on key fields | Slight data duplication; must keep column writes and JSON writes in sync manually |
| Cache invalidation instead of update-in-cache | Simpler to reason about, avoids stale-cache bugs | Extra DB round-trip on the read immediately following a write |
| Header-based admin auth (no JWT/sessions) | Very low implementation overhead for an internal tool | Not suitable for public-internet exposure without additional hardening (rate limiting, real tokens, HTTPS enforcement) |
| Server computes registration fee | Prevents client from tampering with `amountPaid` | Business rule (₹219/₹100) is hardcoded in the controller rather than configurable |
| Idempotent registration by leader email | Prevents duplicate teams from double-submits / retries | Relies on `findTeamByIdentifier`, which does a case-insensitive scan of all teams (fine at hackathon scale, wouldn't scale to millions of rows) |
| Base64 fallback for uploads | Uploads never hard-fail even without ImageKit configured | Can bloat the `teams.data` JSONB column significantly for PDFs/PPTs |

## Known Limitations / Future Work

- **OTP store is in-memory** — won't survive serverless cold starts; consider moving
  to Redis with a TTL (`redis.setex(email, 600, otp)`).
- **No rate limiting** on OTP requests, login, or registration endpoints — worth
  adding (e.g. `express-rate-limit`) before wider public exposure.
- **Admin "session" is just an email header** with no signature/expiry — a stolen or
  guessed admin email header grants full access to any `/admin/*` route. A signed
  short-lived token (JWT or Upstash-Redis-backed session) would harden this
  significantly.
- **No automated tests** are present in the repository — given the amount of
  branching fallback logic (Neon/Redis/ImageKit availability), unit tests around
  `config/database.ts`'s fallback behavior would be high-value.
- **CORS** is not explicitly configured in `app.ts` — if the frontend is served from
  a different origin than the API in production, `cors` middleware should be added.
