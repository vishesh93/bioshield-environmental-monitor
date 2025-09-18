#!/usr/bin/env pwsh

Write-Host "🌊 BioShield GitHub Setup Script" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you upload your BioShield project to GitHub" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Create a GitHub repository first!" -ForegroundColor Yellow
Write-Host "   1. Go to github.com and sign in" -ForegroundColor Gray
Write-Host "   2. Click '+' and select 'New repository'" -ForegroundColor Gray  
Write-Host "   3. Name it: bioshield-environmental-monitor" -ForegroundColor Gray
Write-Host "   4. Make it PUBLIC so friends can access" -ForegroundColor Gray
Write-Host "   5. DON'T initialize with README (we have files)" -ForegroundColor Gray
Write-Host ""

$username = Read-Host "Enter your GitHub username"

Write-Host ""
Write-Host "📡 Adding remote repository..." -ForegroundColor Blue
git remote add origin "https://github.com/$username/bioshield-environmental-monitor.git"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Remote added successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add remote. Repository might already exist." -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Blue
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCESS! Your repository is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Repository URL:" -ForegroundColor Cyan
    Write-Host "https://github.com/$username/bioshield-environmental-monitor" -ForegroundColor White
    Write-Host ""
    Write-Host "👥 Share this link with your friends so they can:" -ForegroundColor Yellow
    Write-Host "   - Clone the repository: git clone https://github.com/$username/bioshield-environmental-monitor.git" -ForegroundColor Gray
    Write-Host "   - Edit the amazing animations" -ForegroundColor Gray
    Write-Host "   - Contribute new features" -ForegroundColor Gray
    Write-Host "   - Learn advanced React techniques" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 Live Demo: https://bioshieldss.netlify.app" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "📚 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Check your GitHub repository" -ForegroundColor Gray
    Write-Host "   2. Enable GitHub Pages if you want" -ForegroundColor Gray
    Write-Host "   3. Share with your developer friends" -ForegroundColor Gray
    Write-Host "   4. Create Issues for new animation ideas" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check:" -ForegroundColor Red
    Write-Host "   - GitHub repository exists" -ForegroundColor Gray
    Write-Host "   - You have push permissions" -ForegroundColor Gray
    Write-Host "   - Username is correct" -ForegroundColor Gray
}

Write-Host ""
Read-Host "Press Enter to exit"