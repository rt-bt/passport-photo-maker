@echo off
title AI Image Restoration & Ultra Studio Server (Universal GPU)
cd /d "%~dp0.."

echo =======================================================
echo    AI Image Restoration & Ultra Studio (Universal GPU)
echo =======================================================
echo.

if not exist "server\.venv\Scripts\python.exe" (
    echo [INFO] Creating Python virtual environment...
    uv venv --python 3.12 server\.venv
)

echo [INFO] Activating virtual environment and starting server...
echo [INFO] Server will run on: http://127.0.0.1:8000
echo.

server\.venv\Scripts\python.exe server\main.py

pause
