# 🏗️ ORIGIN '26 — System Architecture & Workflow Specifications

This document outlines the complete technical architecture, end-to-end data flows, and workflow diagrams for the **Origin Hackathon Platform** built for the Data Science Club (VIT Bhopal).

---

## 🌟 Tech Stack Overview

| Component | Technology | Role / Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router) + React 19 + Tailwind CSS** | High-performance UI, animations (GSAP/Lenis/Motion), reactive dashboard |
| **Authentication** | **Google Firebase Auth** | Secure Identity Management for Team Leaders, Admins, and Organizers |
| **Backend API** | **Node.js (Express) + TypeScript** | REST API layer, business logic, validation, and middleware |
| **Object Storage** | **Amazon S3 (AWS)** | Secure cloud storage for PPT/PDF pitch decks and project submission files |
| **Database** | **Neon PostgreSQL (Serverless)** | Relational database for teams, projects, scores, and admin audit logs |
| **Caching Layer** | **Upstash Redis** | Sub-millisecond distributed caching, rate-limiting, and registration state |
| **Deployment** | **Vercel** | Edge network deployment for both Next.js frontend and Serverless backend |

---

## 🗺️ High-Level System Architecture

```mermaid
flowchart TB
    subgraph Clients["🌐 Client Layer (Browser)"]
        User["Participant / Team Leader"]
        Admin["DSC Admin / Organizer"]
        Jury["Jury Member / Evaluator"]
    end

    subgraph Frontend["⚡ Frontend Layer (Next.js 16 / Vercel)"]
        Landing["Marketing Pages\n(/, /schedule, /faq)"]
        RegForm["Team Registration\n(/register)"]
        TeamDash["Team Dashboard & Ticket\n(/team, /submit)"]
        AdminPortal["Admin Console\n(/admin)"]
        JuryPortal["Jury Evaluation\n(/jury)"]
        AuthCtx["Firebase Auth Context"]
    end

    subgraph Security["🔐 Auth & Identity"]
        FirebaseAuth["Google Firebase Auth"]
    end

    subgraph Backend["🚀 Backend API Layer (Express / Vercel Serverless)"]
        Router["Express Router (/api)"]
        AuthMiddleware["Admin Auth & Role Verification"]
        ValMiddleware["Signature & Input Validation"]
        Controllers["Controllers\n(Team, Upload, Admin, Jury, Stats)"]
    end

    subgraph Storage["☁️ Cloud Storage & Database Layer"]
        S3["📦 Amazon S3 Storage\n(PPT / Pitch Decks / Submissions)"]
        NeonDB[("🐘 Neon PostgreSQL DB\n(Teams, Projects, Scores)")]
        Redis[("⚡ Upstash Redis Cache\n(Fast Cache & Fallback)")]
    end

    User --> Landing & RegForm & TeamDash
    Admin --> AdminPortal
    Jury --> JuryPortal

    Admin & User -.-> AuthCtx
    AuthCtx <==> FirebaseAuth

    RegForm & TeamDash & AdminPortal & JuryPortal ==>|fetch('/api/*')| Router
    Router --> AuthMiddleware --> ValMiddleware --> Controllers

    Controllers -->|Upload PPT / PDF| S3
    Controllers <-->|Get / Invalidate Cache| Redis
    Controllers <-->|Read / Write Data| NeonDB
```

---

## 🔄 End-to-End Workflow Diagrams

### 1. Team Registration & Fee Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Leader as Team Leader
    participant FE as Frontend (/register)
    participant API as Backend API (/api/teams)
    participant S3 as AWS S3 / ImageKit
    participant Redis as Upstash Redis
    participant DB as Neon PostgreSQL

    Leader->>FE: Fills details (VIT Email, Members, Track, UPI UTR)
    Leader->>FE: Attaches payment receipt screenshot
    FE->>API: POST /api/upload (Receipt image)
    API->>S3: Upload payment receipt
    S3-->>API: Returns receipt URL
    API-->>FE: Receipt URL verified
    FE->>API: POST /api/teams (Team payload + Receipt URL)
    API->>DB: INSERT into teams table (status='pending')
    API->>Redis: Invalidate CACHE_KEYS.TEAMS
    API-->>FE: Returns generated Team ID & Access Code
    FE-->>Leader: Shows Success modal + Access Code Pass Ticket
