#!/bin/bash

echo "🌱 Green Schoolyard Gamification - Setup Script"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "⚠️  Docker is not running. Please start Docker and run this script again."
    exit 1
fi

# Start database services
echo ""
echo "🐘 Starting database services (PostgreSQL, Redis, MinIO)..."
docker-compose up postgres redis minio -d

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is ready
until docker exec groney-postgres pg_isready -U groney_user -d groney > /dev/null 2>&1; do
    echo "   Still waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready"

# Push Prisma schema
echo ""
echo "🗄️  Pushing Prisma schema to database..."
npm run prisma:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start frontend: cd frontend && npm install && npm run dev"
echo "  2. Open browser: http://localhost:5173"
echo "  3. (Optional) View database: npm run prisma:studio"
echo ""
echo "For full stack with Docker:"
echo "  1. docker-compose up -d"
echo "  2. ./scripts/fix-docker-prisma.sh  # Generate Prisma Client in containers"
echo ""
