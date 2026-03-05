@echo off
echo 🐳 Testing Docker Setup for Event Tracker
echo =========================================

REM Step 1: Check Docker
echo.
echo 1️⃣ Checking Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do echo ✅ %%i
) else (
    echo ❌ Docker is not installed or not running
    echo    Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Step 2: Check Docker Compose
echo.
echo 2️⃣ Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker-compose --version') do echo ✅ %%i
) else (
    echo ❌ Docker Compose not found
    pause
    exit /b 1
)

REM Step 3: Clean up
echo.
echo 3️⃣ Cleaning up existing containers...
docker-compose down -v
echo ✅ Cleanup completed

REM Step 4: Build and start
echo.
echo 4️⃣ Building and starting containers...
echo    This will take a few minutes first time...
docker-compose up -d --build

REM Step 5: Wait
echo.
echo 5️⃣ Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak >nul

REM Step 6: Show status
echo.
echo 6️⃣ Container Status:
docker-compose ps

REM Step 7: Test health
echo.
echo 7️⃣ Testing API Health...
curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API is healthy
) else (
    echo ❌ API not responding
)

echo.
echo ✨ Setup complete! Check http://localhost:15672 for RabbitMQ (guest/guest)
echo    and http://localhost:8081 for MongoDB Express (admin/admin123)
pause