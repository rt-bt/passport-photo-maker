@echo off
title TrueTone AI - Professional Photo Colorizer
cd /d "%~dp0"

echo =================================================================
echo   TrueTone AI - Professional Black ^& White Photo Colorizer
echo   Optimized for Alienware m16 R1 ^& NVIDIA RTX 4080 (12GB VRAM)
echo =================================================================
echo.

:: Detect Python venv
if exist "..\server\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=..\server\.venv\Scripts\python.exe"
) else if exist "venv\Scripts\python.exe" (
    set "PYTHON_EXE=venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Starting TrueTone AI Desktop Studio...
"%PYTHON_EXE%" main.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] TrueTone AI encountered an issue during execution.
    pause
)
