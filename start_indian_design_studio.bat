@echo off
title Indian Design Studio - Graphic Design SaaS Platform
echo ========================================================
echo   INDIAN DESIGN STUDIO (All-in-One Graphic Design SaaS)
echo   Starting Next.js Server on http://localhost:3000
echo ========================================================
cd /d "%~dp0indian-design-studio"
npm run dev -- -p 3000
pause
