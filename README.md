# 🏆 Origin Hackathon Portal

<div align="center">

![React](https://img.shields.io/badge/React-19-333333?style=for-the-badge&logo=react&logoColor=black&labelColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-333333?style=for-the-badge&logo=typescript&logoColor=white&labelColor=3178C6)
![Vite](https://img.shields.io/badge/Vite-6.0-333333?style=for-the-badge&logo=vite&logoColor=white&labelColor=646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-333333?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=06B6D4)
![Neon](https://img.shields.io/badge/Neon-Postgres-333333?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=00E599)
![Clerk](https://img.shields.io/badge/Clerk-Auth-333333?style=for-the-badge&logo=clerk&logoColor=white&labelColor=6C47FF)
![ImageKit](https://img.shields.io/badge/ImageKit-Upload-333333?style=for-the-badge&logo=imagekit&logoColor=white&labelColor=1A1A1A)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-333333?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000)

<br />

A production-grade, highly scalable hackathon management portal built for **Origin Hackathon** (Data Science Club). Built with React 19 + TypeScript on the frontend and Express + Neon Serverless PostgreSQL on the backend, featuring strict binary magic-byte file signature validation, UTR duplicate prevention, whitelisted admin OTP authentication, dual-gated project submissions, live organizer broadcasts, and CSV/Excel exports.

</div>

---

## 🌟 Key Features

- **Team Registration & Validation** — Register teams with up to 5 members across 6 hackathon tracks. Features strict duplicate leader email detection and unique UTR/transaction reference enforcement.
- **Binary Signature File Uploads** — Secure uploading via ImageKit with client-side and server-side magic-byte binary signature inspection (JPEG, PNG, WEBP, GIF, PDF, PPTX up to 10MB).
- **Team Access & Pass Portal** — Unique `ORIGIN-XXXX` ID generation with 4-digit security PIN. Event passes and submission features unlock dynamically once payment status is marked `verified` by organizers.
- **Whitelisted Admin OTP Command Hub** — Secure passcode verification restricted strictly to authorized organizer email addresses. Complete dashboard for checking venue attendance, reviewing payment proofs, and whitelist management.
- **Dual-Gated Project Submissions** — Project submissions require **(1)** verified team status, **(2)** active global submissions window toggle, and **(3)** submission before the official hackathon deadline.
- **Jury Evaluation & Scoring System** — Multi-criteria evaluation rubric (Innovation, Technical Complexity, UI/UX, Presentation, Impact - max 50 points) with automated total calculation and feedback recording.
- **Live Broadcasts & Announcements** — Real-time top notification banner and alert feed for organizer announcements.
- **Data Export & Reporting** — One-click export of complete hackathon registration datasets into CSV and native Excel (`.xlsx`) formats.

---

## 🏗️ System Architecture & Scale Workflow

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 19 + Vite + Tailwind v4)"]
        A["Team Registration Form"]
        B["Team Login (ID / Email + 4-Digit PIN)"]
        C["Admin Command Hub"]
        D["Project Submission Modal"]
    end

    subgraph Security ["Validation & Security Gate"]
        E{"Binary Signature Check (Magic Bytes)"}
        F{"Unique UTR & Email Check"}
        G{"Whitelisted Admin Email Check"}
        H{"Submissions Gate (Deadline + Admin Toggle + Payment Status)"}
    end

    subgraph Backend ["Backend API Layer (Express + Vercel Serverless)"]
        I["/api/teams/register"]
        J["/api/upload (ImageKit API Integration)"]
        K["/api/admin/auth/request-otp & verify-otp"]
        L["/api/teams/:id/project"]
        M["/api/admin/submissions-toggle"]
        N["/api/teams/:id/score"]
        O["/api/export-csv & /api/export-excel"]
    end

    subgraph Data ["Persistence & Storage Layer"]
        P[("Neon Serverless PostgreSQL DB")]
        Q["ImageKit Cloud Media CDN"]
        R[("In-Memory Local Fallback Store")]
    end

    %% Registration Flow
    A -->|"1. Submit Team & Payment Details"| E
    E -->|"Valid Magic Bytes"| F
    F -->|"Unique UTR & Email"| I
    I -->|"Insert Team Record (Pending Status)"| P
    I -->|"Fallback if DB Offline"| R
    A -->|"Attach Proof (Image/PDF/PPT)"| J
    J -->|"Upload Buffer"| Q
    Q -->|"Return Hosted Media URL"| I

    %% Team Access Flow
    B -->|"2. Enter ID/Email + PIN"| P
    P -->|"Return Team State & Pass Access"| B

    %% Admin Flow
    C -->|"3. Request Access Passcode"| G
    G -->|"Whitelisted Admin Email"| K
    K -->|"Generate & Verify 6-Digit OTP"| C
    C -->|"Verify Payment & Unlock Pass"| P
    C -->|"Global Submissions Toggle"| M
    M -->|"Update Settings Table"| P
    C -->|"Score Projects & Post Broadcasts"| N
    C -->|"Export Dataset"| O

    %% Project Submission Flow
    D -->|"4. Submit GitHub Repo & Slide Deck"| H
    H -->|"Verified & Window Open & In Deadline"| L
    L -->|"Update Team Project Payload"| P

    %% Styling
    classDef client fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef security fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef backend fill:#18181b,stroke:#f97316,stroke-width:2px,color:#fff;
    classDef data fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;

    class A,B,C,D client;
    class E,F,G,H security;
    class I,J,K,L,M,N,O backend;
    class P,Q,R data;
```

---

## 📡 API Endpoint Reference

| Endpoint | Method | Gating / Auth | Purpose |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | Public | System status and timestamp |
| `/api/stats` | `GET` | Public | Aggregated hackathon metrics and track breakdown |
| `/api/teams` | `GET` | Public | Fetch team listing |
| `/api/teams/:id` | `GET` | Public | Fetch team profile by ID or email |
| `/api/teams/register` | `POST` | Signature & UTR | Register team, validate UTR & upload payment proof |
| `/api/auth/team-login` | `POST` | PIN Code | Authenticate team access with PIN |
| `/api/teams/:id/project` | `PUT` | Dual Lock | Submit project details (Verified + Toggle Open + Deadline) |
| `/api/teams/:id/status` | `PATCH` | Admin | Update payment verification, check-in, & ticket status |
| `/api/teams/:id/score` | `POST` | Admin / Jury | Submit 5-criteria project score and feedback |
| `/api/admin/auth/request-otp` | `POST` | Whitelist | Dispatch OTP to authorized admin email |
| `/api/admin/auth/verify-otp` | `POST` | Whitelist | Verify admin OTP code |
| `/api/admin/whitelist` | `GET / POST / DELETE` | Admin | View, add, or remove whitelisted admins |
| `/api/admin/submissions-toggle` | `POST` | Admin | Open or close global project submissions window |
| `/api/announcements` | `GET / POST` | Public / Admin | Fetch feed or broadcast live announcements |
| `/api/export-csv` | `GET` | Admin | Download registrations as CSV file |
| `/api/export-excel` | `GET` | Admin | Download registrations as Excel (`.xlsx`) file |
| `/api/upload` | `POST` | Signature Check | Multipart or Base64 media upload to ImageKit CDN |

---

## 📁 Repository Structure

```
DSC-Hackathon/
├── api/
│   └── index.ts            # Vercel serverless Express API handler
├── server/
│   ├── db.ts               # Neon PostgreSQL queries & schema initialization
│   └── imagekit.ts         # ImageKit SDK & REST upload adapter
├── src/
│   ├── components/         # Navigation, RegistrationForm, ProjectSubmissionModal, AdminPortal
│   ├── lib/                # fileValidation (magic bytes), deadline, clerk auth
│   ├── types.ts            # TypeScript definitions (Team, Project, Score, AdminUser)
│   ├── App.tsx             # Root layout & page router
│   └── main.tsx            # Application entrypoint
├── server.ts               # Dev server & Vite middleware bootstrap
├── vercel.json             # Vercel deployment routes & serverless config
├── package.json            # Dependencies & build scripts
└── README.md               # Project documentation & architecture diagram
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/) | Modern UI component hierarchy |
| **Build & Dev** | [Vite 6](https://vite.dev/) | Ultra-fast HMR and bundle optimization |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS | High-contrast dark comic book theme |
| **Backend** | [Express 4](https://expressjs.com/) | RESTful API routes & serverless function core |
| **Database** | [Neon Postgres](https://neon.tech/) | Serverless PostgreSQL database |
| **Media Storage** | [ImageKit CDN](https://imagekit.io/) | Cloud media upload, signature verification, & hosting |
| **Authentication** | [Clerk Auth](https://clerk.com/) + Internal Admin OTP | Identity management & whitelisted OTP auth |
| **Deployment** | [Vercel](https://vercel.com/) | Continuous integration & serverless hosting |

---

## ⚡ Local Setup & Run

### Prerequisites
- **Node.js**: v20.x or higher
- **npm** or **pnpm**

### 1. Installation
```bash
git clone <repository-url>
cd DSC-Hackathon
npm install
```

### 2. Configure Environment (`.env`)
Create a `.env` file in the root directory:

```env
# Neon Database Connection
DATABASE_URL=postgresql://user:password@ep-instance.neon.tech/neondb?sslmode=require

# ImageKit Integration
IMAGEKIT_PUBLIC_KEY=public_key_here
IMAGEKIT_PRIVATE_KEY=private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

# Clerk Authentication (Optional / Configured)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_clerk_key
CLERK_SECRET_KEY=sk_test_clerk_key
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start at `http://localhost:3000`.

### 4. Code Quality & Type Checks
```bash
npm run lint
```

---

## 📄 License

Licensed under the [MIT License](LICENSE). Built for **Origin Hackathon** by **Data Science Club (DSC)**.

