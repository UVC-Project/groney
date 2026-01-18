#!/bin/bash

echo "🔄 Running Prisma migrations..."
# We use the auth-service container to run migrations since it has direct DB access and the schema mounted
docker exec groney-auth-service npx prisma migrate deploy --schema=/app/prisma/schema.prisma

if [ $? -eq 0 ]; then
  echo "✅ Migrations applied successfully!"
else
  echo "❌ Migration failed."
  exit 1
fi

echo "🔄 Aligning schema (db push)..."
docker exec groney-auth-service npx prisma db push --schema=/app/prisma/schema.prisma --skip-generate
