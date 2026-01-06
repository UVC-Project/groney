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
SERVICES=("auth-service" "mascot-engine" "mission-service" "submission-service" "shop-service" "calculation-service" "supply-service")

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
docker restart groney-auth-service groney-mascot-engine groney-mission-service groney-submission-service groney-shop-service groney-calculation-service groney-supply-service 2>/dev/null

echo ""
echo ""
echo "✨ Prisma Client fix applied and services restarted!"
echo "   Run ./scripts/health-check.sh manually after a few seconds to verify status."
