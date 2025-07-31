@echo off
echo Starting Signa Tech Canvas for Network Access...
echo.
echo Your website will be accessible from:
echo - Local: http://localhost:8080
echo - Network: http://192.168.1.4:8080
echo.
echo Make sure your phone is connected to the same Wi-Fi network!
echo.

REM Start Python Vector Service
echo Starting Python Vector Service...
start "Python Vector Service" cmd /k "cd python-vector-service && python app.py"

REM Wait a moment for Python service to start
timeout /t 3 /nobreak > nul

REM Start Node.js Backend
echo Starting Node.js Backend...
start "Node.js Backend" cmd /k "cd server && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend Development Server
echo Starting Frontend Development Server...
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo All services are starting...
echo Check the opened terminal windows for any errors.
echo.
echo Access your website from your phone at: http://192.168.1.4:8080
echo.
pause