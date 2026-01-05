#!/bin/bash

# 1. Configuration
PROJECT_NAME="Groney"

echo "🚀 Starting deployment for $PROJECT_NAME on Oracle VM..."
echo "🔐 Fetching secrets from OCI Vault..."

# 2. Fetch secrets using utility script
echo "🔐 Fetching secrets..."
SECRET_CONTENT=$(./scripts/get-secrets.sh)

if [ -z "$SECRET_CONTENT" ]; then
    echo "❌ Error: Could not fetch secrets. Make sure OCI CLI is configured or running on an OCI Instance with proper permissions."
    exit 1
fi

# 3. Inject secrets into the Shell Environment
echo "📦 Processing secrets..."
set -a
eval "$SECRET_CONTENT"
set +a

echo "   -> HOST_NAME is now: $HOST_NAME"
if [ ! -z "$POSTGRES_PASSWORD" ]; then
    echo "   -> POSTGRES_PASSWORD detected."
fi

echo "✅ Secrets injected into RAM."

# 4. Pre-deployment Backup (Safety first!)
# Only backup if the postgres container is already running
if [ "$(docker ps -q -f name=groney-postgres)" ]; then
    echo "🛡️  Database running. (Backup script not implemented yet, skipping backup step)"
    # ./scripts/backup-db.sh "pre-deploy-"
else
    echo "ℹ️  Postgres not running (initial deploy?). Skipping safety backup."
fi

# 5. Clean up old resources (Saves disk space on Always Free Tier)
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# 6. Launch the Docker Stack
# We use '--profile prod' to ensure the Cloudflare Tunnel starts
echo "🚀 Launching Production Stack for $PROJECT_NAME (App + DB + Redis + Tunnel)..."
docker compose --profile prod up -d --build

# 7. Fix Prisma Client (Shared Volume compatibility)
echo "🔧 Running Prisma Client fix..."
./scripts/fix-docker-prisma.sh


echo "🌐 Deployment Complete!"
echo "Check status with: docker compose ps"