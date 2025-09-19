@echo off
echo ========================================
echo BioShield APK Builder (Docker Method)
echo ========================================
echo.

echo Checking for Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker found! Starting APK build...
echo.

echo Building APK using Docker container...
docker-compose -f docker-build-apk.yml up --build

if %errorlevel% eq 0 (
    echo.
    echo ========================================
    echo ✅ APK BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Your APK file is ready: bioshield-debug.apk
    echo.
    echo To install on your Android device:
    echo 1. Copy bioshield-debug.apk to your phone
    echo 2. Enable "Install from Unknown Sources" in Settings
    echo 3. Tap the APK file to install
    echo.
) else (
    echo.
    echo ❌ Build failed. Check the error messages above.
    echo.
)

echo Cleaning up Docker containers...
docker-compose -f docker-build-apk.yml down

pause