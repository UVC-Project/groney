# Groeny Gameloop Implementation

## Overview

This PR implements the core gameloop functionality for Groeny, the schoolyard mascot. The gameloop manages Groeny's 4 needs (Thirst, Hunger, Happiness, Cleanliness), their decay over time, level progression, and teacher customization options.

## Features Implemented

### 1. Stat Decay System

**How it works:**
- Stats decay only during school hours (8am-4pm, Monday-Friday)
- Uses "lazy evaluation" - decay is calculated when mascot data is fetched, not via background jobs
- Each stat has a configurable decay rate (points per hour)

**Default decay rates:**
| Stat | Rate | Reasoning |
|------|------|-----------|
| Thirst | 1.0/hr | Plants don't need constant watering |
| Hunger | 2.0/hr | Medium - feeding animals, garden care |
| Happiness | 3.0/hr | Fastest - needs constant attention |
| Cleanliness | 2.0/hr | Medium - keeping schoolyard clean |

**Implementation:** `backend/services/mascot-engine/src/gameloop.ts`

### 2. Level Progression

**XP Thresholds:**
| Level | Total XP Required |
|-------|-------------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 |
| 4 | 500 |
| 5 | 1,000 |
| 6 | 2,000 |
| 7 | 3,500 |
| 8 | 5,500 |
| 9 | 8,000 |
| 10 | 11,000 (max) |

- Level-ups are detected when missions are approved
- Activity feed entry created on level-up

### 3. Groeny Health States

Based on average of all 4 stats:
| Health % | State | Visual |
|----------|-------|--------|
| 51-100% | Normal | 😊 Happy Groeny |
| 25-50% | Sad | 😢 Sad Groeny |
| 1-24% | Sick | 🤒 Sick Groeny |

### 4. Teacher Customization

Teachers can customize decay rates per class via the Settings tab:
- Slider controls for each stat (0-10 pts/hour)
- "Restore Defaults" button
- Changes saved per mascot in database

### 5. Real-time Updates

Homepage polls mascot data every 5 seconds for live stat updates without page refresh.

---

## Files Changed

### Backend

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added decay rate fields to Mascot model |
| `backend/services/mascot-engine/src/gameloop.ts` | **NEW** - Core gameloop logic |
| `backend/services/mascot-engine/src/start.ts` | Added mascot API endpoints with decay |
| `backend/services/mascot-engine/package.json` | Fixed Prisma schema path for Docker |
| `backend/services/mascot-engine/.env` | **NEW** - Environment config |
| `backend/services/submission-service/src/routes/teacher.routes.ts` | Added level-up detection |
| `backend/services/api-gateway/src/routes/teacherRoutes.ts` | Added mascot-engine proxy route |

### Frontend

| File | Changes |
|------|---------|
| `frontend/src/routes/+page.ts` | Fetch from mascot-engine, fixed auth |
| `frontend/src/routes/+page.svelte` | Live polling, real stats display |
| `frontend/src/routes/teacher/+page.svelte` | Settings tab with decay rate controls |
| `frontend/src/lib/config.ts` | Added MASCOT_ENGINE_URL |

---

## API Endpoints (Mascot Engine)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mascot/:classId` | Get mascot with decay applied |
| GET | `/api/mascot/by-user/:userId` | Get mascot by user ID |
| PATCH | `/api/mascot/:classId/decay-rates` | Update decay rates |
| POST | `/api/mascot/:classId/boost` | Boost stats (mission rewards) |
| GET | `/api/level-info` | Get level thresholds |
| POST | `/api/debug/reset/:classId` | Reset stats to 100% (debug only) |
| POST | `/api/debug/reset-all` | Reset all mascots (debug only) |

---

## Debug Mode

For testing, enable debug mode in `gameloop.ts`:

```typescript
export const DEBUG_MODE = true;        // Enable fast decay
export const DEBUG_DECAY_MULTIPLIER = 1000;  // 1 min = ~16 hours
```

Debug features:
- Bypasses school hours restriction
- Accelerated decay for testing
- Reset endpoints available

---

## Database Changes

New fields in `mascots` table:
```sql
thirstDecayRate      FLOAT DEFAULT 1.0
hungerDecayRate      FLOAT DEFAULT 2.0
happinessDecayRate   FLOAT DEFAULT 3.0
cleanlinessDecayRate FLOAT DEFAULT 2.0
```

Run migration:
```bash
npx prisma db push
```

---

## Testing

1. Start Docker stack: `docker-compose up --build -d`
2. Enable debug mode in `gameloop.ts`
3. Open homepage - stats should decrease every 5 seconds
4. Use reset endpoint to restore: `curl -X POST http://localhost:3002/api/debug/reset-all`

---

## What's Next

### Immediate TODO
- [ ] Add sad/sick Groeny GIF assets
- [ ] Mission cooldowns (prevent spam completing)
- [ ] Notifications when stats get low

### Future Enhancements
- [ ] WebSocket for true real-time updates (instead of polling)
- [ ] Push notifications for critical stat levels
- [ ] Seasonal events affecting decay rates
- [ ] Achievements/badges for maintaining healthy Groeny
- [ ] Class leaderboard based on Groeny health
- [ ] CO2 impact calculations (calculation-service)
- [ ] Historical stats tracking/graphs

---

