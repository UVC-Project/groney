# Design Document

## Overview

The Green Schoolyard Gamification System is a full-stack web application built with SvelteKit 5 (frontend) and Node.js/Express (backend), using PostgreSQL for data persistence. The system implements a Tamagotchi-style gamification layer over real-world schoolyard maintenance tasks, featuring a digital mascot named "Groeny" whose health stats are directly influenced by student activities.

The architecture follows a microservices pattern with an API Gateway routing requests to specialized backend services. The frontend is built with SvelteKit 5, optimized for mobile-first design on tablets and Chromebooks. The backend consists of multiple Express-based microservices handling authentication, missions, submissions, mascot logic, shop operations, and CO2 calculations.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SvelteKit 5 Application                             │   │
│  │  - Routes: +page.svelte files for each view          │   │
│  │  - Components: MascotDisplay, StatCard, BottomNav    │   │
│  │  - State: Svelte stores + SvelteKit load functions   │   │
│  │  - Styling: TailwindCSS with custom design tokens    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js API Gateway                              │   │
│  │  - Routing to microservices                          │   │
│  │  - Rate limiting                                     │   │
│  │  - Auth token validation                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service     │ │ Mission      │ │ Mascot       │
│ (Express)        │ │ Service      │ │ Engine       │
│ - Login/Signup   │ │ (Express)    │ │ (Express)    │
│ - Role Mgmt      │ │ - CRUD       │ │ - Stat Decay │
│ - Sessions       │ │ - Sectors    │ │ - Leveling   │
└──────────────────┘ └──────────────┘ └──────────────┘
        │                    │                 │
        └────────────────────┼─────────────────┘
                             ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│ Submission       │ │ Shop Service │ │ Calculation  │
│ Service          │ │ (Express)    │ │ Service      │
│ (Express)        │ │ - Items      │ │ (Express)    │
│ - Photo Upload   │ │ - Purchases  │ │ - CO2 Impact │
│ - QR Validation  │ │ - Coins      │ │              │
│ - Review Queue   │ │              │ │              │
└──────────────────┘ └──────────────┘ └──────────────┘
        │                    │                 │
        └────────────────────┼─────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Persistence Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - Tables: users, classes, mascots, sectors,         │   │
│  │    missions, submissions, shop_items, purchases,     │   │
│  │    activities, sessions                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Redis Cache                                         │   │
│  │  - Session storage                                   │   │
│  │  - Rate limiting counters                            │   │
│  │  - Temporary data caching                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Object Storage (S3-compatible)                      │   │
│  │  - Mission photos                                    │   │ 
│  │  - Mascot images                                     │   │
│  │  - Shop item images                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- SvelteKit 5 with TypeScript
- Vite (build tool, included with SvelteKit)
- TailwindCSS (styling with custom design system)
- SvelteKit routing (file-based)
- Svelte stores (state management)
- Lucide Svelte (icons)
- Svelte transitions and animations

**Backend Microservices:**
- Node.js with Express 4
- TypeScript
- Microservices architecture:
  - **API Gateway**: Request routing, rate limiting, auth validation
  - **Authentication Service**: Login, signup, role management, JWT tokens
  - **Mission Service**: Mission CRUD, sector management
  - **Submission Service**: Photo uploads, QR validation, teacher review workflow
  - **Mascot Engine**: Stat decay (cron jobs), stat boosts, leveling logic
  - **Shop Service**: Item inventory, coin transactions
  - **Calculation Service**: CO2 impact calculations

**Data Layer:**
- PostgreSQL (primary database)
- Redis (session storage, caching, rate limiting)
- Object Storage (S3-compatible for photos)
- Drizzle ORM or Prisma (type-safe database queries)

**Infrastructure:**
- Docker containers for each microservice
- API Gateway (Express with http-proxy-middleware)
- Cron jobs for stat decay (node-cron)
- Multer for file uploads
- Bcrypt for password hashing
- JWT for authentication tokens

**Development:**
- TypeScript for type safety
- ESLint + Prettier for code quality
- Vitest for unit testing
- fast-check for property-based testing

## Components and Interfaces

### Frontend Components (SvelteKit)

#### Core Routes (File-based Routing)

