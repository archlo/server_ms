@echo off
setlocal EnableExtensions
title Maple Admin Panel
cd /d "%~dp0"

echo ==============================================
echo  Maple Admin Panel Launcher
echo ==============================================
echo.

REM -- 1. Install server deps if missing ---------------------------------
set err=
if not exist "node_modules\ws" (
  echo [setup] Installing server dependencies...
  call npm install
  if errorlevel 1 set err=1
)
if defined err (
  echo.
  echo [ERROR] Server dependencies failed to install.
  pause
  exit /b 1
)

REM -- 2. Install Electron deps if missing -------------------------------
set aerr=
if not exist "admin\node_modules\electron\dist\electron.exe" (
  echo [setup] Installing admin panel dependencies...
  pushd admin
  call npm install
  if errorlevel 1 set aerr=1
  popd
)
if defined aerr (
  echo.
  echo [ERROR] Admin panel dependencies failed to install.
  pause
  exit /b 1
)
if not exist "admin\node_modules\electron\dist\electron.exe" (
  echo.
  echo [ERROR] Electron did not finish installing. If the download was interrupted,
  echo         delete admin\node_modules\electron and run the launcher again.
  pause
  exit /b 1
)

REM -- 3. Copy .env if missing -------------------------------------------
if not exist ".env" (
  if exist ".env.example" (
    echo [setup] Creating .env from .env.example
    copy ".env.example" ".env" >nul
  )
)

echo [start] Launching the Admin Panel...
echo         Use the app's Server tab to start / restart / shutdown the maple server.
echo.
start "" "admin\node_modules\electron\dist\electron.exe" "admin"

pause
exit /b 0