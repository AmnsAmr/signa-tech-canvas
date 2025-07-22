@echo off
REM Vector Analysis Tools Installer for Windows
REM This script installs tools needed for better vector file analysis

echo Installing vector analysis tools for Windows...

REM Check if Chocolatey is installed
where choco >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Chocolatey is not installed. Installing Chocolatey...
    @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    if %ERRORLEVEL% neq 0 (
        echo Failed to install Chocolatey. Please install it manually from https://chocolatey.org/install
        exit /b 1
    )
    echo Chocolatey installed successfully.
    REM Refresh environment variables
    call refreshenv
)

echo Installing vector analysis tools using Chocolatey...
choco install -y pdftk-server xpdf-utils inkscape pdf2svg pstoedit

echo.
echo Installation complete!
echo You can now analyze vector files with better results.
echo.
echo Note: You may need to restart your server for the changes to take effect.
pause