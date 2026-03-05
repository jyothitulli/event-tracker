#!/bin/bash
echo "🔍 Quick Status Check"
echo "===================="
echo ""
echo "📊 MongoDB Activity Count:"
docker exec event-tracker-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.activities.countDocuments()" activity_db --quiet
echo ""
echo "📦 RabbitMQ Queue:"
docker exec event-tracker-rabbitmq rabbitmqctl list_queues
echo ""
echo "📄 Recent Consumer Logs:"
docker logs event-tracker-consumer --tail 5
