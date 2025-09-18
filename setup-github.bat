@echo off
echo 🌊 BioShield GitHub Setup Script
echo.
echo This script will help you upload your BioShield project to GitHub
echo.
echo ⚠️  IMPORTANT: Create a GitHub repository first!
echo    1. Go to github.com and sign in
echo    2. Click "+" and select "New repository"
echo    3. Name it: bioshield-environmental-monitor
echo    4. Make it PUBLIC so friends can access
echo    5. DON'T initialize with README (we have files)
echo.
set /p username="Enter your GitHub username: "
echo.
echo 📡 Adding remote repository...
git remote add origin https://github.com/%username%/bioshield-environmental-monitor.git

echo.
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Success! Your repository should now be available at:
echo https://github.com/%username%/bioshield-environmental-monitor
echo.
echo 👥 Share this link with your friends so they can:
echo    - Clone the repository
echo    - Edit the animations
echo    - Contribute new features
echo.
echo 🌐 Live demo: https://bioshieldss.netlify.app
echo.
pause