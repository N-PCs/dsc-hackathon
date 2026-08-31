# ORIGIN '26 — System Architecture & Workflow Specifications

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[![Amazon S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Google Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Neon DB](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![Vercel](https://img.shields.io/badge/Vercel_Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

This document outlines the complete technical architecture, end-to-end data flows, and workflow diagrams for the **Origin Hackathon Platform** built for the Data Science Club (VIT Bhopal).

---

## Tech Stack Overview

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

## High-Level System Architecture

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
