@echo off
echo 🔍 Testing Event Tracker Setup
echo ================================

REM Test 1: Check if Node.js is installed
echo 📦 Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js %%i installed
) else (
    echo ❌ Node.js not found
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Test 2: Check if Docker is installed
echo 🐳 Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do echo ✅ %%i
) else (
    echo ❌ Docker not found
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Test 3: Check if Docker Compose is installed
echo 📦 Checking Docker Compose installation...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker-compose --version') do echo ✅ %%i
) else (
    echo ❌ Docker Compose not found
    echo Docker Compose should be included with Docker Desktop
    pause
    exit /b 1
)

REM Test 4: Check if ports are available using netstat
echo 🔌 Checking port availability...
netstat -an | find ":5672 " >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 5672 (RabbitMQ) might be in use
) else (
    echo ✅ Port 5672 is free
)

netstat -an | find ":27017 " >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 27017 (MongoDB) might be in use
) else (
    echo ✅ Port 27017 is free
)

netstat -an | find ":3000 " >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 3000 (API) might be in use
) else (
    echo ✅ Port 3000 is free
)

echo.
echo 📝 Next steps:
echo 1. Open two terminals and run:
echo    cd api ^&^& npm install
echo    cd consumer ^&^& npm install
echo 2. Run: docker-compose up -d
echo 3. Run tests using the commands below
echo.
echo Setup verification complete! 🚀
pause