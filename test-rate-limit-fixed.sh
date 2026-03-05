#!/bin/bash
echo "🚦 Testing Rate Limiting (50 per minute)"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

for i in {1..55}; do
  # Make request and capture status code and response body
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST http://localhost:3000/api/v1/activities \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user-$i\",\"eventType\":\"rate_test\",\"timestamp\":\"2026-03-05T18:10:00Z\",\"payload\":{\"count\":$i}}")
  
  # Split response and status code
  BODY=$(echo "$RESPONSE" | head -n 1)
  STATUS=$(echo "$RESPONSE" | tail -n 1)
  
  if [ $i -le 50 ]; then
    if [ "$STATUS" == "202" ]; then
      echo -e "Request $i: ${GREEN}$STATUS (Accepted)${NC}"
    else
      echo -e "Request $i: ${RED}$STATUS (Expected 202)${NC}"
    fi
  else
    if [ "$STATUS" == "429" ]; then
      echo -e "Request $i: ${GREEN}$STATUS (Rate Limited)${NC}"
    else
      echo -e "Request $i: ${RED}$STATUS (Expected 429)${NC}"
    fi
  fi
  
  sleep 0.2
done

echo ""
echo "📊 Rate limiting test complete!"
