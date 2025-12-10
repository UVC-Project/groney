#!/bin/bash

# Fix Prisma Client generation in Docker containers
# This script generates Prisma Client in each service container
#
# NOTE: The root prisma/ folder is mounted into each container at /app/prisma
# via docker-compose volumes. There are no per-service schema files.

echo "🔧 Fixing Prisma Client in Docker containers..."
echo ""
echo "ℹ️  Using shared schema from root prisma/ folder"
echo "   (mounted at /app/prisma in each container)"
echo ""

# All services that use Prisma
SERVICES=("auth-service" "mascot-engine" "mission-service" "submission-service" "shop-service" "calculation-service")

for SERVICE in "${SERVICES[@]}"; do
  CONTAINER="groney-$SERVICE"
  
  # Check if container is running
  if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    echo "⏭️  Skipping $SERVICE (container not running)"
    continue
  fi
  
  echo "📦 Processing $SERVICE..."
  
  # Generate Prisma Client using the mounted schema
  docker exec "$CONTAINER" npx prisma generate --schema=/app/prisma/schema.prisma 2>&1 || {
    echo "  ⚠️  Failed to generate Prisma Client for $SERVICE"
    continue
  }
  
  echo "  ✅ $SERVICE Prisma Client generated!"
done

echo ""
echo "🔄 Restarting backend services..."
docker restart groney-auth-service groney-mascot-engine groney-mission-service groney-submission-service groney-shop-service groney-calculation-service 2>/dev/null

echo ""
echo "⏳ Waiting for services to start (5 seconds)..."
sleep 5

echo ""
echo "🔍 Checking service health..."
echo -n "API Gateway: " && curl -s http://localhost:3000/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Auth Service: " && curl -s http://localhost:3001/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Mascot Engine: " && curl -s http://localhost:3002/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Mission Service: " && curl -s http://localhost:3003/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Submission Service: " && curl -s http://localhost:3004/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Shop Service: " && curl -s http://localhost:3005/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Calculation Service: " && curl -s http://localhost:3006/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"

echo ""
echo "✨ Done!"
