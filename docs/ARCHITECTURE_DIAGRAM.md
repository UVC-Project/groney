# Groeny Platform - Architecture Component Diagram

**Version:** 1.0  
**Last Updated:** January 12, 2026

---

## 1. High-Level System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                    INTERNET                                       │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE EDGE (Zero Trust)                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  • SSL/TLS Termination    • DDoS Protection    • WAF    • CDN Caching       │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                         │
│                              Cloudflare Tunnel                                    │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                        ORACLE CLOUD INFRASTRUCTURE (OCI)                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Docker Network (groney-network)                     │  │
│  │                                                                             │  │
│  │   ┌───────────────────────────────────────────────────────────────────┐     │  │
│  │   │                    CLOUDFLARED CONNECTOR                          │     │  │
│  │   │         Routes: /api/* → Gateway | /* → Frontend                  │     │  │
│  │   └───────────────────────────────────────────────────────────────────┘     │  │
│  │                          │                    │                             │  │
│  │              ┌───────────┘                    └───────────┐                 │  │
│  │              ▼                                            ▼                 │  │
│  │   ┌──────────────────┐                        ┌──────────────────┐          │  │
│  │   │   API GATEWAY    │                        │    FRONTEND      │          │  │
│  │   │   (Port 3000)    │◄───── Same-Origin ────►│   (Port 5173)    │          │  │
│  │   │                  │        API Calls       │   SvelteKit 5    │          │  │
│  │   └────────┬─────────┘                        └──────────────────┘          │  │
│  │            │                                                                │  │
│  │            │ Internal Docker DNS Routing                                    │  │
│  │            ▼                                                                │  │
│  │   ┌──────────────────────────────────────────────────────────────────┐      │  │
│  │   │                      MICROSERVICES LAYER                         │      │  │
│  │   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │      │  │
│  │   │  │Auth Service │ │Mascot Engine│ │Mission Svc  │ │Submission   │ │      │  │
│  │   │  │  (3001)     │ │  (3002)     │ │  (3003)     │ │Service(3004)│ │      │  │
│  │   │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │      │  │
│  │   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                 │      │  │
│  │   │  │Shop Service │ │Calculation  │ │Supply Svc   │                 │      │  │
│  │   │  │  (3005)     │ │Svc (3006)   │ │  (3007)     │                 │      │  │
│  │   │  └─────────────┘ └─────────────┘ └─────────────┘                 │      │  │
│  │   └──────────────────────────────────────────────────────────────────┘      │  │
│  │                                    │                                        │  │
│  │                                    ▼                                        │  │
│  │   ┌──────────────────────────────────────────────────────────────────┐      │  │
│  │   │                      PERSISTENCE LAYER                           │      │  │
│  │   │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │      │  │
│  │   │  │ PostgreSQL  │    │    Redis    │    │    MinIO    │           │      │  │
│  │   │  │   (5432)    │    │   (6379)    │    │ (9000/9001) │           │      │  │
│  │   │  │  Database   │    │   Cache     │    │   S3 Store  │           │      │  │
│  │   │  └─────────────┘    └─────────────┘    └─────────────┘           │      │  │
│  │   └──────────────────────────────────────────────────────────────────┘      │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Microservices Detail Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY (Port 3000)                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                                                    │  │
│  │  • Request Routing & Proxying    • CORS Handling    • Morgan Logging        │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  Route Mapping:                                                                   │
│  ┌────────────────────────┬────────────────────────────────────────────────────┐  │
│  │ /api/auth/*            │ → Auth Service (3001)                              │  │
│  │ /api/teacher/*         │ → Auth Service (3001) + Mission Service (3003)     │  │
│  │ /api/student/*         │ → Mission Service (3003)                           │  │
│  │ /api/mascot/*          │ → Mascot Engine (3002)                             │  │
│  │ /api/shop/*            │ → Shop Service (3005)                              │  │
│  │ /api/supply/*          │ → Supply Service (3007)                            │  │
│  │ /api/calculate/*       │ → Calculation Service (3006)                       │  │
│  │ /api/files/*           │ → Submission Service (3004) - File Proxy           │  │
│  │ /api/health            │ → Gateway Health Check                             │  │
│  └────────────────────────┴────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                           AUTH SERVICE (Port 3001)                                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Responsibilities:                                                          │  │
│  │  • User Registration (Student/Teacher)    • JWT Token Management            │  │
│  │  • Login/Logout                           • Password Reset (Email)          │  │
│  │  • Email Verification                     • Profile Management              │  │
│  │  • Class Creation & Management            • Class Code Generation           │  │
│  │  • Student Enrollment                     • Auth Logging                    │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  Dependencies: PostgreSQL, Redis (sessions), SMTP (email)                         │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                          MASCOT ENGINE (Port 3002)                                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Responsibilities:                                                          │  │
│  │  • Stat Decay Calculation (Lazy Eval)     • Level Progression               │  │
│  │  • Health State Management                • Pet Interaction (+happiness)    │  │
│  │  • Decay Rate Configuration               • Item Equip/Unequip              │  │
│  │  • Stat Boost Application                 • Debug Endpoints                 │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  Core Algorithm: gameloop.ts                                                      │
│  Dependencies: PostgreSQL                                                         │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                         MISSION SERVICE (Port 3003)                               │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Responsibilities:                                                          │  │
│  │  • Sector CRUD Operations                 • Mission CRUD Operations         │  │
│  │  • Mission Status Calculation             • Cooldown Management             │  │
│  │  • Activity Feed Management               • Map Decoration CRUD             │  │
│  │  • Class Initialization                   • Map Size Configuration          │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  Routes: teacher.routes.ts, student.routes.ts                                     │
│  Dependencies: PostgreSQL                                                         │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                        SUBMISSION SERVICE (Port 3004)                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Responsibilities:                                                          │  │
│  │  • Photo Upload (S3/MinIO)                • Submission Creation             │  │
│  │  • Teacher Approval Workflow              • Reward Distribution             │  │
│  │  • File Serving (Proxy)                   • Level-up Detection              │  │
│  │  • Recent Decisions API                   • Activity Creation               │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  Dependencies: PostgreSQL, MinIO (S3)                                             │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                           SHOP SERVICE (Port 3005)                                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Responsibilities:                                                          │  │
│  │  • Shop Item Listing                      • Purchase Processing             │  │
│  │  • Ownership Verification                 • Coin Balance Management         │  │
│  │  • Wardrobe Item Listing                  • Purchase Activity Logging       │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  Dependencies: PostgreSQL                                                         │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                       CALCULATION SERVICE (Port 3006)                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Responsibilities:                                                          │  │
│  │  • CO2 Reduction Calculation              • Sector-to-Task Mapping          │  │
│  │  • Class Aggregate Statistics             • Date Range Filtering            │  │
│  │  • CO2 Factor Configuration               • Impact Breakdown                │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  Dependencies: PostgreSQL                                                         │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                          SUPPLY SERVICE (Port 3007)                               │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Responsibilities:                                                          │  │
│  │  • Supply Catalog Management              • Request Creation (Student)      │  │
│  │  • Request Approval (Teacher)             • Status Tracking                 │  │
│  │  • Request Filtering                                                        │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  Dependencies: PostgreSQL                                                         │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Diagrams

### 3.1 Student Mission Completion Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Student  │    │ Frontend │    │ Gateway  │    │ Mission  │    │PostgreSQL│
│ Browser  │    │ Svelte   │    │  (3000)  │    │ Service  │    │    DB    │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. View Map   │               │               │               │
     │──────────────►│               │               │               │
     │               │ 2. GET /api/student/sectors   │               │
     │               │──────────────►│──────────────►│               │
     │               │               │               │ 3. Query      │
     │               │               │               │──────────────►│
     │               │               │               │◄──────────────│
     │               │◄──────────────│◄──────────────│               │
     │◄──────────────│               │               │               │
     │               │               │               │               │
     │ 4. Accept     │               │               │               │
     │    Mission    │               │               │               │
     │──────────────►│               │               │               │
     │               │ 5. POST /api/student/missions/:id/accept      │
     │               │──────────────►│──────────────►│               │
     │               │               │               │ 6. Create     │
     │               │               │               │   Submission  │
     │               │               │               │──────────────►│
     │               │◄──────────────│◄──────────────│◄──────────────│
     │◄──────────────│               │               │               │
     │               │               │               │               │
     │ 7. Upload     │               │               │               │
     │    Photo      │               │               │               │
     │──────────────►│               │               │               │
     │               │ 8. POST /api/student/submissions/:id/photo    │
     │               │──────────────►│               │               │
     │               │               │ 9. Forward to Submission Svc  │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │               │  Submission   │
     │               │               │               │  Service      │
     │               │               │               │  (3004)       │
     │               │               │               │      │        │
     │               │               │               │      ▼        │
     │               │               │               │   ┌──────┐    │
     │               │               │               │   │MinIO │    │
     │               │               │               │   │ S3   │    │
     │               │               │               │   └──────┘    │
     │               │◄──────────────│◄──────────────│◄──────────────│
     │◄──────────────│               │               │               │
```

### 3.2 Teacher Approval Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Teacher  │    │ Frontend │    │ Gateway  │    │Submission│    │  Mascot  │
│ Browser  │    │ Svelte   │    │  (3000)  │    │ Service  │    │  Engine  │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. View       │               │               │               │
     │  Submissions  │               │               │               │
     │──────────────►│               │               │               │
     │               │ 2. GET /api/teacher/submissions               │
     │               │──────────────►│──────────────►│               │
     │               │◄──────────────│◄──────────────│               │
     │◄──────────────│               │               │               │
     │               │               │               │               │
     │ 3. Approve    │               │               │               │
     │   Submission  │               │               │               │
     │──────────────►│               │               │               │
     │               │ 4. POST /api/teacher/submissions/:id/approve  │
     │               │──────────────►│──────────────►│               │
     │               │               │               │               │
     │               │               │               │ 5. Update     │
     │               │               │               │   Status      │
     │               │               │               │──────────────►│ DB
     │               │               │               │               │
     │               │               │               │ 6. POST /api/mascot/boost
     │               │               │               │──────────────►│
     │               │               │               │               │ 7. Apply
     │               │               │               │               │   Rewards
     │               │               │               │               │──► DB
     │               │               │               │◄──────────────│
     │               │               │               │               │
     │               │               │               │ 8. Create     │
     │               │               │               │   Activity    │
     │               │               │               │──────────────►│ DB
     │               │◄──────────────│◄──────────────│               │
     │◄──────────────│               │               │               │
```

---

## 4. Database Entity Relationship Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA (PostgreSQL)                         │
└───────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     users       │         │   class_users   │         │     classes     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────►│ userId (FK)     │◄───────►│ id (PK)         │
│ firstName       │         │ classId (FK)    │         │ name            │
│ lastName        │         └─────────────────┘         │ school          │
│ username (UQ)   │                                     │ classCode (UQ)  │
│ email (UQ)      │                                     │ mapWidth        │
│ password        │                                     │ mapHeight       │
│ role (ENUM)     │                                     │ createdAt       │
│ currentStreak   │                                     │ updatedAt       │
│ longestStreak   │                                     └────────┬────────┘
│ lastLoginDate   │                                              │
│ emailVerified   │                                              │
│ isActive        │                                              │
└────────┬────────┘                                              │
         │                                              ┌────────┴────────┐
         │                                              │                 │
         ▼                                              ▼                 ▼
┌─────────────────┐                            ┌───────────────────┐ ┌─────────────────┐
│   submissions   │                            │      mascots      │ │    sectors      │
├─────────────────┤                            ├───────────────────┤ ├─────────────────┤
│ id (PK)         │                            │ id (PK)           │ │ id (PK)         │
│ missionId (FK)  │◄──────────┐                │ classId (FK,UQ)   │ │ classId (FK)    │
│ userId (FK)     │           │                │ thirst            │ │ name            │
│ classId (FK)    │           │                │ hunger            │ │ type (ENUM)     │
│ photoUrl        │           │                │ happiness         │ │ gridX           │
│ qrScanned       │           │                │ cleanliness       │ │ gridY           │
│ status (ENUM)   │           │                │ level             │ │ gridWidth       │
│ createdAt       │           │                │ xp                │ │ gridHeight      │
│ updatedAt       │           │                │ coins             │ │ color           │
└─────────────────┘           │                │ equippedHat       │ │ createdAt       │
                              │                │ equippedAccessory │ └────────┬────────┘
                              │                │ lastDecayAt       │          │
                              │                │ *DecayRate (x4)   │          │
                              │                └───────────────────┘          │
                              │                                               │
                              │                                               ▼
                              │                                    ┌─────────────────┐
                              └────────────────────────────────────│    missions     │
                                                                   ├─────────────────┤
                                                                   │ id (PK)         │
                                                                   │ sectorId (FK)   │
                                                                   │ title           │
                                                                   │ description     │
                                                                   │ xpReward        │
                                                                   │ coinReward      │
                                                                   │ *Boost (x4)     │
                                                                   │ requiresPhoto   │
                                                                   │ requiresQR      │
                                                                   │ cooldownHours   │
                                                                   │ maxCompletions  │
                                                                   │ category (ENUM) │
                                                                   │ status (ENUM)   │
                                                                   └─────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   shop_items    │         │    purchases    │         │   activities    │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────►│ id (PK)         │         │ id (PK)         │
│ name            │         │ userId (FK)     │         │ classId (FK)    │
│ description     │         │ itemId (FK)     │         │ userId (FK)     │
│ type (ENUM)     │         │ classId (FK)    │         │ type (ENUM)     │
│ price           │         │ createdAt       │         │ content         │
│ imageUrl        │         └─────────────────┘         │ imageUrl        │
│ createdAt       │                                     │ createdAt       │
└─────────────────┘                                     └─────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    supplies     │         │supply_requests  │         │ map_decorations │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────►│ id (PK)         │         │ id (PK)         │
│ name            │         │ supplyId (FK)   │         │ classId (FK)    │
│ description     │         │ userId (FK)     │         │ type (ENUM)     │
│ imageUrl        │         │ classId (FK)    │         │ gridX           │
│ createdAt       │         │ status (ENUM)   │         │ gridY           │
└─────────────────┘         │ createdAt       │         │ gridWidth       │
                            └─────────────────┘         │ gridHeight      │
                                                        │ label           │
                                                        └─────────────────┘
```

---

## 5. Frontend Component Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (SvelteKit 5)                                  │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                                   ROUTES                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  PUBLIC ROUTES                                                              │  │
│  │  ├── /login              - Student/Teacher login                            │  │
│  │  ├── /register           - New user registration                            │  │
│  │  ├── /forgot-password    - Password reset request                           │  │
│  │  ├── /reset-password     - Password reset form                              │  │
│  │  ├── /verify-email       - Email verification                               │  │
│  │  ├── /resend-verification- Resend verification email                        │  │
│  │  └── /wiki               - Help & educational content                       │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  STUDENT ROUTES (Protected)                                                 │  │
│  │  ├── /                   - Home (Mascot dashboard)                          │  │
│  │  ├── /map                - Interactive schoolyard map                       │  │
│  │  ├── /missions/[id]/submit - Mission photo submission                       │  │
│  │  ├── /shop               - Purchase cosmetics                               │  │
│  │  ├── /wardrobe           - Equip owned items                                │  │
│  │  ├── /supplies           - Request real-world supplies                      │  │
│  │  ├── /profile            - User profile management                          │  │
│  │  └── /wiki/sector/[type] - Sector-specific wiki pages                       │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  TEACHER ROUTES (Protected)                                                 │  │
│  │  └── /teacher            - Full teacher dashboard                           │  │
│  │      ├── Overview Tab    - Class stats, students                            │  │
│  │      ├── Missions Tab    - CRUD missions                                    │  │
│  │      ├── Submissions Tab - Approve/reject submissions                       │  │
│  │      ├── Map Tab         - Configure schoolyard map                         │  │
│  │      ├── Supplies Tab    - Manage supply requests                           │  │
│  │      └── Settings Tab    - Decay rates, QR codes                            │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                              SHARED COMPONENTS                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  LAYOUT & NAVIGATION                                                        │  │
│  │  ├── +layout.svelte      - Root layout with auth check                      │  │
│  │  ├── BottomNav.svelte    - Mobile navigation bar                            │  │
│  │  ├── PageWrapper.svelte  - Consistent page container                        │  │
│  │  └── ScrollToTop.svelte  - Scroll to top button                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  UI COMPONENTS                                                              │  │
│  │  ├── LoadingSkeleton.svelte  - Loading state placeholders                   │  │
│  │  ├── ErrorDisplay.svelte     - Error message display                        │  │
│  │  ├── LogoutModal.svelte      - Logout confirmation                          │  │
│  │  ├── PageIntroModal.svelte   - First-time user guidance                     │  │
│  │  └── BackgroundPicker.svelte - Theme customization                          │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  FEATURE COMPONENTS                                                         │  │
│  │  ├── StudentMap.svelte       - Interactive map for students                 │  │
│  │  ├── MapBuilder.svelte       - Teacher map editor                           │  │
│  │  ├── WeatherWidget.svelte    - Current weather display                      │  │
│  │  ├── StreakWidget.svelte     - Login streak display                         │  │
│  │  └── SectorQRGenerator.svelte- QR code generation                           │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                              STATE MANAGEMENT                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  STORES (Svelte Stores)                                                     │  │
│  │  ├── auth.ts             - Authentication state, user data, JWT             │  │
│  │  ├── teacherStore.ts     - Teacher-specific state                           │  │
│  │  └── backgroundTheme.ts  - UI theme preferences                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  DATA FLOW                                                                  │  │
│  │  • +page.ts loaders fetch data server-side                                  │  │
│  │  • Stores persist auth state in localStorage                                │  │
│  │  • Real-time updates via polling (5s intervals)                             │  │
│  │  • Optimistic UI updates with rollback on error                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Security Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY LAYERS                                      │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: EDGE SECURITY (Cloudflare)                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  • SSL/TLS Termination (HTTPS only)                                         │  │
│  │  • DDoS Protection                                                          │  │
│  │  • Web Application Firewall (WAF)                                           │  │
│  │  • Zero Trust Tunnel (no exposed ports)                                     │  │
│  │  • Bot Protection                                                           │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: APPLICATION SECURITY                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  AUTHENTICATION                                                             │  │
│  │  • JWT Tokens (7-day expiry)                                                │  │
│  │  • bcrypt Password Hashing                                                  │  │
│  │  • Email Verification for Teachers                                          │  │
│  │  • Token Blacklisting on Logout                                             │  │
│  │  • Auth Logging (IP, action, timestamp)                                     │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  AUTHORIZATION                                                              │  │
│  │  • Role-Based Access Control (STUDENT, TEACHER)                             │  │
│  │  • Class Membership Verification                                            │  │
│  │  • Resource Ownership Checks                                                │  │
│  │  • x-user-id / x-user-role Headers                                          │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  DATA PROTECTION                                                            │  │
│  │  • Prisma ORM (SQL Injection Prevention)                                    │  │
│  │  • Input Validation                                                         │  │
│  │  • CORS Configuration                                                       │  │
│  │  • File Upload Size Limits (5MB)                                            │  │
│  │  • Content-Type Validation                                                  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: INFRASTRUCTURE SECURITY                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  • Docker Network Isolation                                                 │  │
│  │  • Internal Service Communication Only                                      │  │
│  │  • Environment Variables for Secrets                                        │  │
│  │  • OCI Vault for Production Secrets                                         │  │
│  │  • No Filesystem Secret Storage                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Deployment Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT PIPELINE                                     │
└───────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   GitHub     │    │   GitHub     │    │    OCI       │    │  Cloudflare  │
│   Repo       │───►│   Actions    │───►│   Instance   │───►│   Tunnel     │
│              │    │   (CI/CD)    │    │   (Docker)   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Source Code  │    │ • Lint       │    │ • Docker     │    │ • SSL/TLS    │
│ • Frontend   │    │ • Test       │    │   Compose    │    │ • CDN        │
│ • Backend    │    │ • Build      │    │ • Volumes    │    │ • WAF        │
│ • Prisma     │    │ • Deploy     │    │ • Networks   │    │ • Zero Trust │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                           CONTAINER ORCHESTRATION                                 │
│                                                                                   │
│  docker-compose.yml                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  Services:                                                                  │  │
│  │  ├── postgres         (postgres:16-alpine)                                  │  │
│  │  ├── redis            (redis:7-alpine)                                      │  │
│  │  ├── minio            (minio/minio:latest)                                  │  │
│  │  ├── api-gateway      (custom Dockerfile)                                   │  │
│  │  ├── auth-service     (custom Dockerfile)                                   │  │
│  │  ├── mascot-engine    (custom Dockerfile)                                   │  │
│  │  ├── mission-service  (custom Dockerfile)                                   │  │
│  │  ├── submission-service (custom Dockerfile)                                 │  │
│  │  ├── shop-service     (custom Dockerfile)                                   │  │
│  │  ├── calculation-service (custom Dockerfile)                                │  │
│  │  ├── supply-service   (custom Dockerfile)                                   │  │
│  │  ├── frontend         (custom Dockerfile)                                   │  │
│  │  └── tunnel           (cloudflare/cloudflared) [prod profile]               │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  Volumes:                                                                         │
│  ├── postgres_data       - Database persistence                                   │
│  ├── redis_data          - Cache persistence                                      │
│  └── minio_data          - Object storage persistence                             │
│                                                                                   │
│  Health Checks:                                                                   │
│  ├── PostgreSQL          - pg_isready                                             │
│  ├── Redis               - redis-cli ping                                         │
│  └── MinIO               - HTTP health endpoint                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** | SvelteKit | 5.x | SSR Framework |
| | TypeScript | 5.x | Type Safety |
| | TailwindCSS | 3.x | Styling |
| | Vite | 5.x | Build Tool |
| **Backend** | Node.js | 20.x | Runtime |
| | Express.js | 4.x | HTTP Server |
| | TypeScript | 5.x | Type Safety |
| | Prisma | 5.x | ORM |
| **Database** | PostgreSQL | 16 | Primary DB |
| | Redis | 7 | Cache/Sessions |
| | MinIO | Latest | Object Storage |
| **Infrastructure** | Docker | Latest | Containerization |
| | Docker Compose | 3.8 | Orchestration |
| | Oracle Cloud | - | Hosting |
| | Cloudflare | - | CDN/Security |

---

## 9. API Endpoint Summary

| Service | Base Path | Key Endpoints |
|---------|-----------|---------------|
| Auth | `/api/auth` | POST /login, POST /register, POST /logout |
| Teacher | `/api/teacher` | GET /sectors, POST /missions, GET /submissions |
| Student | `/api/student` | GET /sectors, POST /missions/:id/accept |
| Mascot | `/api/mascot` | GET /:classId, POST /:classId/pet, POST /equip |
| Shop | `/api/shop` | GET /items, POST /purchase |
| Supply | `/api/supply` | GET /supplies, POST /supply-requests |
| Calculate | `/api/calculate` | POST /co2, GET /co2/class/:classId |
| Files | `/api/files` | GET /:key (S3 proxy) |
| Health | `/api/health` | GET / |

---

*Document generated: January 12, 2026*