**Home Route (`src/routes/+page.svelte`)**
- Displays Groeny mascot with current stats
- Shows XP progress bar and level
- Displays seeds (coin) balance
- Shows 4 stat cards (Thirst, Hunger, Happiness, Cleanliness)
- Activity feed showing recent class accomplishments
- Pet interaction (tap Groeny to increase Happiness)
- Load function: `+page.ts` fetches mascot and activities

**Map Route (`src/routes/map/+page.svelte`)**
- Interactive schoolyard map with sectors
- Visual indicators for available missions
- Sector selection leading to mission list
- Color-coded sectors by type
- Load function: `+page.ts` fetches sectors for user's class

**Mission Detail Route (`src/routes/mission/[id]/+page.svelte`)**
- Mission title and description
- Reward display (XP, Coins, Stat Boosts)
- Photo upload interface (camera/file picker)
- QR code scanning interface (if required)
- Submit button with validation
- Load function: `+page.ts` fetches mission by ID

**Shop Route (`src/routes/shop/+page.svelte`)**
- Tabbed interface (Hats, Accessories, Colors, Supplies)
- Grid of purchasable items with images
- Price display in coins
- Purchase button with coin balance check
- Ownership indicators
- Load function: `+page.ts` fetches shop items and purchases

**Wardrobe Route (`src/routes/wardrobe/+page.svelte`)**
- Large mascot preview with equipped items
- Category tabs for item types
- Grid of owned items
- Equip/unequip functionality
- Visual feedback for equipped items
- Load function: `+page.ts` fetches mascot and owned items

**Teacher Dashboard Route (`src/routes/teacher/+page.svelte`)**
- Class overview (name, code, student count)
- Mascot stats display
- Pending submissions queue with photos
- Approve/reject interface
- Mission creation form
- Student list
- Load function: `+page.ts` fetches class data (teacher-only)

**Login Route (`src/routes/login/+page.svelte`)**
- Username/password form
- Role selection (student/teacher)
- Class code input for students
- Form action: `+page.server.ts` handles authentication

**Register Route (`src/routes/register/+page.svelte`)**
- Registration form with validation
- Class code input for students
- Form action: `+page.server.ts` handles user creation

#### Reusable Components (`src/lib/components/`)

**MascotDisplay.svelte**
- Props: `mascot: Mascot`, `onTap?: () => void`
- Renders mascot image with decorative vine wreath
- Shows level badge and coin count
- Handles tap interactions with Svelte events
- Displays health status badge
- Uses Svelte transitions for animations

**StatCard.svelte**
- Props: `type: 'thirst' | 'hunger' | 'happiness' | 'cleanliness'`, `value: number`
- Color-coded border based on stat type
- Icon representation
- Progress bar (0-100) with Svelte tweened stores
- Percentage label

**BottomNav.svelte**
- Fixed bottom navigation bar
- 5 tabs: Home, Map, Shop, Wardrobe, Wiki
- Active state indicators using $page.url
- Icon-based navigation with SvelteKit links

**MissionCard.svelte**
- Props: `mission: Mission`, `sector?: Sector`
- Displays mission preview
- Shows rewards and requirements
- Click handler navigates to mission detail

**SubmissionReviewCard.svelte** (Teacher only)
- Props: `submission: Submission & { mission, student }`
- Displays photo proof
- Approve/reject buttons
- Notes textarea

### Backend Microservices API Endpoints

#### API Gateway (`http://localhost:3000`)

The API Gateway routes requests to appropriate microservices:
- `/api/auth/*` → Authentication Service (port 3001)
- `/api/mascot/*` → Mascot Engine (port 3002)
- `/api/missions/*`, `/api/sectors/*` → Mission Service (port 3003)
- `/api/submissions/*` → Submission Service (port 3004)
- `/api/shop/*` → Shop Service (port 3005)
- `/api/calculate/*` → Calculation Service (port 3006)

**Middleware:**
- Rate limiting (express-rate-limit)
- Auth token validation (JWT)
- Request logging
- CORS configuration

#### Authentication Service (Port 3001)

```typescript
POST /api/auth/register
  Body: { username, password, firstName, lastName, role, classCode? }
  Response: { user: User, token: string }

POST /api/auth/login
  Body: { username, password }
  Response: { user: User, token: string }

POST /api/auth/logout
  Headers: { Authorization: Bearer <token> }
  Response: { success: boolean }

GET /api/auth/me
  Headers: { Authorization: Bearer <token> }
  Response: { user: User | null }

POST /api/auth/refresh
  Body: { refreshToken: string }
  Response: { token: string }
```

