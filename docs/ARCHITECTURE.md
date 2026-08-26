# 🏛️ System Architecture & Scale Documentation

This document describes the end-to-end technical architecture, security model, database schema, caching strategy, and serverless execution topology of the **Origin Hackathon Portal**.

---

## 1. High-Level Architecture

The platform follows a modern serverless JAMstack topology with dual-layer persistence and caching:

```
┌───────────────────────────────────────────────────────────┐
│                 Client (React 19 + Vite)                  │
│       - Landing Page, Track Browsing, Registration       │
│       - Team Portal Modal (Pass, Ticket, Submissions)     │
│       - Admin Command Hub (Whitelist, Scoring, Exports)   │
└────────────────────────────┬──────────────────────────────┘
                             │ HTTPS / REST
                             ▼
┌───────────────────────────────────────────────────────────┐
│               Backend Layer (Express + Node.js)           │
│     Local: tsx server.ts  |  Production: api/index.ts     │
│  - Magic-Byte Binary Signature Validation                │
│  - UTR / Transaction Ref Deduplication                    │
│  - Whitelisted Admin OTP Verification                     │
│  - Dual-Gated Project Submission Engine                   │
└──────┬──────────────────────┬──────────────────────┬──────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌───────────────────┐  ┌───────────────────┐  ┌──────────────────────────┐
│ Upstash Redis     │  │ Neon Serverless   │  │ ImageKit Cloud Media CDN │
│ Cache Buffer      │  │ PostgreSQL DB     │  │ - Proof Screenshots      │
│ - Sub-ms Reads    │  │ - Authoritative   │  │ - Presentation Decks     │
│ - Live Poll Sync  │  │   Postgres Store  │  │ - Architecture Diagrams  │
│ - Auto Invalidate │  │ - JSONB Document  │  └──────────────────────────┘
└───────────────────┘  └───────────────────┘
```

---

## 2. Caching Architecture (Upstash Redis Buffer)

To support high-concurrency real-time polling (e.g. all participant passes and admin monitoring dashboards polling every 5 seconds) without overloading serverless database connection limits, the backend implements an **Upstash Redis Cache Layer** with active cache invalidation.

### Cache Keys & Strategy

| Cache Key | Data Cached | TTL / Invalidation Policy |
| :--- | :--- | :--- |
| `origin:teams:all` | Complete hydrated array of registered teams | Invalidated on `saveNewTeam`, `updateTeam`, `deleteTeam`, and `clearAllData` |
| `origin:admins:whitelist` | Authorized admin users whitelist | Invalidated on `addAdmin`, `removeAdmin` |
| `origin:announcements:all` | Broadcast announcements feed | Invalidated on `addAnnouncement`, `deleteAnnouncement` |
| `origin:settings:submissions` | Boolean flag for global submissions window | Updated atomically on `setSubmissionStatusDB` |
| `origin:settings:registrations`| Boolean flag for global registrations window | Updated atomically on `setRegistrationStatusDB` |

### Read/Write Invalidation Flow
1. **Reads**: The backend attempts to read from the authoritative Neon DB connection. The result is asynchronously cached into Upstash Redis. If the DB encounters cold-start latency, the Upstash Redis buffer instantly serves the warm cached dataset.
2. **Writes**: Updates write directly to Neon PostgreSQL (`ON CONFLICT DO UPDATE`). Upon write confirmation, the corresponding Redis cache key is invalidated or refreshed so all subsequent read requests immediately reflect fresh state.

---

## 3. Security & Validation Framework

### A. Binary Signature (Magic Bytes) File Validation
To prevent extension spoofing or malicious payload execution via file uploads, the server inspects the initial byte sequences (magic bytes) of uploaded buffers:

| File Type | Allowed MIME Types | Magic Byte Signature (Hex Sequence) |
| :--- | :--- | :--- |
| **JPEG** | `image/jpeg`, `image/jpg` | `FF D8 FF` |
| **PNG** | `image/png` | `89 50 4E 47 0D 0A 1A 0A` |
| **GIF** | `image/gif` | `47 49 46 38` (`GIF8`) |
| **WEBP** | `image/webp` | Starts with `52 49 46 46` (`RIFF`) and contains `57 41 56 45` (`WEBP`) |
| **PDF** | `application/pdf` | `25 50 44 46` (`%PDF`) |
| **PPT / PPTX**| `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats...` | `D0 CF 11 E0` (OLE) or `50 4B 03 04` (ZIP/OOXML) |

### B. Unique UTR & Transaction Deduplication
Payment transaction references (UTR numbers) are verified in PostgreSQL before team insertion:
1. The server queries `SELECT id FROM teams WHERE LOWER(transaction_ref) = LOWER($1)`.
2. If already registered, returns HTTP 400: *"This UTR/transaction reference has already been used by another team."*

### C. Whitelisted Admin OTP Authentication
Admin privileges are restricted to designated executive council emails:
1. `POST /api/admin/auth/request-otp` checks if the requested email exists in `admin_users`.
2. If whitelisted, a cryptographically generated 6-digit OTP code with a 10-minute expiry window is issued.
3. `POST /api/admin/auth/verify-otp` authenticates the token and authorizes admin access.

### D. Dual-Gated Project Submission Lock
Project submissions (`PUT /api/teams/:id/project`) enforce three concurrent locks:
1. **Official Hackathon Deadline**: Blocked if `Date.now() > submissionDeadline`.
2. **Global Admin Toggle**: Blocked if `submissions_open` setting in DB is `false`.
3. **Payment Verification Gate**: Blocked if `team.paymentStatus !== 'verified'`.

---

## 4. Database Schema (Neon PostgreSQL)

```sql
-- Teams table storing primary team record and JSON payload
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(50) PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  access_code VARCHAR(10) NOT NULL,
  track VARCHAR(100) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_proof_url TEXT,
  transaction_ref VARCHAR(100),
  registered_at VARCHAR(100),
  checked_in_venue BOOLEAN DEFAULT FALSE,
  ticket_issued BOOLEAN DEFAULT FALSE,
  notes TEXT,
  amount_paid INTEGER DEFAULT 150,
  data JSONB NOT NULL
);

-- Authorized admin users directory
CREATE TABLE IF NOT EXISTS admin_users (
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  added_at VARCHAR(50)
);

-- Broadcast announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(100) PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50),
  timestamp VARCHAR(100),
  sender VARCHAR(100)
);

-- Global app settings (e.g. submissions_open, registrations_open)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 5. Deployment Topology (Vercel Serverless)

In production on Vercel:
- Frontend static assets are served via Vercel Edge Network.
- Express server routes in `api/index.ts` run as serverless functions.
- Database connection pooling is handled by `@neondatabase/serverless` over WebSocket/HTTP.
- Upstash Redis handles high-speed distributed cache buffering.
- Media uploads stream to ImageKit REST endpoints via serverless buffer memory and multipart form data.
