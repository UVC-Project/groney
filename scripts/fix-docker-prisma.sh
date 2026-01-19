#!/bin/bash

# Fix Prisma Client generation in Docker containers
# This script generates Prisma Client in each service container

echo "🔧 Fixing Prisma Client in Docker containers..."

# Services that need Prisma Client
SERVICES=("auth-service" "mission-service" "submission-service")

for SERVICE in "${SERVICES[@]}"; do
  echo "📦 Processing $SERVICE..."
  
  # Install dependencies if needed
  echo "  📥 Installing dependencies..."
  docker exec "groney-$SERVICE" npm install 2>/dev/null
  
  # Generate Prisma Client using the schema directly
  echo "  ⚙️  Generating Prisma Client..."
  docker exec "groney-$SERVICE" npx prisma generate --schema=/app/prisma/schema.prisma 2>&1 || {
    echo "  ⚠️  Failed to generate Prisma Client for $SERVICE"
    continue
  }
  
  echo "  ✅ $SERVICE Prisma Client generated!"
done

echo ""
echo "🔄 Restarting backend services..."
docker restart groney-auth-service groney-mission-service groney-submission-service

echo ""
echo "⏳ Waiting for services to start (5 seconds)..."
sleep 5

echo ""
echo "🔍 Checking service health..."
echo -n "API Gateway: " && curl -s http://localhost:3000/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Auth Service: " && curl -s http://localhost:3001/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Mission Service: " && curl -s http://localhost:3003/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Submission Service: " && curl -s http://localhost:3004/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"

echo ""
echo "🧪 Testing API Gateway routing..."
curl -s -H "x-user-id: test" -H "x-user-role: TEACHER" http://localhost:3000/api/teacher/classes 2>&1 | head -1

echo ""
echo "✨ Done!"