#### Mascot Engine Service (Port 3002)

```typescript
GET /api/mascot/status/:userId
  Headers: { Authorization: Bearer <token> }
  Response: Mascot

POST /api/mascot/pet
  Headers: { Authorization: Bearer <token> }
  Body: { userId: string }
  Response: Mascot (with updated happiness)

POST /api/mascot/boost
  Headers: { Authorization: Bearer <token> }
  Body: { mascotId: string, thirst?, hunger?, happiness?, cleanliness? }
  Response: Mascot

POST /api/mascot/award
  Headers: { Authorization: Bearer <token> }
  Body: { mascotId: string, xp: number, coins: number }
  Response: Mascot

// Cron job endpoint (internal only)
POST /api/mascot/decay
  Body: { secret: string }
  Response: { processed: number }
```

#### Mission Service (Port 3003)

```typescript
GET /api/sectors/:classId
  Headers: { Authorization: Bearer <token> }
  Response: Sector[]

GET /api/missions/sector/:sectorId
  Headers: { Authorization: Bearer <token> }
  Response: Mission[]

GET /api/missions/:id
  Headers: { Authorization: Bearer <token> }
  Response: Mission

POST /api/missions
  Headers: { Authorization: Bearer <token> }
  Body: { sectorId, title, description, xpReward, coinReward, ...boosts }
  Response: Mission

PUT /api/missions/:id
  Headers: { Authorization: Bearer <token> }
  Body: Partial<Mission>
  Response: Mission

DELETE /api/missions/:id
  Headers: { Authorization: Bearer <token> }
  Response: { success: boolean }
```

#### Submission Service (Port 3004)

```typescript
POST /api/submissions
  Headers: { Authorization: Bearer <token> }
  Body: FormData { missionId, photo, qrCodeScanned }
  Response: Submission

GET /api/submissions/pending/:classId
  Headers: { Authorization: Bearer <token> }
  Response: Array<Submission & { mission: Mission, student: User }>

PUT /api/submissions/:id/review
  Headers: { Authorization: Bearer <token> }
  Body: { status: 'completed' | 'rejected', notes? }
  Response: Submission

GET /api/submissions/user/:userId
  Headers: { Authorization: Bearer <token> }
  Response: Submission[]

// QR Code validation
POST /api/submissions/validate-qr
  Headers: { Authorization: Bearer <token> }
  Body: { qrCodeData: string, missionId: string }
  Response: { valid: boolean }
```

#### Shop Service (Port 3005)

```typescript
GET /api/shop/items
  Headers: { Authorization: Bearer <token> }
  Response: ShopItem[]

POST /api/shop/purchase
  Headers: { Authorization: Bearer <token> }
  Body: { userId: string, itemId: string, classId: string }
  Response: Purchase

GET /api/shop/purchases/user/:userId
  Headers: { Authorization: Bearer <token> }
  Response: Purchase[]

GET /api/shop/purchases/class/:classId
  Headers: { Authorization: Bearer <token> }
  Response: Purchase[]

POST /api/shop/equip
  Headers: { Authorization: Bearer <token> }
  Body: { mascotId: string, itemId: string }
  Response: Mascot

POST /api/shop/unequip
  Headers: { Authorization: Bearer <token> }
  Body: { mascotId: string, slot: 'hat' | 'accessory' | 'color' }
  Response: Mascot
```

#### Calculation Service (Port 3006)

```typescript
POST /api/calculate/co2
  Headers: { Authorization: Bearer <token> }
  Body: { missions: Array<{ type: string, quantity: number }> }
  Response: { totalCO2Reduction: number, breakdown: object }

GET /api/calculate/co2/class/:classId
  Headers: { Authorization: Bearer <token> }
  Query: { startDate?, endDate? }
  Response: { totalCO2Reduction: number, missionCount: number }
```

#### Class Management (Part of Auth Service)

```typescript
POST /api/auth/class/create
  Headers: { Authorization: Bearer <token> }
  Body: { name: string, school: string }
  Response: { class: Class, classCode: string }

GET /api/auth/class/:classId
  Headers: { Authorization: Bearer <token> }
  Response: { ...Class, mascot: Mascot, students: User[] }

GET /api/auth/class/teacher/:teacherId
  Headers: { Authorization: Bearer <token> }
  Response: Class[]

POST /api/auth/class/switch
  Headers: { Authorization: Bearer <token> }
  Body: { classId: string }
  Response: { success: boolean }

POST /api/auth/class/join
  Headers: { Authorization: Bearer <token> }
  Body: { classCode: string }
  Response: { class: Class }
```

