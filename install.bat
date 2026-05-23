@echo off
call npm install --no-audit --no-fund --loglevel=error
exit /b %ERRORLEVEL%
