# 🏛️ System Architecture & Scale Documentation

This document describes the end-to-end technical architecture, security model, database schema, and serverless execution topology of the **Origin Hackathon Portal**.

---

## 1. High-Level Architecture

The platform follows a modern serverless JAMstack topology:

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
└──────────────┬──────────────────────────────┬─────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────┐
│ Neon Serverless PostgreSQL   │ │ ImageKit Cloud Media CDN │
│ - Teams Table (JSONB)        │ │ - Proof Screenshots      │
│ - Admin Users Table          │ │ - Presentation Decks     │
│ - Announcements Table        │ │ - Architecture Diagrams  │
│ - Settings Table             │ └──────────────────────────┘
└──────────────────────────────┘
```

---

## 2. Security & Validation Framework

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
Payment transaction references (UTR numbers) are indexed with a `UNIQUE` constraint in the database. Before inserting a team record:
1. The server queries `SELECT id FROM teams WHERE LOWER(transaction_ref) = LOWER($1)`.
2. If already registered, returns HTTP 400 with message: *"This UTR/transaction reference has already been used by another team."*

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

## 3. Database Schema (Neon PostgreSQL)

```sql
-- Teams table storing primary team record and JSON payload
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(50) PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  access_code VARCHAR(10) NOT NULL,
  track VARCHAR(100) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_proof_url TEXT,
  transaction_ref VARCHAR(100) UNIQUE,
  registered_at VARCHAR(100),
  checked_in_venue BOOLEAN DEFAULT FALSE,
  ticket_issued BOOLEAN DEFAULT FALSE,
  notes TEXT,
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

-- Global app settings (e.g. submissions_open)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 4. API Endpoint Contract Details

### Team Registration (`POST /api/teams/register`)
- **Request Body**:
  ```json
  {
    "teamName": "Data Titans",
    "track": "AI & Machine Learning",
    "leader": {
      "name": "Aarav Sharma",
      "email": "aarav.24bce10000@vitbhopal.ac.in",
      "phone": "9876543210",
      "college": "VIT Bhopal University"
    },
    "transactionRef": "UTR9876543210",
    "paymentProofUrl": "https://ik.imagekit.io/..."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Team registered! Access is currently pending admin verification.",
    "team": {
      "id": "ORIGIN-8412",
      "accessCode": "4921",
      "paymentStatus": "pending"
    }
  }
  ```

### Project Evaluation (`POST /api/teams/:id/score`)
- **Request Body**:
  ```json
  {
    "innovation": 9,
    "technicalComplexity": 8,
    "uiUx": 9,
    "presentation": 8,
    "impact": 9,
    "feedback": "Outstanding technical depth and slick user UI!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Project score saved.",
    "team": {
      "project": {
        "score": {
          "total": 43
        }
      }
    }
  }
  ```

---

## 5. Deployment Topology (Vercel Serverless)

In production on Vercel:
- Frontend static assets are served via Vercel Edge Network.
- Express server routes in `api/index.ts` run as serverless functions.
- Database connection pooling is handled by `@neondatabase/serverless` over WebSocket/HTTP.
- Media uploads stream to ImageKit REST endpoints via serverless buffer memory.