#### Activity Feed (Part of Mission Service)

```typescript
GET /api/activities/:classId
  Headers: { Authorization: Bearer <token> }
  Response: Activity[]

POST /api/activities
  Headers: { Authorization: Bearer <token> }
  Body: { classId, userId, type, content, imageUrl? }
  Response: Activity
```

### Storage Interface

The `IStorage` interface abstracts database operations:

```typescript
interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  getUsersByClass(classId: string): Promise<User[]>
  updateUserRole(userId: string, role: "student" | "teacher"): Promise<void>

  // Class operations
  getClass(id: string): Promise<Class | undefined>
  getClassByCode(classCode: string): Promise<Class | undefined>
  createClass(cls: Omit<InsertClass, 'id' | 'createdAt'>): Promise<Class>
  assignUserToClass(userId: string, classId: string): Promise<void>

  // Mascot operations
  getMascotByClass(classId: string): Promise<Mascot | undefined>
  createMascot(mascot: InsertMascot): Promise<Mascot>
  updateMascot(id: string, updates: Partial<InsertMascot>): Promise<Mascot>
  petMascot(id: string): Promise<Mascot>

  // Sector operations
  getSectorsByClass(classId: string): Promise<Sector[]>
  createSector(sector: InsertSector): Promise<Sector>

  // Mission operations
  getMissionsBySector(sectorId: string): Promise<Mission[]>
  getMission(id: string): Promise<Mission | undefined>
  createMission(mission: InsertMission): Promise<Mission>

  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>
  getSubmissionsByClass(classId: string): Promise<Submission[]>
  getPendingSubmissions(classId: string): Promise<Submission[]>
  reviewSubmission(id: string, status: "completed" | "rejected", reviewerId: string, notes?: string): Promise<Submission>

  // Shop operations
  getAllShopItems(): Promise<ShopItem[]>
  purchaseItem(purchase: InsertPurchase): Promise<Purchase>
  getPurchasesByUser(userId: string): Promise<Purchase[]>
  getPurchasesByClass(classId: string): Promise<Purchase[]>

  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>
  getActivitiesByClass(classId: string): Promise<Activity[]>

  // Helper operations
  updateUserClass(userId: string, classId: string): Promise<void>
  getClassesByTeacher(teacherId: string): Promise<Class[]>
  initializeClassDefaults(classId: string): Promise<void>
}
```

## Data Models

### Entity Relationship Overview

```
User ──────┐
           │ N:1
           ▼
         Class ──────┐ 1:1
                     ▼
                   Mascot
                     │
         ┌───────────┴───────────┐
         │                       │
      Sector                 Purchase
         │                       │
         │ 1:N                   │ N:1
         ▼                       ▼
      Mission              ShopItem
         │
         │ 1:N
         ▼
    Submission
         │
         │ N:1
         ▼
       User
```

### Core Entities

