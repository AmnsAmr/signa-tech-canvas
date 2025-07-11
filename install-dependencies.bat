@echo off
echo Installing backend dependencies...
cd server
npm install
echo.
echo Backend dependencies installed successfully!
echo.
echo Starting server...
npm start
pause