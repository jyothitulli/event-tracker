#!/bin/bash
echo "🚦 Testing Rate Limiting (50 per minute)"
echo "========================================"

for i in {1..55}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3000/api/v1/activities \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user-$i\",\"eventType\":\"test\",\"timestamp\":\"2026-03-05T18:10:00Z\",\"payload\":{\"count\":$i}}")
  
  if [ $i -le 50 ]; then
    echo "Request $i: $STATUS (should be 202)"
  else
    echo "Request $i: $STATUS (should be 429)"
  fi
  
  sleep 0.1
done
