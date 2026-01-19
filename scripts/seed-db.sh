#!/bin/bash

echo "🌱 Seeding the database..."
# Use tsx to execute the typescript seed file directly inside the container
docker exec groney-auth-service npx tsx /app/prisma/seed.ts

if [ $? -eq 0 ]; then
  echo "✅ Database seeded successfully!"
else
  echo "❌ Database seeding failed."
  exit 1
fi
