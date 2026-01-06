#!/bin/bash

echo ""
echo "🔍 Checking service health..."
echo -n "API Gateway: " && docker exec groney-api-gateway wget -qO- http://localhost:3000/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Auth Service: " && docker exec groney-auth-service wget -qO- http://localhost:3001/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Mascot Engine: " && docker exec groney-mascot-engine wget -qO- http://localhost:3002/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Mission Service: " && docker exec groney-mission-service wget -qO- http://localhost:3003/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Submission Service: " && docker exec groney-submission-service wget -qO- http://localhost:3004/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Shop Service: " && docker exec groney-shop-service wget -qO- http://localhost:3005/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Calculation Service: " && docker exec groney-calculation-service wget -qO- http://localhost:3006/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"
echo -n "Supply Service: " && docker exec groney-supply-service wget -qO- http://localhost:3007/health | grep -o '"status":"[^"]*"' || echo "❌ Not responding"

echo ""
echo "✨ Done!"
