#!/bin/bash

echo "🚦 Testing Rate Limiting (50 per minute)"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# First, let's check current rate limit status
echo -e "${YELLOW}Current Rate Limit Status:${NC}"
curl -s -I http://localhost:3000/api/v1/activities | grep -i "x-rate"
echo ""

echo -e "${YELLOW}Sending 55 requests...${NC}"
echo ""

# Arrays to store results
declare -a statuses
declare -a remaining

for i in {1..55}; do
  # Make request and capture response with status code
  response=$(curl -s -w "\n%{http_code}" \
    -X POST http://localhost:3000/api/v1/activities \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user-$i\",\"eventType\":\"rate_test\",\"timestamp\":\"2026-03-05T18:10:00Z\",\"payload\":{\"count\":$i}}")
  
  # Split response body and status code
  body=$(echo "$response" | head -n 1)
  status=$(echo "$response" | tail -n 1)
  
  statuses[$i]=$status
  
  # Get rate limit headers for first few requests
  if [ $i -le 3 ] || [ $i -ge 50 ]; then
    headers=$(curl -s -I -X POST http://localhost:3000/api/v1/activities \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"user-$i\",\"eventType\":\"rate_test\",\"timestamp\":\"2026-03-05T18:10:00Z\",\"payload\":{\"count\":$i}}" \
      | grep -i "x-rate" | tr -d '\r')
    remaining[$i]=$(echo "$headers" | grep "X-RateLimit-Remaining" | cut -d' ' -f2)
  fi
  
  # Display result with color
  if [ $i -le 50 ]; then
    if [ "$status" == "202" ]; then
      echo -e "Request $i: ${GREEN}$status (Accepted)${NC} Remaining: ${remaining[$i]:-N/A}"
    else
      echo -e "Request $i: ${RED}$status (Expected 202)${NC} Remaining: ${remaining[$i]:-N/A}"
    fi
  else
    if [ "$status" == "429" ]; then
      echo -e "Request $i: ${GREEN}$status (Rate Limited)${NC} Remaining: ${remaining[$i]:-N/A}"
    else
      echo -e "Request $i: ${RED}$status (Expected 429)${NC} Remaining: ${remaining[$i]:-N/A}"
    fi
  fi
  
  sleep 0.2
done

echo ""
echo "📊 Summary:"
echo "=========="

# Count status codes
success_count=0
rate_limited_count=0
for status in "${statuses[@]}"; do
  if [ "$status" == "202" ]; then
    ((success_count++))
  elif [ "$status" == "429" ]; then
    ((rate_limited_count++))
  fi
done

echo -e "✅ Successful (202): $success_count"
echo -e "⏱️  Rate Limited (429): $rate_limited_count"

if [ $success_count -eq 50 ] && [ $rate_limited_count -eq 5 ]; then
  echo -e "\n${GREEN}✅ Rate limiting is working correctly!${NC}"
else
  echo -e "\n${RED}❌ Rate limiting is not working as expected${NC}"
  echo "Expected: 50 successful, 5 rate limited"
  echo "Got: $success_count successful, $rate_limited_count rate limited"
fi
