@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%setup-prereqs.ps1"

if not exist "%PS_SCRIPT%" (
    echo Could not find %PS_SCRIPT%.
    echo Make sure setup-prereqs.ps1 is located next to this batch file.
    exit /b 1
)

:: ensure we are elevated so winget installs can proceed
net session >nul 2>&1
if errorlevel 1 (
    echo Requesting administrator privileges...
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -ArgumentList '%*' -Verb RunAs" >nul
    exit /b
)

where pwsh >nul 2>&1
if errorlevel 1 (
    echo PowerShell 7 (pwsh) is required. Install it from https://aka.ms/powershell and rerun.
    exit /b 1
)

pwsh -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*
endlocal
