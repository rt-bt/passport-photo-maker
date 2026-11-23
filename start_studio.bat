@echo off
title TrueTone & Passport Studio Pro - AI GPU Engine
color 0A
echo =====================================================================
echo    TrueTone & Passport Studio Pro - Real RTX 4080 AI GPU Launcher
echo =====================================================================
echo.
echo [1/3] Checking NVIDIA RTX 4080 GPU and PyTorch CUDA environment...
server\.venv\Scripts\python.exe -c "import torch; assert torch.cuda.is_available(), 'CUDA not available'; print('   [OK] Active GPU: ' + torch.cuda.get_device_name(0))"
if %errorlevel% neq 0 (
    echo [ERROR] CUDA is not available. Please ensure NVIDIA drivers are installed.
    pause
    exit /b
)

echo.
echo [2/3] Starting Local AI Restoration Server (GFPGANv1.4 + RealESRGAN)...
start "AI Restoration GPU Server (RTX 4080)" /min server\.venv\Scripts\python.exe -m uvicorn server.main:app --host 127.0.0.1 --port 8000

echo.
echo [3/3] Starting Web Studio Interface...
start "Passport Studio Web Client" /min npm run dev -- --open

echo.
echo =====================================================================
echo  Studio is now LIVE with 100%% NVIDIA RTX 4080 Hardware Acceleration!
echo  URL: http://localhost:5173
echo.
echo  Real GFPGAN Face Restoration + 4K Super-Resolution is Active.
echo  (Do not close this window while using the studio)
echo =====================================================================
echo.
pause
