@echo off
REM Quick Start Installation Script for Windows
REM Virtual Internship & Certificate Generator App

echo.
echo 🎓 Virtual Internship - Certificate Generator App
echo ================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not installed. Please install from https://nodejs.org/
    exit /b 1
)
echo ✅ Node.js installed

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not installed
    exit /b 1
)
echo ✅ npm installed

REM Install Firebase Tools globally
echo.
echo 📦 Installing Firebase Tools...
call npm install -g firebase-tools

echo.
echo ✅ Installation Complete!
echo.
echo 🚀 Next Steps:
echo 1. Read documentation\SETUP.md for Firebase configuration
echo 2. Update config\firebase-config.js with your Firebase credentials
echo 3. Run: firebase serve (to test locally)
echo 4. Run: firebase deploy (to deploy)
echo.
echo 📚 Documentation:
echo - Setup Guide: documentation\SETUP.md
echo - Features: documentation\FEATURES.md
echo - Deployment: documentation\DEPLOYMENT.md
echo.
echo Happy certificate generating! 🎓
echo.
pause
