# Dukaanify Build Script for PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Dukaanify - Production Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[1/4] Checking Node.js version..." -ForegroundColor Yellow
    Write-Host "      $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Build Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build folder: .next" -ForegroundColor White
Write-Host "Public folder: public" -ForegroundColor White
Write-Host "Node modules: node_modules" -ForegroundColor White
Write-Host ""

# Calculate folder sizes
$nextSize = (Get-ChildItem -Path ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Build size: $([Math]::Round($nextSize, 2)) MB" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test locally: npm start" -ForegroundColor White
Write-Host "2. Deploy to Vercel: vercel" -ForegroundColor White
Write-Host "3. Deploy to Netlify: netlify deploy --prod --dir=.next" -ForegroundColor White
Write-Host ""
Write-Host "For more info, see: BUILD_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""
