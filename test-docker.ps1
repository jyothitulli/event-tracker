Write-Host "🐳 Testing Docker Setup for Event Tracker" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Test 1: Check if Docker is running
Write-Host "`n1️⃣ Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "   Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
    exit 1
}

# Test 2: Check if Docker Compose is available
Write-Host "`n2️⃣ Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose is available: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found" -ForegroundColor Red
    exit 1
}

# Test 3: Stop any existing containers
Write-Host "`n3️⃣ Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down -v
Write-Host "✅ Cleanup completed" -ForegroundColor Green

# Test 4: Build and start containers
Write-Host "`n4️⃣ Building and starting containers..." -ForegroundColor Yellow
Write-Host "   This will take a few minutes first time..." -ForegroundColor Gray
docker-compose up -d --build

# Test 5: Wait for services to be healthy
Write-Host "`n5️⃣ Waiting for services to be healthy (60 seconds)..." -ForegroundColor Yellow
$timeout = 60
$elapsed = 0
while ($elapsed -lt $timeout) {
    $status = docker-compose ps --format json | ConvertFrom-Json
    $allHealthy = $true
    foreach ($service in $status) {
        if ($service.Health -ne "healthy") {
            $allHealthy = $false
        }
    }
    if ($allHealthy) {
        Write-Host "✅ All services are healthy!" -ForegroundColor Green
        break
    }
    Write-Host "   Waiting... ($elapsed seconds)" -ForegroundColor Gray
    Start-Sleep -Seconds 5
    $elapsed += 5
}

# Test 6: Show container status
Write-Host "`n6️⃣ Container Status:" -ForegroundColor Yellow
docker-compose ps

# Test 7: Test API health endpoint
Write-Host "`n7️⃣ Testing API Health..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "✅ API is healthy (Status: 200)" -ForegroundColor Green
    } else {
        Write-Host "❌ API returned status: $($healthCheck.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot connect to API. Make sure it's running." -ForegroundColor Red
}

# Test 8: Test RabbitMQ Management UI
Write-Host "`n8️⃣ Testing RabbitMQ Management UI..." -ForegroundColor Yellow
try {
    $rabbitCheck = Invoke-WebRequest -Uri "http://localhost:15672" -UseBasicParsing
    if ($rabbitCheck.StatusCode -eq 200) {
        Write-Host "✅ RabbitMQ UI is accessible at http://localhost:15672" -ForegroundColor Green
        Write-Host "   Login: guest / guest" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ RabbitMQ UI not yet accessible (might still be starting)" -ForegroundColor Yellow
}

# Test 9: Test MongoDB Express UI
Write-Host "`n9️⃣ Testing MongoDB Express UI..." -ForegroundColor Yellow
try {
    $mongoCheck = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing
    if ($mongoCheck.StatusCode -eq 200) {
        Write-Host "✅ MongoDB Express is accessible at http://localhost:8081" -ForegroundColor Green
        Write-Host "   Login: admin / admin123" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ MongoDB Express not yet accessible (might still be starting)" -ForegroundColor Yellow
}

# Test 10: Show logs
Write-Host "`n🔍 Recent logs (last 20 lines each):" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

Write-Host "`n📋 API Logs:" -ForegroundColor Yellow
docker-compose logs --tail=20 api

Write-Host "`n📋 Consumer Logs:" -ForegroundColor Yellow
docker-compose logs --tail=20 consumer

Write-Host "`n📋 RabbitMQ Logs:" -ForegroundColor Yellow
docker-compose logs --tail=20 rabbitmq

Write-Host "`n📋 MongoDB Logs:" -ForegroundColor Yellow
docker-compose logs --tail=20 mongodb

Write-Host "`n✨ Docker setup test completed!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Access RabbitMQ UI: http://localhost:15672 (guest/guest)" -ForegroundColor White
Write-Host "2. Access MongoDB Express: http://localhost:8081 (admin/admin123)" -ForegroundColor White
Write-Host "3. Test API: curl http://localhost:3000/health" -ForegroundColor White
Write-Host "4. View all logs: docker-compose logs -f" -ForegroundColor White
Write-Host "5. Stop services: docker-compose down" -ForegroundColor White