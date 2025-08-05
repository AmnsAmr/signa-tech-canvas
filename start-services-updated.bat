@echo off
echo Starting Signa Tech Canvas Services...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo Starting services with updated port configuration:
echo - Frontend: http://localhost:8080
echo - Node.js Backend: http://localhost:3001
echo - Python Service: http://localhost:5001
echo.

REM Start Python Vector Service
echo Starting Python Vector Service on port 5001...
start "Python Vector Service" cmd /k "cd python-vector-service && python app.py"

REM Wait a moment for Python service to start
timeout /t 3 /nobreak >nul

REM Start Node.js Backend
echo Starting Node.js Backend on port 3001...
start "Node.js Backend" cmd /k "cd server && npm start"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend Development Server
echo Starting Frontend on port 8080...
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo All services are starting...
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:3001
echo Python Service: http://localhost:5001
echo.
echo Press any key to exit...
pause >nul