## Architecture Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend  │────▶│   API Gateway   │────▶│ Mascot Engine│
│  (Svelte)   │     │   (port 3000)   │     │  (port 3002) │
└─────────────┘     └─────────────────┘     └──────────────┘
      │                                            │
      │ Direct call (dev)                          │
      └────────────────────────────────────────────┘
                                                   │
                                            ┌──────▼──────┐
                                            │  PostgreSQL │
                                            │   Database  │
                                            └─────────────┘
```

---

## Notes

- Decay uses "lazy evaluation" pattern - no cron jobs needed
- `lastDecayAt` timestamp tracks when decay was last applied
- Stats are capped at 0-100
- Teacher customization stored per mascot (per class)

## Mission Cooldowns

### Overview

Mission cooldowns prevent the same mission from being exploited repeatedly. Cooldowns are **class-wide** - if one student completes "Water the Roses", the mission goes on cooldown for the entire class (because the roses are already watered!).

Each mission can have:
- **Cooldown period**: Hours before ANYONE in the class can redo the mission
- **Max completions**: Optional limit on total times the class can complete the mission

### Database Schema

Added to `Mission` model in `prisma/schema.prisma`:
```prisma
cooldownHours   Int      @default(24)  // Hours before class can redo mission
maxCompletions  Int?     // Optional max completions (null = unlimited)
category        MissionCategory @default(THIRST)
```

### Backend Implementation

**Student Routes** (`mission-service/src/routes/student.routes.ts`):
- `getMissionCooldownStatus()` - Calculates if mission is available (class-wide)
- `/api/student/sectors` - Returns mission status per mission
- `/api/student/missions/:missionId/accept` - Validates cooldown and "taken" status before accepting
- `/api/student/my-missions` - Returns user's active (pending) missions

**Teacher Routes** (`mission-service/src/routes/teacher.routes.ts`):
- Mission creation accepts `cooldownHours`, `maxCompletions`, `category`

### Frontend Implementation

**Teacher Dashboard** (`frontend/src/routes/teacher/+page.svelte`):
- Mission creation dialog includes:
  - Category dropdown (Thirst, Hunger, Happiness, Cleanliness)
  - Cooldown hours input (0-168 hours, default 24)
  - Max completions input (optional, leave empty for unlimited)

### Mission Status Response

Each mission now includes a `missionStatus` field:

| Status | Description |
|--------|-------------|
| `available` | Mission can be accepted |
| `my_active` | Current user has accepted this mission (pending submission) |
| `taken` | Another student is currently doing this mission |
| `cooldown` | Mission was recently completed, waiting for cooldown |
| `max_reached` | Mission has been completed the maximum number of times |

```typescript
{
  missionStatus: 'available' | 'my_active' | 'taken' | 'cooldown' | 'max_reached',
  cooldownStatus: {
    available: boolean,
    reason: 'cooldown' | 'max_completions' | null,
    completionCount: number,
    maxCompletions: number | null,
    cooldownEndsAt: string | null,
    hoursRemaining: number | null
  },
  myPendingSubmissionId: string | null,
  takenBy: { firstName: string, lastName: string } | null
}
```

---

## Student Mission Flow

### Map View (`frontend/src/routes/map/+page.svelte`)

1. **Mission List Sorting**: Missions are displayed in priority order:
   - 📋 Your active missions (blue highlight)
   - 🎯 Available missions
   - 🔒 Taken by classmate (grayed out)
   - ⏱️ On cooldown (grayed out)
   - ✅ Max completions reached (grayed out)

2. **Mission Cards**: Each card shows:
   - Status badge (if not available)
   - Title, description, rewards
   - Stat boosts
   - Action hint ("Tap to start" or "Tap to submit")

3. **Mission Modal**: Shows different actions based on status:
   - **Available**: "Accept Mission" button
   - **My Active**: "Submit Photo" button (coming soon)
   - **Taken/Cooldown/Max**: Disabled with explanation

4. **Class-wide Locking**: When a student accepts a mission:
   - Mission shows as "Taken by [Name]" for other students
   - Other students cannot accept until submission is completed/rejected

### StudentMap Component (`frontend/src/lib/components/StudentMap.svelte`)

- Header shows count of user's active missions
- Missions sorted by status priority
- Unavailable missions are visually dimmed and not clickable
- Status badges on each mission card

---

## Files Modified

### Backend
- `prisma/schema.prisma` - Added decay rates to Mascot, cooldown fields to Mission
- `backend/services/mascot-engine/src/gameloop.ts` - Core decay logic
- `backend/services/mascot-engine/src/start.ts` - API endpoints
- `backend/services/mission-service/src/routes/student.routes.ts` - Mission status, cooldown logic, class-wide locking
- `backend/services/mission-service/src/routes/teacher.routes.ts` - Mission creation with cooldowns
- `backend/services/submission-service/src/routes/teacher.routes.ts` - Level-up detection
- All service `package.json` files - Fixed Prisma schema path for Docker

### Frontend
- `frontend/src/routes/+page.svelte` - Live polling, real stats display
- `frontend/src/routes/teacher/+page.svelte` - Settings tab, mission cooldown fields
- `frontend/src/routes/map/+page.svelte` - Mission modal with status-based actions
- `frontend/src/lib/components/StudentMap.svelte` - Mission sorting, status badges, active count

---

## Deployment Steps

1. Start Docker Desktop
2. Push schema changes: `npx prisma db push`
3. Rebuild containers: `docker-compose up --build -d`

The services will regenerate Prisma client on startup with the new schema.
