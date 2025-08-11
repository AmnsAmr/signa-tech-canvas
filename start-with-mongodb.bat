@echo off
echo Starting Signa Tech Canvas with MongoDB...

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 2 /nobreak > nul

REM Start Python Vector Service
echo Starting Python Vector Service...
start "Python Vector Service" cmd /k "cd python-vector-service && python app.py"

REM Wait a moment for Python service to start
timeout /t 3 /nobreak > nul

REM Start Node.js server
cd server
echo Starting Node.js server...
start "Node.js Server" cmd /k "npm start"

REM Wait for server to start
timeout /t 5 /nobreak > nul

REM Start frontend
echo Starting frontend...
cd ..
start "Frontend" cmd /k "npm run dev"

echo All services started!
echo.
echo Services:
echo - Python Vector Service: http://localhost:5001
echo - Node.js Backend: http://localhost:3001  
echo - Frontend: http://localhost:8080
echo.
echo Press any key to exit...
pause > nul