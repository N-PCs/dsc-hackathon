# Origin Hackathon Portal

(React, TypeScript, Vite, Tailwind CSS, Neon PostgreSQL, Clerk, Imagekit)

## Intro

The **Origin Hackathon Portal** is a full-stack web application designed to streamline hackathon team registration, payment verification, project submissions, and admin management. Built with a modern React + TypeScript frontend and an Express + TypeScript backend connected to Neon PostgreSQL, the platform manages the entire hackathon lifecycle from team registration through to project submission and admin verification.

## Features

- **Team Registration** - Teams register with leader details, access codes, and payment proof uploads
- **Payment Proof Upload** - Secure image uploads via Imagekit (replaces Cloudinary) with 10MB limit
- **Admin Verification** - Admin dashboard to verify payments, assign scores, issue tickets, and manage teams
- **Project Submission** - Gated project submission requiring prior admin payment verification
- **CSV/Excel Export** - Export team data with project details and scores
- **Clerk Authentication** - User authentication with publishable/subject keys
- **Responsive UI** - Modern dark-themed interface built with TailwindCSS v4

## Project Structure

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
├── .env                     # Environment variables (DATABASE_URL, Clerk, Imagekit)
├── package.json             # Dependencies and scripts
└── vite.config.ts          # Vite + React + Tailwind configuration
```

## Workflow Diagram (Mermaid)

```mermaid
flowchart TD
    %% === REGISTRATION FLOW ===
    A[Team Registration] --> B[Payment Screenshot Upload]
    B -->|/api/upload→Imagekit| C[URL Stored in DB]
    C --> D[Status: pending_verification]
    D --> E[Admin Review]
    E -->|Verify| F[Payment Status: verified]
    F --> G[Project Submission Portal Unlocks]
    E -->|Reject| H[Status: rejected]

    %% === PROJECT SUBMISSION FLOW ===
    G --> I[Project Details Upload]
    I -->|/api/upload→Imagekit| J[Presentation URL Stored]
    J --> K[Project Submitted]

    %% === ADMIN ACTIONS FLOW ===
    L[Admin Login (Clerk OTP)] --> M[Admin Dashboard]
    M --> N[Verify Teams]
    N --> O[Update Payment Status]
    O --> P[Issue Team Pass/Ticket]
    P --> Q[Project Scoring]
    Q --> R[Export CSV/Excel]

    %% === USER FLOWS ===
    S[Team Login (Clerk)] --> T[Access Team Portal]
    T --> U[View Payment Status]
    U -->|verified| V[Submit Project]
    U -->|pending| W[Upload Payment Proof]

    style A fill:#1f1f23,color:#fff
    style B fill:#1f1f23,color:#fff
    style C fill:#1f1f23,color:#fff
    style D fill:#1f1f23,color:#fff
    style E fill:#1f1f23,color:#fff
    style F fill:#1f1f23,color:#fff
    style G fill:#1f1f23,color:#fff
    style H fill:#1f1f23,color:#fff
    style I fill:#1f1f23,color:#fff
    style J fill:#1f1f23,color:#fff
    style K fill:#1f1f23,color:#fff
    style L fill:#1f1f23,color:#fff
    style M fill:#1f1f23,color:#fff
    style N fill:#1f1f23,color:#fff
    style O fill:#1f1f23,color:#fff
    style P fill:#1f1f23,color:#fff
    style Q fill:#1f1f23,color:#fff
    style R fill:#1f1f23,color:#fff
    style S fill:#1f1f23,color:#fff
    style T fill:#1f1f23,color:#fff
    style U fill:#1f1f23,color:#fff
    style V fill:#1f1f23,color:#fff
    style W fill:#1f1f23,color:#fff
    style X fill:#1f1f23,color:#fff

    %% Legend
    classDef process fill:#1f1f23,color:#fff,stroke:#2d3748,stroke-width:2px;
    classDef decision fill:#2d3748,color:#fff,stroke:#ed8936,stroke-width:2px;
```

## Installation/Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DSC-Hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root:
   ```
   # Neon PostgreSQL
   DATABASE_URL=postgresql://neondb_owner:npg_ClnP8bq9TUHR@ep-steep-mountain-azf2xygj-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

   # Clerk Auth
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2VydGFpbi1oYWdmaXNoLTM1MjEuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_SECRET_KEY=sk_test_ecdPI8ddCuFuphB7I2zi0bdIpCoqea4QXDDaS2smBF

   # ImageKit (for payment screenshot & PPT/PDF uploads)
   IMAGEKIT_PUBLIC_KEY=public_UWocicRiLtjbi1VLmdrFw0qbaq0=
   IMAGEKIT_PRIVATE_KEY=private_uQ/E+54c4PydINKr3Y5oNfZxxro=
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/rb73qhihk
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

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
- Node.js 20.x runtime for the server function
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