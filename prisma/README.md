# Prisma Setup

This project uses Prisma ORM for database management.

## Single Shared Schema

This is the **only** Prisma schema in the project. All backend services share this schema:
- Schema file: `prisma/schema.prisma` (this folder)
- Shared client: `backend/services/shared/prisma.ts`
- Docker: The root `prisma/` folder is mounted into each container

There are no per-service schema files — all schema changes happen here.

## Quick Start

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Create and Apply Migrations
```bash
npm run prisma:migrate
```

### Push Schema to Database (without migrations)
```bash
npm run prisma:push
```

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

## Usage in Services

Import the Prisma client in your services:

```typescript
import prisma from '../shared/prisma';

// Example: Get all users
const users = await prisma.user.findMany();

// Example: Create a new class
const newClass = await prisma.class.create({
  data: {
    name: 'Class 5B',
    school: 'Green Elementary',
    classCode: 'ABC123',
    teacherId: 'teacher-id',
  },
});

// Example: Update mascot stats
await prisma.mascot.update({
  where: { classId: 'class-id' },
  data: {
    thirst: 90,
    hunger: 85,
    xp: 150,
  },
});
```

## Database Schema

The schema includes the following models:
- **User**: Students and teachers
- **Class**: Class groups with unique codes
- **Mascot**: Digital mascot with stats (Thirst, Hunger, Happiness, Cleanliness)
- **Sector**: Schoolyard areas (Trees, Flowers, Pond, Chickens, Garden)
- **Mission**: Maintenance tasks with rewards
- **Submission**: Proof of work submissions
- **ShopItem**: Cosmetic items for purchase
- **Purchase**: Item ownership records
- **Activity**: Activity feed entries

## Environment Variables

Make sure your `.env` file contains:
```
DATABASE_URL=postgresql://groney_user:groney_password@localhost:5432/groney
```
