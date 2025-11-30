# Green Schoolyard Gamification Platform (Groeny)

A gamified platform for Dutch primary schools to engage students in green schoolyard maintenance through a Tamagotchi-style digital mascot named "Groeny".

## ⚡ Quick Start

### Automated Setup (Recommended)

```bash
git clone <repository-url>
cd groney
./scripts/setup.sh
cd frontend && npm install && npm run dev
```

### Manual Setup

```bash
# 1. Clone and setup
git clone <repository-url>
cd groney
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start database and run migrations
docker-compose up postgres redis minio -d
npm run prisma:push  # or prisma:migrate for production

# 4. Choose your approach:

# Option A: Lightweight (Recommended - 500MB RAM)
cd frontend && npm install && npm run dev

# Option B: Full stack (5GB RAM)
docker-compose up
```

**That's it!** Frontend runs at http://localhost:5173

## 📁 Project Structure

```
.
├── frontend/                 # SvelteKit 5 frontend (✅ Implemented)
├── backend/services/         # Microservices (🚧 In Progress)
│   ├── api-gateway/         # API Gateway with routing
│   ├── auth-service/        # Authentication and user management
│   ├── mascot-engine/       # Mascot stats and interactions
│   ├── mission-service/     # Missions, sectors, and activities
│   ├── submission-service/  # Photo uploads and submissions
│   ├── shop-service/        # Shop items and purchases
│   └── calculation-service/ # CO2 impact calculations
├── GreenSchoolyardICT/      # Legacy monolithic app (prototype)
└── docker-compose.yml       # Docker orchestration
```

## 🚀 Getting Started for New Developers

### Prerequisites

- **Docker & Docker Compose** (for running services)
- **Node.js 20+** and **npm 10+** (for local development)
- **Git** (for version control)

### First-Time Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd groney

# 2. Copy environment variables
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Start database services
docker-compose up postgres redis minio -d

# 5. Wait for database to be ready (about 10 seconds)
# Then push Prisma schema to database
npm run prisma:push

# 6. (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### Choose Your Development Approach

#### Option 1: Full Stack with Docker (⚠️ Uses ~5GB RAM)

```bash
# Start all services (first build takes 5-10 minutes)
docker-compose up -d

# IMPORTANT: After first start, generate Prisma Client in containers
./scripts/fix-docker-prisma.sh

# Or manually for each service that uses Prisma:
docker exec groney-auth-service npx prisma generate --schema=/app/prisma/schema.prisma
docker exec groney-mission-service npx prisma generate --schema=/app/prisma/schema.prisma
docker exec groney-submission-service npx prisma generate --schema=/app/prisma/schema.prisma

# Restart services after generating
docker-compose restart auth-service mission-service submission-service

# Stop all services
docker-compose down
```

**Services will be available at:**
- 🎨 Frontend: http://localhost:5173
- 🚪 API Gateway: http://localhost:3000
- 🗄️ PostgreSQL: localhost:5432
- 🔴 Redis: localhost:6379
- 📦 MinIO Console: http://localhost:9001 (login: minioadmin/minioadmin)

#### Option 2: Lightweight Development (✅ Recommended - Uses ~500MB RAM)

Run only the infrastructure and develop locally:

```bash
# Terminal 1: Start only databases
docker-compose up postgres redis minio -d

# Terminal 2: Push database schema (first time only)
npm run prisma:push

# Terminal 3: Run frontend locally
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:5173

## 🛠️ Development Workflow

### Daily Development

```bash
# Start infrastructure (if not already running)
docker-compose up postgres redis minio -d

# Work on frontend
cd frontend
npm run dev

# Work on a specific backend service (when implemented)
cd backend/services/auth-service
npm install
npm run dev
```

### Database Management with Prisma

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Push schema changes to database (development)
npm run prisma:push

# Create and apply migrations (production-ready)
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

**When to use what:**
- `prisma:push` - Quick prototyping, development (no migration history)
- `prisma:migrate` - Production, team collaboration (creates migration files)
- `prisma:generate` - After pulling schema changes from git

### Testing

```bash
# Frontend tests
cd frontend
npm test -- --run

# Run all workspace tests
npm test

# Watch mode for development
cd frontend
npm test
```

### Code Quality

```bash
# Lint and format
cd frontend
npm run lint
npm run check

# Type checking
npm run check
```

### Building for Production

```bash
# Build all services
docker-compose build

# Build frontend only
cd frontend
npm run build
```

## 🐳 Docker Troubleshooting

### Prisma Client Issues in Docker

If backend services fail with Prisma errors after `docker-compose up`:

```bash
# Run the fix script (generates Prisma Client in all containers)
./scripts/fix-docker-prisma.sh

# Or manually regenerate for a specific service
docker exec groney-auth-service npx prisma generate --schema=/app/prisma/schema.prisma
docker restart groney-auth-service
```

### Check Service Health

```bash
# Verify all services are running
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Mascot Engine
curl http://localhost:3003/health  # Mission Service
curl http://localhost:3004/health  # Submission Service
curl http://localhost:3005/health  # Shop Service
curl http://localhost:3006/health  # Calculation Service
```

### View Service Logs

```bash
# View logs for a specific service
docker logs groney-auth-service --tail 50

# Follow logs in real-time
docker logs -f groney-auth-service
```