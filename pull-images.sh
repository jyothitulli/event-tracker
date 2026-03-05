#!/bin/bash

echo "Pulling Docker images for Event Tracker..."
echo "========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Pulling RabbitMQ (small)...${NC}"
if docker pull rabbitmq:3-management-alpine; then
    echo -e "${GREEN}✅ RabbitMQ pulled${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -e "\n${YELLOW}2. Pulling mongo-express (small)...${NC}"
if docker pull mongo-express:latest; then
    echo -e "${GREEN}✅ mongo-express pulled${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -e "\n${YELLOW}3. Pulling MongoDB (large - this may take time)...${NC}"
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempt $((RETRY_COUNT+1)) of $MAX_RETRIES..."
    if docker pull mongo:latest; then
        echo -e "${GREEN}✅ MongoDB pulled${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}Retrying in 10 seconds...${NC}"
            sleep 10
        else
            echo -e "${RED}❌ Failed after $MAX_RETRIES attempts${NC}"
        fi
    fi
done

echo -e "\n${GREEN}Done!${NC}"