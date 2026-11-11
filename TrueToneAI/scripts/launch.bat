@echo off
title TrueTone AI - Professional Photo Colorizer
cd /d "%~dp0\.."

if exist "..\server\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=..\server\.venv\Scripts\python.exe"
) else if exist "venv\Scripts\python.exe" (
    set "PYTHON_EXE=venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Starting TrueTone AI Desktop Studio...
"%PYTHON_EXE%" main.py
if %ERRORLEVEL% NEQ 0 pause
