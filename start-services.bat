@echo off
echo Starting Signa Tech Canvas Services...

echo.
echo Starting Python Vector Service...
start "Python Vector Service" cmd /k "cd python-vector-service && python -m pip install -r requirements.txt && python app.py"

echo.
echo Waiting for Python service to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Node.js Server...
cd server
npm install
npm start