```

---

### 2. Project Presentation (PPT) Upload & Submission Flow

```mermaid
sequenceDiagram
    autonumber
    actor Team as Participant Team
    participant FE as Frontend (/submit)
    participant API as Backend API (/api/upload, /api/teams/:id)
    participant S3 as Amazon S3 Bucket
    participant DB as Neon PostgreSQL
    participant Redis as Upstash Redis

    Team->>FE: Logs in with Team ID & Access Code
    Team->>FE: Selects Pitch Deck (.ppt / .pptx / .pdf - up to 50MB)
    FE->>API: POST /api/upload (Multipart FormData)
    API->>API: Validate file signature & MIME type
    API->>S3: PutObjectCommand (Bucket: dsc-hackathon-storage)
    S3-->>API: S3 Public URL (https://bucket.s3.region.amazonaws.com/...)
    API-->>FE: { success: true, url: S3_URL, filename: "pitch_deck.pptx" }
    Team->>FE: Fills GitHub repo, Demo link, Tech stack, and Problem Statement
    Team->>FE: Clicks "Submit Project"
    FE->>API: PUT /api/teams/:id (Project object with S3 presentationUrl)
    API->>DB: UPDATE teams SET project = ...
    API->>Redis: Invalidate CACHE_KEYS.TEAMS
    API-->>FE: { success: true, team: updatedTeam }
    FE-->>Team: Confetti Animation 🎉 & Submission Status Updated
```

---

### 3. Live Announcements & Broadcast Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as DSC Administrator
    participant FE as Frontend (/admin)
    participant API as Backend API (/api/announcements)
    participant Redis as Upstash Redis
    participant DB as Neon PostgreSQL
    actor Users as Live Participants

    Admin->>FE: Posts announcement (Title, Content, Priority, Category)
    FE->>API: POST /api/admin/announcements (Header: x-admin-email)
    API->>DB: INSERT INTO announcements
    API->>Redis: Invalidate CACHE_KEYS.ANNOUNCEMENTS
    API-->>FE: Announcement published
    loop Every 10 seconds (Polling)
        Users->>API: GET /api/announcements
        API->>Redis: GET origin:announcements
        alt Cache Hit
            Redis-->>API: Return cached JSON
        else Cache Miss
            API->>DB: SELECT * FROM announcements
            API->>Redis: SET origin:announcements (TTL: 1 hour)
        end
        API-->>Users: Display live floating broadcast banner
    end
```

---

### 4. Jury Evaluation & Live Leaderboard Flow

```mermaid
sequenceDiagram
    autonumber
    actor Jury as Hackathon Jury
    participant FE as Frontend (/jury)
    participant API as Backend API (/api/jury/score)
    participant DB as Neon PostgreSQL
    participant Redis as Upstash Redis

    Jury->>FE: Authenticates via Jury Passcode
    Jury->>FE: Views Team Submission (Opens AWS S3 PPT deck & GitHub)
    Jury->>FE: Scores across Rubrics (Innovation, Implementation, UI/UX, Presentation)
    FE->>API: POST /api/jury/score (Team ID, Rubric scores, Feedback)
    API->>DB: UPSERT INTO scores table
    API->>Redis: Invalidate CACHE_KEYS.TEAMS
    API-->>FE: Score recorded
    FE-->>Jury: Team marked as Evaluated with Live Total
```

---

## 🗄️ Database Schema & Redis Cache Keys

### Neon PostgreSQL Schema
* **`teams`**:
  * `id`: `VARCHAR(50)` (Primary Key, e.g. `ORIGIN-AI-1024`)
  * `team_name`: `VARCHAR(255)`
  * `access_code`: `VARCHAR(10)`
  * `track`: `VARCHAR(100)`
  * `payment_status`: `VARCHAR(50)` (`pending` | `verified` | `rejected`)
  * `payment_proof_url`: `TEXT`
  * `transaction_ref`: `VARCHAR(255)`
  * `leader`: `JSONB`
  * `members`: `JSONB`
  * `project`: `JSONB` (Contains `title`, `githubUrl`, `presentationUrl`, `techStack`, `submissionTime`)
  * `created_at`: `TIMESTAMP WITH TIME ZONE`
* **`announcements`**:
  * `id`: `VARCHAR(50)`
  * `title`: `VARCHAR(255)`
  * `message`: `TEXT`
  * `priority`: `VARCHAR(20)` (`normal` | `urgent` | `critical`)
  * `created_at`: `TIMESTAMP WITH TIME ZONE`
* **`admin_users`**:
  * `email`: `VARCHAR(255)` (Primary Key)
  * `name`: `VARCHAR(255)`
  * `role`: `VARCHAR(50)`

### Upstash Redis Cache Keys
| Cache Key | TTL | Description |
| :--- | :--- | :--- |
| `origin:teams` | 3600s | Cached list of all registered teams |
| `origin:announcements` | 3600s | Cached list of all active broadcasts |
| `origin:admins` | 86400s | Authorized admin emails list |
| `origin:registration_status` | 3600s | Boolean flag (`true`/`false`) for open registrations |
| `origin:submission_status` | 3600s | Boolean flag (`true`/`false`) for open project submissions |

---

## 🔐 Environment Variables Specification

```env
# 1. Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:password@ep-host.aws.neon.tech/neondb?sslmode=require

# 2. AWS S3 Storage (PPT Submissions & Documents)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=dsc-hackathon-storage

# 3. Google Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dscorigin.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dscorigin
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dscorigin.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=131384799615
NEXT_PUBLIC_FIREBASE_APP_ID=1:131384799615:web:229ac9ff5b19872eb6aa4a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58MTEF0T3Y

# 4. Upstash Redis (High-Speed In-Memory Caching)
UPSTASH_REDIS_REST_URL=https://dear-shrew-171517.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAp39AAIgcDJiYTZ...

# 5. ImageKit (Receipt & Screenshot Uploads)
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...

# 6. Service Routing (Frontend ↔ Backend on Vercel)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.vercel.app
```
