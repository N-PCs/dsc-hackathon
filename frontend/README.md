# 🚀 ORIGIN '26 — Frontend Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Amazon S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Vercel](https://img.shields.io/badge/Vercel_Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

**Origin '26** is the web platform for the Data Science Club's (VIT Bhopal University) flagship 18‑hour overnight hackathon. It is a **Next.js 16 (App Router) frontend** that handles the entire participant lifecycle — marketing/landing page, team registration, payment-proof upload, digital ID pass, project submission, jury evaluation, and an admin command console — talking to a **separate backend API** over `/api/*`.

This document explains the full architecture: how the pieces fit together, why they're structured this way, the three independent auth systems, the data flow, and things to watch out for.

---

## 1. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, route groups) | Everything is `"use client"` — this is effectively a CSR app that happens to run on Next.js routing |
| UI | **React 19** + **Tailwind CSS v4** | Dark theme, orange (`#FF3B00`) accent, "black card + hairline border" visual language |
| Auth (Admin) | **Clerk** (`@clerk/nextjs`) | Google/email sign-in, gated by an email whitelist |
| Animation | **GSAP**, **Lenis** (smooth scroll), **motion** (Framer Motion successor), **canvas-confetti** | Loading screen, section reveals, particle background |
| File uploads | **ImageKit** (via a client helper + `/api/upload`) | Payment screenshots, PPT/PDF pitch decks |
| Spreadsheet export | **xlsx** | Admin "Export Excel" |
| Icons | **lucide-react** | |
| Fonts | Bebas Neue, Oswald, Space Grotesk, Inter, JetBrains Mono | Loaded via `next/font/google`, exposed as CSS variables |

> **Important:** This repo is **frontend-only**. There is no `app/api/` folder — `next.config.ts` **rewrites** every `/api/*` request to an external backend:
> ```ts
> destination: process.env.NODE_ENV === "production"
>   ? "https://your-backend-url.com/api/:path*"   // placeholder — must be replaced
>   : "http://localhost:4000/api/:path*"
> ```
> So this codebase is meaningless without a backend running on port `4000` (dev) or a real deployed API (prod) that implements every endpoint referenced below. UI text also references **Neon DB** ("Registration details saved to Neon DB") — confirming a Postgres-on-Neon backend, though its code isn't in this repo.

---

