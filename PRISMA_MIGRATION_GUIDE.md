# Prisma Migration Guide

## What Changed?

The project now uses **Prisma ORM** for all database operations instead of Drizzle ORM.

## Schema Architecture

There is a **single shared schema** at `prisma/schema.prisma` in the project root. All backend services use this same schema:

- No per-service schema files — everything is centralized
- Docker containers get the schema via volume mount (`./prisma:/app/prisma:ro`)
- The shared Prisma client is in `backend/services/shared/prisma.ts`

This means schema changes only need to be made in one place.

## New Launch Procedure

### First Time Setup

**Option 1: Automated (Recommended)**
```bash
./scripts/setup.sh
cd frontend && npm install && npm run dev
```

**Option 2: Manual**
```bash
# 1. Install dependencies
npm install

# 2. Start databases
docker-compose up postgres redis minio -d

# 3. Wait ~10 seconds, then push schema
npm run prisma:push

# 4. Start frontend
cd frontend && npm install && npm run dev
```

### Daily Development

```bash
# Start databases (if not running)
docker-compose up postgres redis minio -d

# Start frontend
cd frontend && npm run dev
```

## Key Differences

### Before (Drizzle)
```bash
npm run db:push  # per service
```

### After (Prisma)
```bash
npm run prisma:push      # development
npm run prisma:migrate   # production
npm run prisma:generate  # after schema changes
npm run prisma:studio    # database GUI
```

## Using Prisma in Services

### Import the Client
```typescript
import prisma from '../shared/prisma';
```

### Example CRUD Operations

```typescript
// Create
const user = await prisma.user.create({
  data: {
    username: 'student1',
    password: 'hashed_password',
    role: 'STUDENT',
    classId: 'class-id',
  },
});

// Read
const users = await prisma.user.findMany({
  where: { classId: 'class-id' },
  include: { class: true },
});

// Update
await prisma.mascot.update({
  where: { classId: 'class-id' },
  data: { thirst: 90, xp: 150 },
});

// Delete
await prisma.submission.delete({
  where: { id: 'submission-id' },
});
```

## Database Schema

All models are defined in `prisma/schema.prisma`:
- User (students & teachers)
- Class (with unique codes)
- Mascot (health stats)
- Sector (schoolyard areas)
- Mission (tasks)
- Submission (proof of work)
- ShopItem & Purchase
- Activity (feed)

## Troubleshooting

### Database not ready
```bash
# Wait a few seconds after starting docker-compose
docker exec groney-postgres pg_isready -U groney_user -d groney
```

### Schema out of sync
```bash
npm run prisma:push
```

### Need to reset database
```bash
docker-compose down -v  # removes volumes
docker-compose up postgres -d
npm run prisma:push
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
