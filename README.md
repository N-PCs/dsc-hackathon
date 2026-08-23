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

A full-stack hackathon portal for managing team registrations, payment verification, project submission, and admin review. Built with React + TypeScript on the frontend and Express + Neon/Postgres on the backend, with Clerk authentication and ImageKit uploads for secure flow handling.

**Live →** [Your Vercel Deployment](https://your-project.vercel.app)

</div>

---

## Key Features

- **Team Registration** — Create team profiles with lead details, member info, access codes, and payment proof upload.
- **Payment Verification Workflow** — Admin can review payment screenshots, verify or reject, and unlock access to submission features.
- **Project Submission Portal** — Verified teams can submit project details, links, and media assets (PPT/PDF up to 10MB) when submissions are unlocked by organizers.
- **Admin Submissions Gate** — Organizers can globally open or close project submissions directly from the Admin Panel with a single toggle.
- **Admin Dashboard** — Manage registration status, issue tickets, toggle submission window, assign scores, and export team records.
- **Secure Auth & Storage** — Clerk handles authentication, while image uploads are stored through ImageKit and DB records keep the project state structured.
- **Responsive Hackathon UI** — Dark, modern interface built with TailwindCSS v4 to support event operations on desktop and mobile.

---

## Workflow Diagram

```mermaid
flowchart TD
    A[Team Registration] --> B[Payment Screenshot Upload]
    B -->|/api/upload→Imagekit| C[URL Stored in DB]
    C --> D[Status: pending_verification]
    D --> E[Admin Review]
    E -->|Verify| F[Payment Status: verified]
    F --> G[Project Submission Portal Unlocks]
    E -->|Reject| H[Status: rejected]

    G --> I[Project Details Upload]
    I -->|/api/upload→Imagekit| J[Presentation URL Stored]
    J --> K[Project Submitted]

    L[Admin Login (Clerk)] --> M[Admin Dashboard]
    M --> N[Verify Teams]
    N --> O[Update Payment Status]
    O --> P[Issue Team Pass/Ticket]
    P --> Q[Project Scoring]
    Q --> R[Export CSV/Excel]

    S[Team Login (Clerk)] --> T[Access Team Portal]
    T --> U[View Payment Status]
    U -->|verified| V[Submit Project]
    U -->|pending| W[Upload Payment Proof]

    classDef dark fill:#1f1f23,color:#fff,stroke:#2d3748,stroke-width:2px;
    class A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W dark;
```

---

## Repository Structure

```
DSC-Hackathon/
├── server/                  # Express + TypeScript backend
│   ├── imagekit.ts         # Imagekit upload configuration & API
│   ├── db.ts               # Neon Database operations
│   └── server.ts           # Main server with all API routes
├── src/                     # React + TypeScript frontend
│   ├── components/         # RegistrationForm, ProjectSubmissionModal, AdminPortal
│   ├── types.ts            # TypeScript interfaces (Team, ProjectSubmission, etc.)
│   ├── lib/                # Utility functions
│   └── data/               # mockData.ts with sample data
├── .env.example            # Environment vars template
├── package.json            # Dependencies and scripts
├── vercel.json             # Vercel runtime and routing config
├── vite.config.ts         # Vite + React + Tailwind configuration
├── README.md              # Project overview and setup docs
└── server.ts              # App bootstrap and route server
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | App UI and client logic |
| Build Tool | [Vite](https://vite.dev/) | Fast local development and production builds |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | Modern responsive design system |
| Backend | [Express](https://expressjs.com/) | API server and route handling |
| Database | [Neon Postgres](https://neon.tech/) | Serverless SQL database |
| Auth | [Clerk](https://clerk.com/) | Team and admin authentication |
| Uploads | [ImageKit](https://imagekit.io/) | Secure image upload and URL storage |
| Hosting | [Vercel](https://vercel.com/) | Deployment platform |

---

## Installation / Setup

### Prerequisites

- Node.js 24+
- npm or pnpm
- Neon Postgres database
- Clerk account
- ImageKit account

### 1. Clone & Install

```bash
git clone <repository-url>
cd DSC-Hackathon
npm install
```

### 2. Configure Environment

Create a `.env` file in the root and add:

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://your_user:your_password@ep-your-instance.neon.tech/neondb?sslmode=require

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=private_your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_url_endpoint
```

### 3. Run the app

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
```

---

## Vercel Deployment

This project is configured for seamless deployment on Vercel. The platform automatically detects the `vercel.json` configuration and handles the Node.js server execution.

### Prerequisites
- Vercel account
- Neon PostgreSQL database (already configured)
- Imagekit account with API keys (already configured in `.env`)
- Clerk account with public/secret keys (already configured in `.env`)

### Deployment Steps
1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Connect your repository to Vercel
3. Vercel will automatically detect the `vercel.json` configuration
4. Set environment variables in the Vercel dashboard:
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `IMAGEKIT_PUBLIC_KEY` - Imagekit public key
   - `IMAGEKIT_PRIVATE_KEY` - Imagekit private key
   - `IMAGEKIT_URL_ENDPOINT` - Imagekit URL endpoint (`https://ik.imagekit.io/rb73qhihk`)
5. Deploy - Vercel will run `npm run build` then start the Node.js server

### Local Development vs Production
- **Local**: `npm run dev` (uses `tsx server.ts` for hot reloading, loads `.env` via `dotenv/config`)
- **Production/Vercel**: Uses `dist/server.cjs` built with esbuild

### Vercel Configuration
The `vercel.json` file configures:
- Node.js 24.x runtime for the server function
- Route rewriting from `/*` to `dist/server.cjs`
- Security headers (X-Content-Type-Options, X-Frame-Options)

For manual Vercel CLI deployment:
```bash
vercel
vercel --prod
```

## Project Cost Structure / Limits

| Feature | Limit/Details |
|---------|--------------|
| **File Upload Size** | 10MB maximum per file (enforced in Multer + Imagekit) |
| **Storage** | Imagekit cloud storage (free tier: 20GB bandwidth, 20GB monthly storage) |
| **Database** | Neon PostgreSQL serverless (pay-per-query model) |
| **Auth** | Clerk free tier (up to 5,000 monthly active users) |
| **Resource Types** | `image` for screenshots, `raw` for PDFs/PPTs |
| **Concurrent Users** | Development mode: unlimited; Production: depends on plan |

## Contributors

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## MIT License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.