## 2. High-Level Architecture Diagram (conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                        │
│                                                                   │
│  app/layout.tsx (ClerkProvider, fonts)                          │
│   └── AppShell (LoadingScreen, BackgroundVeins, Navbar, Footer) │
│        └── app/(routes)/*/page.tsx  (all "use client")          │
│             └── components/**                                   │
│                                                                   │
│  hooks/useTeams.ts  ── polls every 5s ──►  /api/teams            │
│                                             /api/announcements   │
│                                             /api/stats           │
│                                                                   │
│  localStorage:                                                   │
│    origin_active_team_id / _data   (team session)                │
│    origin_active_admin             (admin session)                │
│    origin_admin_whitelist          (cached admin list)            │
│    origin_jury_auth                (jury passcode flag)           │
└──────────────────────────┬────────────────────────────────────┘
                            │ fetch("/api/...")
                            ▼  (Next.js rewrite, see next.config.ts)
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL BACKEND (not in this repo)                │
│   Express/Node (assumed) + Neon Postgres + ImageKit               │
│   Auth endpoints, team CRUD, scoring, announcements, exports       │
└─────────────────────────────────────────────────────────────────┘
```

The **entire app is client-rendered**. There is no server component doing data fetching, no server actions, no route handlers. This is a deliberate (if slightly unusual for Next.js 16) choice — likely because the team wanted a single SPA-like experience with `localStorage`-backed sessions and polling, ported into Next.js mainly for routing/build tooling.

---

## 3. Folder Structure & What Lives Where

```
app/
  (routes)/                  # Route group — doesn't affect the URL path
    admin/page.tsx           # /admin  → AdminPortal (Clerk-gated)
    faq/page.tsx              # /faq    → FAQSection
    jury/page.tsx             # /jury   → JuryPortal (passcode-gated)
    register/page.tsx         # /register → RegistrationForm
    schedule/page.tsx         # /schedule → HackathonScheduleRules + SponsorsSection
    submit/page.tsx           # /submit → ProjectSubmissionModal
    team/page.tsx             # /team   → TeamPassTicket
    layout.tsx                # pass-through layout for the route group
    page.tsx                  # /  → HeroSection + Schedule + FAQ (homepage)
  components/
    admin/AdminPortal.tsx     # Full admin console (auth, teams, submissions, leaderboard, broadcast, whitelist)
    jury/JuryPortal.tsx       # Jury evaluation console
    layout/                   # Navbar, Footer, AppShell, LoadingScreen, BackgroundVeins, AnnouncementBanner
    sections/                 # Marketing sections: Hero, Prizes, Sponsors, Schedule/Rules, FAQ
    team/                     # RegistrationForm, TeamLoginModal, TeamPassTicket, ProjectSubmissionModal
    index.ts                  # Barrel re-export of all components
  globals.css                 # Design tokens, Clerk UI overrides, utility classes (.btn-primary, .tape-strip…)
  layout.tsx                  # Root layout: fonts, <ClerkProvider>, <AppShell>
data/
  mockData.ts                 # Static content: tracks, rules, schedule, FAQ text, DEFAULT_SUBMISSION_DEADLINE, Google Form URL
hooks/
  useTeams.ts                  # Central data hook: polling, team/announcement/stat state, localStorage sync
lib/
  clerk.ts                     # isVITBhopalEmail() — domain allowlist check for @vitbhopal.ac.in
  deadline.ts                   # getSubmissionDeadline(), isDeadlinePassed() — has its OWN default deadline (see §8)
  fileValidation.ts             # Magic-byte signature checks (PDF/JPEG/PNG) for uploaded files
  imagekitClient.ts             # Client-side upload orchestration (compress → /api/upload → base64 fallback)
public/                         # Logos, sponsor images, QR code for payments
types/index.ts                  # All shared TypeScript interfaces (Team, ProjectSubmission, AdminUser, etc.)
```

---

## 4. Routing Model

Next.js's **route groups** (`(routes)`) are used purely for organization — the parentheses mean the folder name is *not* part of the URL. So:

| File | URL |
|---|---|
| `app/(routes)/page.tsx` | `/` |
| `app/(routes)/register/page.tsx` | `/register` |
| `app/(routes)/team/page.tsx` | `/team` |
| `app/(routes)/submit/page.tsx` | `/submit` |
| `app/(routes)/schedule/page.tsx` | `/schedule` |
| `app/(routes)/faq/page.tsx` | `/faq` |
| `app/(routes)/admin/page.tsx` | `/admin` |
| `app/(routes)/jury/page.tsx` | `/jury` |

Every page is a **thin wrapper**: it pulls state from `useTeams()`, defines a handful of `fetch`-based callback handlers (POST/PATCH/DELETE against `/api/...`), and passes everything down as props into one big presentational component (`RegistrationForm`, `AdminPortal`, etc.). This keeps all business logic and JSX inside `app/components/**`, while `app/(routes)/**` stays a pure routing/wiring layer.

One inconsistency worth knowing: `app/(routes)/jury/page.tsx` defines its own **stub** `handleScoreProject` (`// implement`, does nothing) instead of wiring up a real POST — while `AdminPortal`'s scoring flow (`admin/page.tsx`) is fully implemented and hits `/api/teams/{id}/score`. If jury scoring is expected to work from `/jury`, this needs to be fixed.

---

## 5. Data Flow — `useTeams()`

This hook is the single source of truth for dynamic data across the whole app.

```ts
const { teams, announcements, stats, activeTeam, setActiveTeam, refreshData } = useTeams();
```

**What it does:**
1. On mount, and then every **5 seconds** (`setInterval`), it fires three parallel `fetch` calls:
   - `GET /api/teams` → `Team[]`
   - `GET /api/announcements` → `Announcement[]`
   - `GET /api/stats` → `HackathonStats`
2. After refreshing `teams`, it re-syncs `activeTeam` by looking up the locally-remembered team ID (`origin_active_team_id`) inside the freshly-fetched list — this means a team's local session data (payment status, check-in, submission) **self-heals** to match the backend on every poll, without the user needing to re-login.
3. `activeTeam` is mirrored into `localStorage` (`origin_active_team_id`, `origin_active_team_data`) any time it changes, so a page refresh (e.g. `/team` → `/submit`) survives.

**Why polling instead of websockets/SSE?** Given the announcement banner and live leaderboard/admin panels, this is a "good enough" real-time approximation for a single overnight event with a bounded number of teams — simpler to build/host than a socket server.

**Consumers:**
- `AppShell` → drives the `Navbar`, `Footer`, and `LiveAnnouncementsBanner`
- `app/(routes)/page.tsx` (home) → `stats` for hero counters
- `app/(routes)/register/page.tsx` → `setActiveTeam` after successful registration
- `app/(routes)/team/page.tsx`, `submit/page.tsx` → `activeTeam`
- `app/(routes)/admin/page.tsx`, `jury/page.tsx` → `teams`, `announcements`, `refreshData`

---

## 6. The Three Independent Auth Systems

This is the most important architectural quirk to understand: **there is no unified auth layer.** Three completely separate systems coexist:

### 6.1 Team Auth (participants)
- **Mechanism:** Enter a "Team ID" (e.g. `ORIGIN-101`) or the leader's email in `TeamLoginModal` → `POST /api/auth/team-login` → backend returns the matching `Team` object.
- **Session storage:** `localStorage["origin_active_team_id"]` + `["origin_active_team_data"]`, managed inside `useTeams()`.
- **No password.** Anyone who knows/guesses a Team ID or leader email can "log in" as that team. This is intentionally low-friction for a hackathon but is **not secure** — worth flagging if real payment/PII data is involved.
- **Where used:** `TeamPassTicket` (digital pass, roster, and embeds `ProjectSubmissionModal`), `ProjectSubmissionModal` standalone at `/submit`.

### 6.2 Admin Auth (organizers)
- **Mechanism:** Clerk `<SignIn>` (Google/email/etc.) authenticates the *browser session*, but that alone isn't sufficient — `AdminPortal` then checks `clerkUser.primaryEmailAddress` against an **admin whitelist**:
  1. First checks the whitelist already in React state (seeded from `DEFAULT_AUTHORIZED_ADMINS` hardcoded in the component, or overridden by `localStorage["origin_admin_whitelist"]`).
  2. On mount, also fetches `GET /api/admin/whitelist` to refresh the list from the backend.
  3. If the signed-in Clerk email isn't found locally, it calls `POST /api/admin/auth/verify-clerk-user` as a fallback check.
  4. If none of that matches → "ACCESS DENIED" screen with a **Sign Out of Clerk** button (so they can try a different Google account).
- There's also a **dormant OTP flow** (`authStep`, `otpInput`, `handleVerifyOtp`, `/api/admin/auth/verify-otp`) that appears to be legacy/parallel to the Clerk flow — it's coded but the UI never actually surfaces the OTP form (the component only renders the "not authenticated" branch via Clerk's `<SignIn>` or the whitelist-mismatch screen). This looks like an earlier auth mechanism that was partially replaced by Clerk without being deleted.
- **Session storage:** once resolved, the matched `AdminUser` is cached in `localStorage["origin_active_admin"]` and reused on reload (this is also how `app/(routes)/admin/page.tsx` builds the `x-admin-email` header for every mutating API call — see §7).
- **Default whitelist** (hardcoded fallback, real source of truth is the backend):
  ```
  neelpandeyofficial@gmail.com     – Superadmin
  dsc.vitbhopal@gmail.com          – Lead Organizer
  admin@vitbhopal.ac.in            – Superadmin
  lead.origin@vitbhopal.ac.in      – Lead Organizer
  faculty.advisor@vitbhopal.ac.in  – Faculty Advisor
  jury.chair@origin.org            – Jury Chair
  ```

### 6.3 Jury Auth (judges)
- **Mechanism:** A single **hardcoded passcode**, `JURY_PASSCODE = "JURY2026"`, checked client-side in `JuryPortal.tsx`. No backend call, no per-person identity.
- **Session storage:** boolean flag `localStorage["origin_jury_auth"] = "true"`.
- Because the passcode is shipped in the JS bundle, **anyone can read it from devtools** — acceptable only because jury access is "view submissions + write a score," not sensitive data, and the event is time-boxed.

> **Design takeaway:** registration/payment data uses a real backend + database, but the three "who are you" layers range from "no password" (team) → "shared secret in client code" (jury) → "real SSO + whitelist" (admin). If this were hardened for production, Team and Jury auth would be the first things to move server-side (e.g. one-time magic links, per-judge tokens).

---

## 7. Backend API Surface (inferred from every `fetch()` call in the frontend)

Since there's no backend code here, this table is the *de facto contract* the backend must implement:

| Method | Path | Used by | Purpose |
|---|---|---|---|
| GET | `/api/teams` | `useTeams` | List all teams |
| GET | `/api/announcements` | `useTeams` | List announcements (newest first) |
| GET | `/api/stats` | `useTeams` | Aggregate dashboard stats |
| POST | `/api/teams/register` | `RegistrationForm` | Create a team |
| POST | `/api/auth/team-login` | `TeamLoginModal` | Resolve Team ID/email → `Team` |
| PUT | `/api/teams/{id}/project` | `ProjectSubmissionModal` | Create/update a project submission |
| PATCH | `/api/teams/{id}/status` | `admin/page.tsx` | Update payment/check-in/ticket/notes |
| POST | `/api/teams/{id}/score` | `admin/page.tsx`, (stubbed in `jury/page.tsx`) | Save jury rubric score |
| DELETE | `/api/teams/{id}` | `admin/page.tsx` | Delete a team |
| POST | `/api/announcements` | `admin/page.tsx` | Broadcast a new announcement |
| GET | `/api/admin/submissions-status` | `AdminPortal`, `ProjectSubmissionModal` | Whether submissions are open + deadline + `isDeadlinePassed` |
| POST | `/api/admin/submissions-toggle` | `AdminPortal` | Open/close submissions |
| GET | `/api/admin/registrations-status` | `AdminPortal`, `RegistrationForm` | Whether registrations are open |
| POST | `/api/admin/registrations-toggle` | `AdminPortal` | Open/close registrations |
| POST | `/api/admin/clear-database` | `AdminPortal` | **Destructive** — wipes all teams/submissions/announcements |
| GET | `/api/admin/whitelist` | `AdminPortal` | Fetch authorized admin list |
| POST | `/api/admin/whitelist` | `AdminPortal` | Add an admin |
| DELETE | `/api/admin/whitelist/{email}` | `AdminPortal` | Revoke an admin |
| POST | `/api/admin/auth/verify-clerk-user` | `AdminPortal` | Backend-side whitelist check for a Clerk email |
| POST | `/api/admin/auth/verify-otp` | `AdminPortal` (legacy path) | OTP verification (see §6.2) |
| GET | `/api/export-excel` | `AdminPortal` | Download `.xlsx` of teams (opened via `window.open`) |
| GET | `/api/export-csv` | `AdminPortal` | Download `.csv` of teams |
| POST | `/api/upload` | `imagekitClient.ts`, `ProjectSubmissionModal` | Upload a file (multipart, JSON base64, or fallback) to ImageKit |

**Auth header convention:** every admin-mutating call attaches `x-admin-email: <currentAdmin.email>` (built in `app/(routes)/admin/page.tsx`'s `getAdminHeaders()`); the backend is expected to re-validate this against the whitelist server-side (client-side gating alone is not a security boundary).

---

## 8. Domain Model (`types/index.ts`)

```
Team
 ├─ id, teamName, accessCode, track
 ├─ leader: TeamMember              (required)
 ├─ member2..member5?: TeamMember   (optional, based on team size 2–5)
 ├─ paymentStatus: "pending" | "verified" | "rejected"
 ├─ paymentProofUrl?, transactionRef, amountPaid?
 ├─ checkedInVenue, ticketIssued
 ├─ project?: ProjectSubmission
 └─ notes?

TeamMember
 ├─ name, email, phone, role?, college?
 ├─ registrationNumber?
 ├─ residentialStatus?: "Hosteller" | "Day Scholar"
 └─ messName?

ProjectSubmission
 ├─ title, tagline, problemStatement, solutionDescription
 ├─ track, techStack[]
 ├─ githubUrl, deploymentUrl?, presentationUrl?, videoUrl?
 └─ score?: { innovation, technicalComplexity, uiUx, presentation, impact, feedback?, total }

Announcement
 └─ id, title, message, category, timestamp, sender

AdminUser
 └─ email, name, role, department?, addedAt?
```

**Scoring rubric** (used identically in both `AdminPortal` and `JuryPortal`): 5 categories × 20 points = 100 total — Innovation, Technical Complexity, UI/UX, Presentation, Impact.

**Fee logic** (`calcTeamFee` in `AdminPortal`, `calculateTotalFee` in `RegistrationForm`): ₹100/member for Hostellers, ₹219/member for Day Scholars (food included). Falls back to `amountPaid` if the backend already computed/stored it.

---

## 9. Page-by-Page Walkthrough

### `/` — Home (`HeroSection` + `HackathonScheduleRules` + `FAQSection`)
Animated hero (GSAP timeline: title → tagline → CTAs → poster cards), animated counters (`data-count` + GSAP `innerText` tween) fed by `stats.totalParticipants`, four feature cards, then embeds the schedule/rules section and sponsors/prizes sections beneath it. `HeroSection` also renders `SponsorsSection` and `PrizesSection` directly inside itself (not from the page) — a slightly unusual composition (a "section" component nesting other "section" components) but keeps the homepage page.tsx minimal.

### `/register` — `RegistrationForm`
Multi-step single form (not a wizard/route stepper — all steps render on one scrollable page, numbered "Step 1 of 4" purely as visual sectioning):
1. Team profile (name, track, size 2–5 via segmented buttons)
2. Leader details — **must** be `@vitbhopal.ac.in` (enforced client-side via `isVITBhopalEmail`)
3. Teammates (conditionally rendered based on `memberCount`) — also must be `@vitbhopal.ac.in`
4. Payment — static QR code image + UPI ID, UTR reference input, optional screenshot upload (`uploadDirectToImagekit`), live total fee display

On submit: `POST /api/teams/register` → confetti → `onRegisteredSuccess(team)` → parent page calls `setActiveTeam` + `router.push("/team")`.

### `/team` — `TeamPassTicket`
Three tabs once a team is loaded:
- **Digital ID Ticket** — print-styled pass with QR placeholder, access PIN, verification badge, venue check-in status
- **Team Roster** — all members' contact/residence details + payment record
- **Project Submission** — embeds `ProjectSubmissionModal` directly (so `/team` and `/submit` both render the same submission UI)

If no team is loaded, shows a "sign in" CTA that calls `onSwitchTeamLogin` (wired to `/team` route push, effectively a self-redirect placeholder — there's no actual login modal shown here; `TeamLoginModal` exists as a component but isn't visibly mounted by any page in this snapshot, suggesting it's meant to be triggered from the Navbar/AppShell in a fuller version of the app).

### `/submit` — `ProjectSubmissionModal`
Gated by, in order: team logged in → submissions globally open (`/api/admin/submissions-status`) → deadline not passed → payment `verified`. Each gate renders a distinct full-screen "locked" state before the actual form appears. The form itself: title/tagline/problem/solution, a tech-stack multi-select (preset chips + free-text add), GitHub URL (required), demo URL, and a presentation upload (10MB limit, PPT/PPTX/PDF, via `/api/upload`) or a pasted Slides/Canva link. A live countdown timer (updates every second) shows time remaining until the deadline.

### `/schedule` — `HackathonScheduleRules` + `SponsorsSection`
Static timeline (`HACKATHON_SCHEDULE` from `data/mockData.ts`), collapsible "Rules & Code of Conduct" and "Judging Criteria" accordions.

### `/faq` — `FAQSection`
Static accordion, `FAQ_ITEMS` hardcoded in the component itself (not in `mockData.ts`, inconsistent with how schedule/rules data is centralized).

### `/admin` — `AdminPortal` (see §6.2 for auth)
Once authenticated, 5 tabs:
- **Teams** — searchable/filterable table, approve/reject payment, toggle venue check-in, delete team, view payment screenshot
- **24H Submissions** — card grid of submitted projects, opens the scoring modal
- **Jury Leaderboard** — read-only ranked table sorted by `project.score.total`
- **Live Broadcasts** — send/delete announcements (category-tagged), live feed
- **Admin Whitelist** — add/revoke admin access

Header toolbar: toggle registrations open/closed, toggle submissions open/closed, export Excel/CSV, **"Reset DB Data"** (destructive, double-confirmed), sign out.

### `/jury` — `JuryPortal`
Passcode-gated (see §6.3). Search/filter submissions by track/status/text, view full submission detail modal, score via the same 5-category rubric. **Note:** the actual score-saving here is wired through a prop (`onScoreProject`) that, per §4, is a no-op stub at the routing layer — needs a real implementation to match `AdminPortal`'s behavior.

---

## 10. Layout & Visual System

- **`app/layout.tsx`** wraps everything in `<ClerkProvider>` (with a fully custom dark-theme `appearance` config) and loads 5 Google Fonts as CSS variables (`--font-display`, `--font-heading`, `--font-subheading`, `--font-body`, `--font-mono`).
- **`AppShell`** (rendered inside every route via the route-group layout implicitly, actually mounted from `app/layout.tsx`... — actually mounted directly, wrapping `{children}`) is responsible for:
  - `LoadingScreen` — a ~2.2s animated splash ("ORIGIN HACKATHON" letter-by-letter reveal + progress bar) shown on every load
  - `BackgroundVeins` — a canvas-based particle network (mouse-reactive, orange connecting lines) rendered `fixed` behind all content
  - `LiveAnnouncementsBanner` — sticky top bar showing the latest announcement, dismissible
  - `Navbar` — sticky header with smooth-scroll nav links (uses `sessionStorage["pendingScroll"]` to scroll to a hero/sponsors/schedule/faq anchor *after* navigating home from another route), Clerk `SignInButton`/`UserButton`
  - `Footer` — sitemap-style links + organizer/jury portal entry points
  - **Lenis** smooth-scroll is initialized here globally via `requestAnimationFrame`
- **Design language:** near-black backgrounds (`#0A0A0A`/`#141414`), 1px neutral borders, orange (`#FF3B00`) as the only saturated accent, monospace for all data/labels (`font-mono`), uppercase tracked-out headings (`.font-heading`/`.font-display`), "tape strip" and "bookmark tag" pseudo-elements on cards for a poster/zine aesthetic.
- **`globals.css`** also contains a large block of `!important`-heavy overrides for Clerk's default component classNames (`.cl-*`) — necessary because Clerk's default light theme doesn't fully respect the `appearance.variables` config for every sub-element.

---

## 11. Notable Inconsistencies & Things to Fix

These are worth knowing before extending the app:

1. **Two different `DEFAULT_SUBMISSION_DEADLINE` constants** exist and disagree:
   - `data/mockData.ts` → `2026-08-26T11:00:00+05:30`
   - `lib/deadline.ts` → `2026-09-02T12:00:00+05:30`
   `ProjectSubmissionModal` imports from `lib/deadline.ts`, but it's easy to accidentally import the wrong one. Consolidate to a single source of truth (ideally driven entirely by the backend's `/api/admin/submissions-status` response, which the component already fetches and prefers when available).
2. **Jury scoring is not wired end-to-end** — `app/(routes)/jury/page.tsx`'s `handleScoreProject` is an empty stub, while the `JuryPortal` UI fully implements the scoring form and calls this prop expecting it to persist.
3. **Dead/duplicate registration paths** — the app has a full in-app `RegistrationForm` at `/register`, but `Navbar`, `Footer`, and `HeroSection` CTA buttons instead link out to an **external Google Form** (`EXTERNAL_REGISTRATION_URL`). It's unclear which is the canonical registration flow; likely the in-app form is newer and the external-link CTAs weren't updated.
4. **Legacy OTP admin-auth code path** (`authStep`, `sentOtp`, `handleVerifyOtp`) exists in `AdminPortal` but has no reachable UI in the current render tree — Clerk fully replaced it. Safe to delete once confirmed unused, to reduce confusion.
5. **`TeamLoginModal` is exported but not mounted** anywhere in the pages shown — `Navbar`'s `onOpenLogin` prop is wired to a no-op (`() => {}`) in `AppShell`. If team login is meant to be reachable from the navbar, this needs to be connected (currently team login is only reachable indirectly, e.g. via redirects from `/register`'s "switch to login" or `/submit`'s gate).
6. **Security posture** — Team auth (no password) and Jury auth (hardcoded shared passcode shipped client-side) are appropriate for a low-stakes, time-boxed student event, but should not be treated as a security model if reused elsewhere.
7. **`next.config.ts`** still has a placeholder production backend URL (`https://your-backend-url.com/api/:path*`) — **must be replaced before deploying to production**, or every API call will 404/fail in prod.

---

## 12. Environment Variables

Referenced across the codebase:

| Variable | Used in | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `app/layout.tsx`, `lib/clerk.ts` | Clerk public key for `<ClerkProvider>` |
| `NODE_ENV` | `next.config.ts` | Chooses dev vs prod API rewrite target |
| `SUBMISSION_DEADLINE` | `lib/deadline.ts` (server-only fallback path) | Optional override for the submission deadline |

A Clerk **secret key** would also be required by whatever Clerk middleware/backend validation exists (not present in this frontend-only repo).

---

## 13. Running Locally

```bash
npm install
npm run dev        # Next.js dev server on :3000, proxies /api/* → localhost:4000
```

You'll also need:
1. A backend implementing every endpoint in §7, running on `:4000` (or update `next.config.ts`).
2. A Clerk application, with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set in `.env.local`.
3. An ImageKit account wired into the backend's `/api/upload` endpoint.

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint         # ESLint (flat config, Next.js core-web-vitals + TS rules)
```

---

## 14. Extending the App — Where to Add Things

- **New public page/section** → add a component to `components/sections/`, export it from `components/index.ts`, and either embed it in an existing route or create a new folder under `app/(routes)/`.
- **New admin capability** → add a tab to `AdminPortal`'s `adminTab` union + a button in the tab bar + a new backend endpoint; follow the existing pattern of a handler in `app/(routes)/admin/page.tsx` that attaches `x-admin-email` and calls `refreshData()` afterward.
- **New team-facing data field** → extend `types/index.ts` (`Team`/`TeamMember`/`ProjectSubmission`), then thread it through `RegistrationForm`/`ProjectSubmissionModal` (write side) and `AdminPortal`/`JuryPortal`/`TeamPassTicket` (read side).
- **Design tokens** → all colors/fonts are CSS variables in `globals.css` (`:root`) — change once, applies everywhere.