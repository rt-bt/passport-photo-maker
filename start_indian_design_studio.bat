@echo off
title Indian Design Studio - Graphic Design SaaS Platform
echo ========================================================
echo   INDIAN DESIGN STUDIO (All-in-One Graphic Design SaaS)
echo ========================================================
echo.
echo Stopping any stale node servers...
taskkill /F /IM node.exe >nul 2>&1

echo Cleaning stale Next.js cache (.next)...
cd /d "%~dp0indian-design-studio"
if exist ".next" (
    rd /s /q ".next"
)

echo.
echo Starting fresh Next.js dev server on http://localhost:3000 ...
echo Press Ctrl+C anytime to stop.
echo ========================================================
npm run dev -- -p 3000
pause