**User**
```typescript
{
  id: string (UUID)
  username: string (unique)
  passwordHash: string
  firstName: string
  lastName: string
  email?: string
  profileImageUrl?: string
  role: 'student' | 'teacher'
  classId?: string (FK to Class)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Class**
```typescript
{
  id: string (UUID)
  name: string
  school: string
  classCode: string (unique, 6-char alphanumeric)
  createdById?: string (FK to User)
  createdAt: timestamp
}
```

**Mascot**
```typescript
{
  id: string (UUID)
  classId: string (FK to Class, unique)
  name: string
  level: number (default: 1)
  xp: number (default: 0)
  thirst: number (0-100, default: 100)
  hunger: number (0-100, default: 100)
  happiness: number (0-100, default: 100)
  cleanliness: number (0-100, default: 100)
  coins: number (default: 0)
  equippedHat?: string (FK to ShopItem)
  equippedAccessory?: string (FK to ShopItem)
  equippedColor?: string (FK to ShopItem)
  lastFed?: timestamp
  lastWatered?: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Sector**
```typescript
{
  id: string (UUID)
  classId: string (FK to Class)
  name: string
  type: 'trees' | 'flowers' | 'pond' | 'chickens' | 'garden'
  description?: string
  createdAt: timestamp
}
```

**Mission**
```typescript
{
  id: string (UUID)
  sectorId: string (FK to Sector)
  title: string
  description: string
  xpReward: number (default: 10)
  coinReward: number (default: 5)
  thirstBoost: number (default: 0)
  hungerBoost: number (default: 0)
  happinessBoost: number (default: 0)
  cleanlinessBoost: number (default: 0)
  requiresPhoto: boolean (default: true)
  requiresQrCode: boolean (default: false)
  qrCodeData?: string
  createdAt: timestamp
}
```

**Submission**
```typescript
{
  id: string (UUID)
  missionId: string (FK to Mission)
  userId: string (FK to User)
  status: 'available' | 'in_progress' | 'pending_approval' | 'completed' | 'rejected'
  photoUrl?: string (base64 encoded)
  qrCodeScanned: boolean (default: false)
  submittedAt: timestamp
  reviewedAt?: timestamp
  reviewedBy?: string (FK to User)
  reviewNotes?: string
}
```

**ShopItem**
```typescript
{
  id: string (UUID)
  name: string
  description?: string
  type: 'hat' | 'accessory' | 'color' | 'supply'
  price: number
  imageUrl?: string
  customizationData?: jsonb
  createdAt: timestamp
}
```

**Purchase**
```typescript
{
  id: string (UUID)
  userId: string (FK to User)
  itemId: string (FK to ShopItem)
  classId: string (FK to Class)
  purchasedAt: timestamp
}
```

**Activity**
```typescript
{
  id: string (UUID)
  classId: string (FK to Class)
  userId: string (FK to User)
  type: string ('mission_completed' | 'purchase' | 'level_up')
  content: string
  imageUrl?: string
  createdAt: timestamp
}
```

**Session** (for authentication)
```typescript
{
  sid: string (primary key)
  sess: jsonb
  expire: timestamp
}
```

### Data Validation

All entities use Zod schemas for runtime validation:
- User registration validates username length (3-50), password length (6+), and role
- Mission creation validates required fields and numeric ranges
- Shop purchases validate coin balance and ownership
- Stat updates ensure values remain within 0-100 bounds

## Error Handling

### Frontend Error Handling (SvelteKit)

**API Request Errors:**
- SvelteKit load functions handle errors with `error()` helper
- Form actions return `fail()` with validation errors
- Network errors caught in try/catch blocks
- Error boundaries for component-level errors

**Validation Errors:**
- Form validation using Zod schemas
- SvelteKit form actions validate server-side
- Client-side validation with Svelte reactive statements
- Required field checks (photo upload, mission fields)
- File size validation (5MB limit for photos)

**User Feedback:**
- Toast notifications using Svelte stores
- Loading states with Svelte's `$:` reactive syntax
- Disabled buttons during pending operations
- Error messages with actionable guidance
- Svelte transitions for smooth error displays

**SvelteKit-Specific:**
- `+error.svelte` pages for route-level errors
- `handleError` hook in `hooks.server.ts`
- Status codes (401, 403, 404, 500) with custom error pages

### Backend Error Handling

**Authentication Errors:**
- 401 Unauthorized for missing/invalid sessions
- 403 Forbidden for insufficient permissions (teacher-only routes)
- Password hashing errors logged and return generic error

**Database Errors:**
- Unique constraint violations (username, class code)
- Foreign key violations (invalid references)
- Transaction rollbacks on failure
- Detailed error logging with stack traces

**Validation Errors:**
- 400 Bad Request for missing required fields
- 400 Bad Request for invalid data types
- 404 Not Found for non-existent resources
- Zod validation errors with detailed messages

**File Upload Errors:**
- 400 Bad Request for files exceeding 5MB
- Multer errors for invalid file types
- Base64 encoding errors

**Business Logic Errors:**
- Insufficient coins for purchases
- Already-owned items
- Missions from wrong class
- Stat values exceeding bounds

### Error Response Format

```typescript
{
  message: string  // User-friendly error message
  error?: string   // Technical error details (dev mode only)
  stack?: string   // Stack trace (dev mode only)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Session Properties

Property 1: Valid credentials create sessions
*For any* valid username and password combination, authenticating with those credentials should result in a session being created with the user's ID
**Validates: Requirements 1.1**

Property 2: Student registration requires valid class code
*For any* student registration attempt, the registration should succeed if and only if a valid class code is provided
**Validates: Requirements 1.2**

Property 3: Teacher registration succeeds without class code
*For any* teacher registration with valid credentials, the registration should succeed without requiring a class code
**Validates: Requirements 1.3**

Property 4: Invalid credentials are rejected
*For any* invalid username or password, authentication attempts should be rejected with an error
**Validates: Requirements 1.4**

Property 5: Sessions persist across navigation
*For any* authenticated user session, navigating to different pages should maintain the authentication state
**Validates: Requirements 1.5**

### Class Management Properties

Property 6: Class codes are unique
*For any* two classes created in the system, their class codes should be different
**Validates: Requirements 2.1**

Property 7: Mascot initialization defaults
*For any* newly created class, the associated mascot should have Thirst=100, Hunger=100, Happiness=100, Cleanliness=100, Level=1, XP=0, Coins=0
**Validates: Requirements 2.2**

Property 8: Class creation initializes sectors
*For any* newly created class, the system should create default sectors (trees, flowers, pond, chickens, garden)
**Validates: Requirements 2.3**

Property 9: Valid class code associates student
*For any* student registration with a valid class code, the student's classId field should match the class with that code
**Validates: Requirements 2.4**

Property 10: Class view completeness
*For any* class viewed by a teacher, the response should include class name, school, class code, mascot stats, and all enrolled students
**Validates: Requirements 2.5**

### Mascot Display and Interaction Properties

Property 11: Mascot stats are displayed
*For any* student viewing the home page, the mascot's current Thirst, Hunger, Happiness, and Cleanliness values should be visible
**Validates: Requirements 3.1, 3.4**

Property 12: Pet interaction increases happiness
*For any* mascot with Happiness < 96, tapping Groeny should increase Happiness by exactly 5 points
**Validates: Requirements 3.3**

Property 13: Pet interaction caps at 100
*For any* mascot with Happiness ≥ 96, tapping Groeny should set Happiness to exactly 100
**Validates: Requirements 3.3**

Property 14: Stats remain within bounds
*For any* mascot, all stat values (Thirst, Hunger, Happiness, Cleanliness) should be between 0 and 100 inclusive
**Validates: Requirements 3.4**

Property 15: Equipped items are displayed
*For any* mascot with equipped items (hat, accessory, or color), those items should be visible on the mascot display
**Validates: Requirements 3.5**

### Map and Sector Properties

Property 16: All class sectors are displayed
*For any* student's class, the map page should display all sectors belonging to that class
**Validates: Requirements 4.1**

Property 17: Sector missions are retrievable
*For any* sector, selecting it should return all missions associated with that sector
**Validates: Requirements 4.2**

Property 18: Sector data completeness
*For any* sector displayed, it should include both name and type fields
**Validates: Requirements 4.3**

### Mission Properties

Property 19: Mission data completeness
*For any* mission displayed, it should include title, description, xpReward, coinReward, and all stat boost fields
**Validates: Requirements 5.1, 5.2**

Property 20: Photo requirement indication
*For any* mission with requiresPhoto=true, the mission display should indicate that photo proof is required
**Validates: Requirements 5.3**

Property 21: QR requirement indication
*For any* mission with requiresQrCode=true, the mission display should indicate that QR scanning is required
**Validates: Requirements 5.4**

### Submission Properties

Property 22: Photo size validation
*For any* photo upload, files ≤5MB should be accepted and files >5MB should be rejected
**Validates: Requirements 6.1, 17.2**

Property 23: Required photo validation
*For any* mission with requiresPhoto=true, submission attempts without a photo should be rejected
**Validates: Requirements 6.2**

Property 24: Submission initial status
*For any* newly created submission, the status field should be set to 'pending_approval'
**Validates: Requirements 6.3**

Property 25: Submission data completeness
*For any* submission created, it should include missionId, userId, photoUrl (if photo provided), and submittedAt timestamp
**Validates: Requirements 6.4**

Property 26: Photo encoding round-trip
*For any* photo uploaded, encoding it to base64 and then decoding should produce an equivalent image
**Validates: Requirements 17.3, 17.4**

### Teacher Review Properties

Property 27: Pending submissions filtering
*For any* teacher's class, viewing pending submissions should return only submissions with status='pending_approval' from students in that class
**Validates: Requirements 7.1**

Property 28: Approval updates status
*For any* pending submission, approving it should change the status to 'completed'
**Validates: Requirements 7.2**

Property 29: Rejection updates status
*For any* pending submission, rejecting it should change the status to 'rejected'
**Validates: Requirements 7.3**

Property 30: Approval awards XP and coins
*For any* approved submission, the class mascot's XP should increase by the mission's xpReward and coins should increase by the mission's coinReward
**Validates: Requirements 7.4, 8.1, 8.2**

Property 31: Approval applies stat boosts
*For any* approved submission, the class mascot's stats should increase by the mission's boost amounts (thirstBoost, hungerBoost, happinessBoost, cleanlinessBoost), capped at 100
**Validates: Requirements 7.5, 8.4**

### Reward and Progression Properties

Property 32: XP accumulation
*For any* sequence of approved missions, the mascot's total XP should equal the sum of all mission xpRewards
**Validates: Requirements 8.1**

Property 33: Coin accumulation
*For any* sequence of approved missions, the mascot's total coins should equal the sum of all mission coinRewards minus any purchases
**Validates: Requirements 8.2**

Property 34: Level calculation
*For any* mascot XP value, the level should be calculated correctly according to the leveling formula
**Validates: Requirements 8.3**

Property 35: Stat ceiling enforcement
*For any* stat boost applied to a mascot, the resulting stat value should not exceed 100
**Validates: Requirements 8.4**

Property 36: Activity creation on reward
*For any* approved submission, an activity entry should be created with type='mission_completed'
**Validates: Requirements 8.5, 11.1**

### Shop Properties

Property 37: Shop item data completeness
*For any* shop item, it should include name, type, price, and imageUrl fields
**Validates: Requirements 9.1**

Property 38: Purchase deducts coins
*For any* successful purchase, the mascot's coin balance should decrease by exactly the item's price
**Validates: Requirements 9.2**

Property 39: Insufficient coins rejection
*For any* purchase attempt where mascot coins < item price, the purchase should be rejected
**Validates: Requirements 9.3**

Property 40: Duplicate purchase prevention
*For any* item already owned by a class, attempting to purchase it again should be rejected
**Validates: Requirements 9.4**

Property 41: Purchase record completeness
*For any* completed purchase, the purchase record should include userId, itemId, classId, and purchasedAt timestamp
**Validates: Requirements 9.5**

### Wardrobe Properties

Property 42: Hat equipping updates mascot
*For any* owned hat item, equipping it should set the mascot's equippedHat field to that item's ID
**Validates: Requirements 10.1**

Property 43: Accessory equipping updates mascot
*For any* owned accessory item, equipping it should set the mascot's equippedAccessory field to that item's ID
**Validates: Requirements 10.2**

Property 44: Color equipping updates mascot
*For any* owned color item, equipping it should set the mascot's equippedColor field to that item's ID
**Validates: Requirements 10.3**

Property 45: Unowned item equip rejection
*For any* item not owned by a class, attempting to equip it should be rejected
**Validates: Requirements 10.4**

Property 46: Unequip clears slot
*For any* equipped item, unequipping it should set the corresponding equipment slot (equippedHat, equippedAccessory, or equippedColor) to null
**Validates: Requirements 10.5**

### Activity Feed Properties

Property 47: Purchase creates activity
*For any* completed purchase, an activity entry should be created with type='purchase'
**Validates: Requirements 11.2**

Property 48: Activity chronological ordering
*For any* class activity feed, activities should be ordered by createdAt timestamp in descending order (most recent first)
**Validates: Requirements 11.3**

Property 49: Activity data completeness
*For any* activity displayed, it should include content, user name, and createdAt timestamp
**Validates: Requirements 11.4**

Property 50: Activity image display
*For any* activity with a non-null imageUrl, the image should be displayed alongside the activity
**Validates: Requirements 11.5**

### Teacher Dashboard Properties

Property 51: Dashboard data completeness
*For any* teacher accessing their dashboard, the response should include class name, school, class code, mascot stats, and student list
**Validates: Requirements 12.1, 12.2, 12.3**

Property 52: Submission detail completeness
*For any* pending submission viewed by a teacher, it should include student name, mission title, and photo URL
**Validates: Requirements 12.4**

Property 53: Class switching
*For any* teacher with multiple classes, switching to a different class should update the teacher's active classId
**Validates: Requirements 12.5**

### Mission Creation Properties

Property 54: Mission creation validation
*For any* mission creation attempt, it should succeed if and only if sectorId, title, and description are provided
**Validates: Requirements 13.1**

Property 55: Mission reward storage
*For any* created mission, the stored record should include the specified xpReward, coinReward, and all stat boost values
**Validates: Requirements 13.2, 13.5**

Property 56: Mission sector association
*For any* created mission, its sectorId field should match the specified sector
**Validates: Requirements 13.3**

Property 57: Cross-class mission rejection
*For any* teacher attempting to create a mission for a sector not in their class, the creation should be rejected
**Validates: Requirements 13.4**

### CO2 Calculation Properties

Property 58: CO2 calculation consistency
*For any* task type and quantity, calculating CO2 reduction multiple times should produce the same result
**Validates: Requirements 14.1**

Property 59: CO2 response format
*For any* CO2 calculation request, the response should be valid JSON
**Validates: Requirements 14.2**

Property 60: CO2 aggregation
*For any* sequence of completed tasks, the total CO2 reduction should equal the sum of individual task CO2 values
**Validates: Requirements 14.3**

Property 61: Task-specific CO2 factors
*For any* two different task types, their CO2 reduction factors should be different (unless explicitly defined as equal)
**Validates: Requirements 14.4**

### Session Management Properties

Property 62: Session expiration setting
*For any* user login, the created session should have an expiration time of exactly 7 days from creation
**Validates: Requirements 15.1**

Property 63: Session persistence
*For any* created session, it should be stored in Redis/database and retrievable by session ID
**Validates: Requirements 15.2**

Property 64: Logout destroys session
*For any* user logout, the session should be removed from storage and subsequent requests with that session should be unauthorized
**Validates: Requirements 15.3**

Property 65: Expired session rejection
*For any* session past its expiration time, requests using that session should be rejected with 401 Unauthorized
**Validates: Requirements 15.4**

### Data Integrity Properties

Property 66: Entity ID uniqueness
*For any* two entities of the same type created in the system, their IDs should be different
**Validates: Requirements 16.1**

Property 67: Referential integrity enforcement
*For any* entity with a foreign key, attempting to create it with a non-existent reference should be rejected
**Validates: Requirements 16.2**

Property 68: Cascade deletion
*For any* class deletion, all related entities (mascot, sectors, missions, submissions, purchases, activities) should also be deleted
**Validates: Requirements 16.3**

Property 69: Timestamp consistency
*For any* two entities created at the same time, their timestamps should use the same timezone
**Validates: Requirements 16.4**

### File Upload Properties

Property 70: Image format acceptance
*For any* image file in JPEG, PNG, GIF, or WebP format, the upload should be accepted
**Validates: Requirements 17.1**

### Error Handling Properties

Property 71: API error messages
*For any* failed API request, an error message should be displayed to the user
**Validates: Requirements 19.1**

Property 72: Validation error specificity
*For any* form submission with validation errors, each invalid field should have an associated error message
**Validates: Requirements 19.2**

Property 73: Network error handling
*For any* network error, a user-friendly error message should be displayed
**Validates: Requirements 19.3**

Property 74: Success confirmation
*For any* successful operation, a success message should be displayed to the user
**Validates: Requirements 19.4**

Property 75: Error logging completeness
*For any* error logged, the log entry should include timestamp, error message, stack trace, and user context
**Validates: Requirements 19.5**

### Stat Decay Properties

Property 76: Thirst decay rate
*For any* mascot, after a defined time period without watering missions, Thirst should decrease by the configured decay rate
**Validates: Requirements 20.1**

Property 77: Hunger decay rate
*For any* mascot, after a defined time period without feeding missions, Hunger should decrease by the configured decay rate
**Validates: Requirements 20.2**

Property 78: Happiness decay rate
*For any* mascot, after a defined time period without happiness-boosting activities, Happiness should decrease by the configured decay rate
**Validates: Requirements 20.3**

Property 79: Cleanliness decay rate
*For any* mascot, after a defined time period without cleaning missions, Cleanliness should decrease by the configured decay rate
**Validates: Requirements 20.4**

Property 80: Stat floor enforcement
*For any* stat decay applied to a mascot, the resulting stat value should not fall below 0
**Validates: Requirements 20.5**

## Testing Strategy

### TBD