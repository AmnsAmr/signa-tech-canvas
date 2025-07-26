@echo off
echo Starting Signa Tech services with migrations...

echo.
echo Running database migrations...
cd server
node run-migration.js
if %errorlevel% neq 0 (
    echo Migration failed!
    pause
    exit /b 1
)

echo.
echo Starting services...
cd ..
call start-services.bat