@echo off
setlocal enabledelayedexpansion
title TrueTone AI - Setup & Installation
cd /d "%~dp0"

echo =================================================================
echo   TrueTone AI - Setup ^& GPU Verification
echo   Alienware m16 R1 ^| NVIDIA RTX 4080 Laptop GPU (12GB VRAM)
echo =================================================================
echo.

:: 1. Check Python
echo [1/5] Checking Python installation...
py -3.12 --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PY_CMD=py -3.12"
) else (
    python --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set "PY_CMD=python"
    ) else (
        echo [ERROR] Python was not found on your system!
        echo Please install Python 3.11 or 3.12 from python.org and add to PATH.
        pause
        exit /b 1
    )
)
echo   Python detected: %PY_CMD%

:: 2. Check NVIDIA GPU
echo [2/5] Checking NVIDIA GPU hardware...
nvidia-smi >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   NVIDIA GPU detected successfully!
) else (
    echo   [WARNING] nvidia-smi command not found. Ensure NVIDIA Graphics Drivers are installed.
)

:: 3. Check existing venv
echo [3/5] Configuring Python environment...
if exist "..\server\.venv\Scripts\python.exe" (
    echo   Using existing pre-configured CUDA environment.
    set "VENV_PYTHON=..\server\.venv\Scripts\python.exe"
) else (
    if not exist "venv" (
        echo   Creating new virtual environment 'venv'...
        %PY_CMD% -m venv venv
    )
    set "VENV_PYTHON=venv\Scripts\python.exe"
    echo   Installing PySide6, PyTorch CUDA 12.4, and dependencies...
    "%VENV_PYTHON%" -m pip install --upgrade pip
    "%VENV_PYTHON%" -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
    "%VENV_PYTHON%" -m pip install -r requirements.txt
)

:: 4. Verify GPU Diagnostics
echo [4/5] Running hardware diagnostics...
"%VENV_PYTHON%" scripts\gpu_check.py

:: 5. Ready
echo.
echo =================================================================
echo   Installation and GPU Verification Complete!
echo   Launch TrueTone AI by double-clicking: launch.bat
echo =================================================================
echo.
pause
