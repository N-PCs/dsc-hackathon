# 🚀 ORIGIN '26 — Full-Stack Hackathon Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3-333333?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=000000)
![React](https://img.shields.io/badge/React-19-333333?style=for-the-badge&logo=react&logoColor=black&labelColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-333333?style=for-the-badge&logo=typescript&logoColor=white&labelColor=3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-333333?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=06B6D4)
![Express.js](https://img.shields.io/badge/Express.js-4.21-333333?style=for-the-badge&logo=express&logoColor=white&labelColor=404D59)
![Node.js](https://img.shields.io/badge/Node.js-20.x-333333?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=339933)
![Amazon S3](https://img.shields.io/badge/Amazon_S3-Storage-333333?style=for-the-badge&logo=amazons3&logoColor=white&labelColor=569A31)
![Firebase](https://img.shields.io/badge/Firebase-Auth-333333?style=for-the-badge&logo=firebase&logoColor=black&labelColor=FFCA28)
![Neon DB](https://img.shields.io/badge/Neon_DB-PostgreSQL-333333?style=for-the-badge&logo=postgresql&logoColor=black&labelColor=00E599)
![Upstash Redis](https://img.shields.io/badge/Upstash-Redis_Cache-333333?style=for-the-badge&logo=redis&logoColor=white&labelColor=DC382D)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-333333?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000)

<br />

A production-grade, full-stack platform powering the flagship **Origin Hackathon** hosted by the **Data Science Club (DSC)** at **VIT Bhopal University**. Real-time team registration, digital access ticket pass, Amazon S3-backed presentation uploads, Google Firebase identity management, Neon PostgreSQL storage, Upstash Redis caching, and an organizer command center.

**Live Frontend → [dsc-hackathon.vercel.app](https://dsc-hackathon.vercel.app)** &nbsp;|&nbsp; **API → [backend-git-master-n-pcs-projects.vercel.app](https://backend-git-master-n-pcs-projects.vercel.app)**

</div>

---

## Key Features

- ** High-Performance Next.js 16 UI** — Fluid client-side experience with GSAP, Lenis smooth scrolling, framer-motion animations, custom cybernetic aesthetic, and interactive 3D particle backgrounds.
- ** Google Firebase Authentication** — Secure organizer and leader authentication enforcing `@vitbhopal.ac.in` domain verification.
- ** Amazon S3 Presentation Storage** — Fast and secure direct-to-cloud upload pipeline for participant pitch decks (.ppt, .pptx, .pdf up to 50MB) and payment receipts.
- ** Digital Team ID Pass & Ticket** — Instant generation of digital passcards with unique Team IDs (e.g. `ORIGIN-AI-1024`) and 4-digit PIN access codes with print/download capabilities.
- ** Neon Serverless PostgreSQL** — Hybrid relational & JSONB document database architecture with ACID transactions and automatic indexing.
- ** Upstash Redis High-Speed Caching** — Sub-millisecond distributed in-memory cache layer for real-time team lookups, live announcements, and registration status flags.
- ** Real-Time Broadcast Console** — Organizer announcement banner polled live by participants without requiring page reloads.
- ** Jury Evaluation Portal** — Streamlined evaluator interface with custom scoring rubrics (Innovation, Implementation, UI/UX, Presentation) and real-time leaderboard aggregation.
- ** Admin Control Center & Excel Export** — Comprehensive dashboard to verify UPI transactions, toggle registrations/submissions, and stream-export full team reports to `.xlsx` and `.csv`.

---

## Workflow Diagram

```mermaid
flowchart TB
    %% Neon Palette Definitions
    %% Client Layer (Neon Cyan)
    classDef clientStyle fill:#002b36,stroke:#00f3ff,stroke-width:2px,color:#00f3ff
    classDef clientBox fill:#003847,stroke:#00f3ff,stroke-width:1.5px,color:#ffffff

    %% Frontend Layer (Neon Yellow)
    classDef frontendStyle fill:#2a2800,stroke:#ffee00,stroke-width:2px,color:#ffee00
    classDef frontendBox fill:#383500,stroke:#ffee00,stroke-width:1.5px,color:#ffffff

    %% Security Layer (Neon Gold / Yellow-Orange)
    classDef securityStyle fill:#2b1d00,stroke:#ffb700,stroke-width:2px,color:#ffb700
    classDef securityBox fill:#3d2900,stroke:#ffb700,stroke-width:1.5px,color:#ffffff

    %% Backend Layer (Neon Green)
    classDef backendStyle fill:#002e0c,stroke:#00ff66,stroke-width:2px,color:#00ff66
    classDef backendBox fill:#004212,stroke:#00ff66,stroke-width:1.5px,color:#ffffff

    %% Storage Layer (Neon Magenta)
    classDef storageStyle fill:#2e0026,stroke:#ff00bb,stroke-width:2px,color:#ff00bb
    classDef s3Box fill:#380010,stroke:#ff3300,stroke-width:1.5px,color:#ffffff
    classDef neonBox fill:#003820,stroke:#00ff99,stroke-width:1.5px,color:#ffffff
    classDef redisBox fill:#400000,stroke:#ff003c,stroke-width:1.5px,color:#ffffff

    subgraph Clients["Client Layer (Browser)"]
        User["Participant / Team Leader"]
        Admin["DSC Admin / Organizer"]
        Jury["Jury Member / Evaluator"]
    end

    subgraph Frontend["Frontend Layer (Next.js 16 / Vercel)"]
        Landing["Marketing Pages\n(/, /schedule, /faq)"]
        RegForm["Team Registration\n(/register)"]
        TeamDash["Team Dashboard & Ticket\n(/team, /submit)"]
        AdminPortal["Admin Console\n(/admin)"]
        JuryPortal["Jury Evaluation\n(/jury)"]
        AuthCtx["Firebase Auth Context"]
    end

    subgraph Security["Auth & Identity"]
        FirebaseAuth["Google Firebase Auth"]
    end

    subgraph Backend["Backend API Layer (Express / Vercel Serverless)"]
        Router["Express Router (/api)"]
        AuthMiddleware["Admin Auth & Role Verification"]
        ValMiddleware["Signature & Input Validation"]
        Controllers["Controllers\n(Team, Upload, Admin, Jury, Stats)"]
    end

    subgraph Storage["Cloud Storage & Database Layer"]
        S3["Amazon S3 Storage\n(PPT / Pitch Decks / Submissions)"]
        NeonDB[("Neon PostgreSQL DB\n(Teams, Projects, Scores)")]
        Redis[("Upstash Redis Cache\n(Fast Cache & Fallback)")]
    end

    %% Apply Classes
    class User,Admin,Jury clientBox
    class Landing,RegForm,TeamDash,AdminPortal,JuryPortal,AuthCtx frontendBox
    class FirebaseAuth securityBox
    class Router,AuthMiddleware,ValMiddleware,Controllers backendBox
    class S3 s3Box
    class NeonDB neonBox
    class Redis redisBox

    class Clients clientStyle
    class Frontend frontendStyle
    class Security securityStyle
    class Backend backendStyle
    class Storage storageStyle

    %% Connections
    User --> Landing & RegForm & TeamDash
    Admin --> AdminPortal
    Jury --> JuryPortal

    Admin & User -.-> AuthCtx
    AuthCtx <==> FirebaseAuth

    RegForm & TeamDash & AdminPortal & JuryPortal == "fetch('/api/')" ==> Router
    Router --> AuthMiddleware --> ValMiddleware --> Controllers

    Controllers -->|Upload PPT / PDF| S3
    Controllers <-->|Get / Invalidate Cache| Redis
    Controllers <-->|Read / Write Data| NeonDB
```

---

### Team Registration & Fee Verification Flow

```mermaid
sequenceDiagram
    actor Leader as Team Leader
    participant App as Origin Frontend (Next.js 16)
    participant Auth as Firebase Auth
    participant API as Backend API (Express)
    participant S3 as Amazon S3 Storage
    participant DB as Neon PostgreSQL
    participant Redis as Upstash Redis

    Leader->>App: Open /register
    Leader->>Auth: Verify @vitbhopal.ac.in Email
    Auth-->>App: Domain Verified

    Leader->>App: Fill Team details (Leader, Members 2-5, Track, UPI Ref)
    Leader->>App: Upload UPI payment screenshot
    App->>API: POST /api/upload (Multipart image)
    API->>S3: Upload to S3 bucket
    S3-->>API: S3 URL returned
    API-->>App: { success: true, url: receiptUrl }

    Leader->>App: Confirm Registration
    App->>API: POST /api/teams (Payload + receiptUrl)
    API->>DB: INSERT team (paymentStatus='pending')
    API->>Redis: Invalidate origin:teams cache
    API-->>App: { success: true, team: { id: "ORIGIN-AI-1024", accessCode: "4921" } }
    App-->>Leader: Confetti Animation 🎉 + Digital ID Ticket Pass
```

---

### Project PPT Submission Flow (AWS S3)

```mermaid
sequenceDiagram
    actor Team as Participant Team
    participant App as Origin Frontend (/submit)
    participant API as Backend API (/api)
    participant S3 as Amazon S3 Bucket
    participant DB as Neon PostgreSQL
    participant Redis as Upstash Redis

    Team->>App: Login with Team ID + 4-digit PIN Access Code
    App->>API: POST /api/teams/auth/team-login
    API->>Redis: Check origin:teams
    API-->>App: Team Profile (paymentStatus must be 'verified')

    Team->>App: Choose Pitch Deck (.ppt / .pptx / .pdf up to 50MB)
    App->>API: POST /api/upload (file FormData)
    API->>API: Validate file signature & extension
    API->>S3: PutObjectCommand (Key: presentations/timestamp_filename)
    S3-->>API: Public S3 Object URL
    API-->>App: { success: true, url: s3PresentationUrl }

    Team->>App: Add GitHub Repo, Demo Link & Problem Statement
    Team->>App: Click "Submit Project"
    App->>API: PUT /api/teams/:id (project data + s3PresentationUrl)
    API->>DB: UPDATE teams SET project = ...
    API->>Redis: Invalidate origin:teams cache
    API-->>App: { success: true, message: "Project Submitted" }
    App-->>Team: Live submission confirmed & locked
```

---

### Organiser Admin Verification & Export Flow

```mermaid
sequenceDiagram
    actor Admin as DSC Organizer
    participant App as Admin Console (/admin)
    participant Auth as Firebase Auth
    participant API as Backend API
    participant DB as Neon PostgreSQL
    participant Redis as Upstash Redis

    Admin->>App: Sign in with Google (@vitbhopal.ac.in)
    App->>Auth: signInWithPopup()
    Auth-->>App: ID Token & Email
    App->>App: Whitelist verification against Admin list

    Admin->>App: View Pending Registrations
    App->>API: GET /api/teams (Header: x-admin-email)
    API->>Redis: GET origin:teams
    alt Cache Miss
        API->>DB: SELECT * FROM teams ORDER BY created_at DESC
        API->>Redis: SET origin:teams (TTL: 3600s)
    end
    API-->>App: Teams list + S3 Receipt URLs

    Admin->>App: Inspect S3 receipt thumbnail & Click "Verify Payment"
    App->>API: PATCH /api/teams/:id/status { paymentStatus: 'verified' }
    API->>DB: UPDATE teams SET payment_status='verified'
    API->>Redis: Invalidate origin:teams
    API-->>App: Status updated (Team unlocked for PPT submission)

    Admin->>App: Click "Export to Excel"
    App->>API: GET /api/admin/export-excel
    API->>DB: Query complete dataset
    API-->>App: Streamed .xlsx file with S3 links
    App-->>Admin: Download completed
```

---

## Tech Stack

| Layer | Technology | Role | Free Tier / Availability |
|---|---|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Client UI, Routing, Animations | Free / Open Source |
| **Authentication** | [Google Firebase Auth](https://firebase.google.com/) | OAuth Sign-in & Domain Verification | 50k MAUs / Free tier |
| **Backend API** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/) | REST API & Business Logic | Free / Open Source |
| **Object Storage** | [Amazon Web Services (AWS S3)](https://aws.amazon.com/s3/) | PPT, PPTX, PDF & Image Uploads | 5 GB S3 Free Tier |
| **Database** | [Neon Serverless PostgreSQL](https://neon.tech/) | Primary Persistent Relational Storage | 0.5 GB Free Tier |
| **Caching Layer** | [Upstash Redis](https://upstash.com/) | Distributed In-Memory Cache | 10k commands/day Free |
| **Deployment** | [Vercel](https://vercel.com/) | Edge Hosting for Frontend & Serverless API | 100 GB Bandwidth Free |

---

## Repository Structure

```
dsc-hackathon/
├── ARCHITECTURE.md               # Complete System Architecture & Specifications
├── README.md                     # Monorepo Master Documentation
│
├── backend/                      # Express + TypeScript REST API Layer
│   ├── api/
│   │   └── index.ts              # Vercel Serverless Function entrypoint
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts       # Neon PostgreSQL connection & pool manager
│   │   │   ├── redis.ts          # Upstash Redis client & cache helpers
│   │   │   └── s3.ts             # AWS S3 Client & 50MB file upload helper
│   │   ├── controllers/          # Business logic handlers (team, upload, admin, jury)
│   │   ├── middleware/           # Auth validation, error handling, rate limiting
│   │   ├── routes/               # API route definitions (/teams, /upload, /admin)
│   │   ├── services/             # Data access & caching service layer
│   │   └── utils/                # Pino logger, types, file signature validation
│   ├── server.ts                 # Standalone Node.js server (local dev / container)
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json               # Vercel Serverless rewrites configuration
│
└── frontend/                     # Next.js 16 App Router UI
    ├── app/
    │   ├── (routes)/
    │   │   ├── admin/            # Admin Command Console (/admin)
    │   │   ├── faq/              # Frequently Asked Questions (/faq)
    │   │   ├── jury/             # Jury Evaluation Portal (/jury)
    │   │   ├── register/         # Team Registration Form (/register)
    │   │   ├── schedule/         # Hackathon Timeline & Rules (/schedule)
    │   │   ├── submit/           # PPT Submission Portal (/submit)
    │   │   └── team/             # Team Pass & Live Dashboard (/team)
    │   ├── components/           # UI widgets, Navigation, Modals, Sections
    │   ├── globals.css           # Tailwind v4 styles + custom theme tokens
    │   └── layout.tsx            # Global layout with Firebase Auth Provider
    ├── hooks/                    # useTeams, custom animation & polling hooks
    ├── lib/                      # Firebase config, S3 helpers, deadline utils
    ├── types/                    # Shared TypeScript interfaces (Team, Project)
    ├── next.config.ts            # Next.js production rewrites (/api/* -> Backend)
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- A **Neon PostgreSQL** database account
- An **AWS S3** bucket (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`)
- An **Upstash Redis** database (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- A **Firebase** project with Google Auth enabled

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/N-PCs/dsc-hackathon.git
cd dsc-hackathon

# Install root, frontend, and backend packages
npm install
npm --prefix frontend install
npm --prefix backend install
```

---

### 2. Configure Environment Variables

Create `.env` in the root directory (and copy to `backend/.env` & `frontend/.env.local`):

```env
#  Neon PostgreSQL Database
DATABASE_URL=postgresql://neondb_owner:password@ep-host.aws.neon.tech/neondb?sslmode=require

#  AWS S3 Storage (PPT Submissions & Receipts)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=dsc-hackathon-storage

//here add the email for jury memebers 
JURY_ALLOWED_EMAILS=jury2@domain.org,judge@hackathon.com

#  Google Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

#  Upstash Redis Cache
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

#  Service Routing (Production)
NEXT_PUBLIC_BACKEND_URL=https://backend-git-master-n-pcs-projects.vercel.app
```

---

### 3. Start Development Server

Run both Next.js frontend and Express backend concurrently:

```bash
npm run dev
```

* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:4000`
* **API Health Check**: `http://localhost:4000/api/health`

---

### 4. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both frontend and backend concurrently with colored logs |
| `npm run dev:frontend` | Starts Next.js frontend dev server (`localhost:3000`) |
| `npm run dev:backend` | Starts Express backend server with `tsx` hot-reloading (`localhost:4000`) |
| `npm run build` | Builds the frontend for production deployment |
| `npm run backend:build` | Bundles the backend using `esbuild` to `dist/server.cjs` |
| `npm run lint` | Typechecks and lints both frontend and backend |

---

## Production Deployment on Vercel

### Backend Project Setup
1. In the [Vercel Dashboard](https://vercel.com/dashboard), open your **Backend Project** (`backend`).
2. Go to **Settings** $\rightarrow$ **General**:
   - **Root Directory**: Set to **`backend`** (Click Edit $\rightarrow$ type `backend` $\rightarrow$ Save).
   - **Framework Preset**: Set to **`Other`** (Do *not* select Next.js).
3. Go to **Settings** $\rightarrow$ **Environment Variables** and add:
   - `DATABASE_URL`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
4. Click **Deployments** $\rightarrow$ **Redeploy**.

### Frontend Project Setup
1. Open your **Frontend Project** (`dsc-hackathon`).
2. Go to **Settings** $\rightarrow$ **General**:
   - **Root Directory**: Set to **`frontend`**.
   - **Framework Preset**: **Next.js** (auto-detected).
3. Add Environment Variables:
   - `NEXT_PUBLIC_BACKEND_URL` $\rightarrow$ `https://your-backend-url.vercel.app`
   - `NEXT_PUBLIC_FIREBASE_*` variables.
4. Click **Redeploy**.

---

## Contributing

We welcome contributions! Please feel free to open Issues or pull requests.

<div align="center">

<a href="https://github.com/N-PCs/dsc-hackathon/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=N-PCs/dsc-hackathon" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

</div>

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
