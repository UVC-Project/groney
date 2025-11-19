# Green Schoolyard Gamification Platform (Groeny)

A gamified platform for Dutch primary schools to engage students in green schoolyard maintenance through a Tamagotchi-style digital mascot named "Groeny".

## ⚡ Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd groney
cp .env.example .env

# 2. Choose your approach:

# Option A: Lightweight (Recommended - 500MB RAM)
docker-compose up postgres redis minio -d
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

# 3. Install root dependencies (optional)
npm install
```

### Choose Your Development Approach

#### Option 1: Full Stack with Docker (⚠️ Uses ~5GB RAM)

**Note**: Backend services are scaffolded but not fully implemented yet. Only basic health checks work.

```bash
# Start all services (first build takes 5-10 minutes)
docker-compose up

# Or run in background
docker-compose up -d

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
docker-compose up postgres redis minio

# Terminal 2: Run frontend locally
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