# Push Dukaanify to GitHub
# Run this in PowerShell as Administrator

# Navigate to project
cd "c:\Users\Vexxor Technologies\Desktop\secreat\build and sell\dukaanify"

# Add remote repository
Write-Host "Adding GitHub remote..." -ForegroundColor Green
git remote add origin https://github.com/kashif4051423-alt/dukaanify.git

# Rename branch to main
Write-Host "Setting branch to main..." -ForegroundColor Green
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
Write-Host "This will ask for your GitHub credentials (use personal access token as password)" -ForegroundColor Yellow
git push -u origin main

Write-Host "`n✅ Done! Your project is now on GitHub" -ForegroundColor Green
Write-Host "Repository: https://github.com/kashif4051423-alt/dukaanify" -ForegroundColor Cyan
