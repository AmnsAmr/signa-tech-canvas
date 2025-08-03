@echo off
echo Enabling CSRF protection for production...
echo.

REM Update environment variable
powershell -Command "(Get-Content server\.env) -replace 'CSRF_ENABLED=false', 'CSRF_ENABLED=true' | Set-Content server\.env"

echo ✓ CSRF protection enabled
echo.
echo IMPORTANT: You will now need to include CSRF tokens in your requests.
echo Get CSRF token from: GET /api/csrf-token
echo Include in requests as: x-csrf-token header or _csrf body field
echo.
pause