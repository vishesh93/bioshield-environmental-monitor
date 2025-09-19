@echo off
echo Building BioShield Android APK...
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building web assets...
call npm run build

echo.
echo Step 3: Syncing Capacitor...
call npx cap sync android

echo.
echo Step 4: Building Debug APK...
cd android
call gradlew assembleDebug

echo.
echo Step 5: Building Release APK...
call gradlew assembleRelease

echo.
echo ✅ APK Build Complete!
echo.
echo Debug APK: android\app\build\outputs\apk\debug\app-debug.apk
echo Release APK: android\app\build\outputs\apk\release\app-release-unsigned.apk
echo.
echo You can now install the APK on your Android device!
pause