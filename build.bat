@echo off
REM Dukaanify Build Script for Windows

echo.
echo ========================================
echo   Dukaanify - Production Build
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Node.js version...
node --version
echo.

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [3/4] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo [4/4] Build Summary
echo ========================================
echo Build folder: .next
echo Public folder: public
echo Node modules: node_modules
echo.
echo Total size: Check with: dir /s .next
echo.

echo ========================================
echo ✓ BUILD COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Test locally: npm start
echo 2. Deploy to Vercel: vercel
echo 3. Deploy to Netlify: netlify deploy --prod --dir=.next
echo.
echo For more info, see: BUILD_INSTRUCTIONS.md
echo.
pause
