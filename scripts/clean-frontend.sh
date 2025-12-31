#!/bin/bash
# Script to fully clean and rebuild the frontend container
# This removes the anonymous volume that caches old node_modules

echo "Stopping frontend container..."
docker-compose stop frontend

echo "Removing frontend container..."
docker-compose rm -f frontend

echo "Removing anonymous volumes for frontend..."
# Find and remove the anonymous volume for frontend node_modules
docker volume ls -q | xargs -I {} docker volume inspect {} 2>/dev/null | \
  grep -B5 '"Mountpoint".*groney-frontend' | grep '"Name"' | \
  cut -d'"' -f4 | xargs -r docker volume rm 2>/dev/null

echo "Rebuilding frontend without cache..."
docker-compose build --no-cache frontend

echo "Starting frontend..."
docker-compose up -d frontend

echo "Done! Wait a few seconds then do a hard refresh (Cmd+Shift+R) in your browser."
