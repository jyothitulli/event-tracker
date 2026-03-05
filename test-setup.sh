#!/bin/bash

echo "🔍 Testing Event Tracker Setup"
echo "================================"

# Test 1: Check if Node.js is installed
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node --version) installed"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Test 2: Check if Docker is installed
echo "🐳 Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker --version) installed"
else
    echo "❌ Docker not found"
    exit 1
fi

# Test 3: Check if Docker Compose is installed
echo "📦 Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose $(docker-compose --version) installed"
else
    echo "❌ Docker Compose not found"
    exit 1
fi

# Test 4: Check if ports are available
echo "🔌 Checking port availability..."
if lsof -Pi :5672 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Port 5672 (RabbitMQ) is in use"
else
    echo "✅ Port 5672 is free"
fi

if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Port 27017 (MongoDB) is in use"
else
    echo "✅ Port 27017 is free"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Port 3000 (API) is in use"
else
    echo "✅ Port 3000 is free"
fi

echo ""
echo "📝 Next steps:"
echo "1. Run 'npm install' in both api/ and consumer/ directories"
echo "2. Run 'docker-compose up -d' to start services"
echo "3. Run 'npm run test:all' to run all tests"
echo ""
echo "Setup verification complete! 🚀"