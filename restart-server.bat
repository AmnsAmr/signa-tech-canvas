@echo off
echo Restarting server with MongoDB...

REM Kill any existing node processes
taskkill /f /im node.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak > nul

REM Start server
cd server
echo Starting Node.js server with MongoDB...
start "Node.js Server" cmd /k "npm start"

echo Server restarted with MongoDB configuration!