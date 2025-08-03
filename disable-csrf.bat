@echo off
echo Disabling CSRF protection for development...
echo.

REM Update environment variable
powershell -Command "(Get-Content server\.env) -replace 'CSRF_ENABLED=true', 'CSRF_ENABLED=false' | Set-Content server\.env"

echo ✓ CSRF protection disabled
echo.
echo WARNING: This should only be used in development!
echo Remember to enable CSRF before going to production.
echo.
pause