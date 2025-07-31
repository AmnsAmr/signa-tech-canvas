@echo off
echo Starting SignaTech Canvas with Debug Mode...
echo.

echo 1. Starting Node.js Backend Server...
cd server
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak > nul

echo 2. Starting Frontend Development Server...
cd ..
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ✅ Both servers are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul