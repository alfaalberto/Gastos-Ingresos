@echo off
REM ============================================================
REM  FinanzaPro - Respaldo automatico a GitHub
REM  Uso:  backup.bat ["mensaje de commit opcional"]
REM  Agrega todos los cambios, crea un commit con marca de tiempo
REM  y lo sube a origin/main.
REM ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

git diff --quiet && git diff --cached --quiet
if %ERRORLEVEL%==0 (
    git status --porcelain | findstr /r "." >nul
    if errorlevel 1 (
        echo [FinanzaPro] No hay cambios que respaldar.
        exit /b 0
    )
)

set MSG=%~1
if "%MSG%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ("%DATE%") do set FECHA=%%a-%%b-%%c
    set MSG=backup: respaldo automatico !FECHA! %TIME:~0,8%
)

echo [FinanzaPro] Respaldando cambios...
git add -A
git commit -m "!MSG!"
if errorlevel 1 (
    echo [FinanzaPro] Nada que commitear o error en commit.
    exit /b 1
)
git push origin main
if errorlevel 1 (
    echo [FinanzaPro] ERROR: no se pudo subir a GitHub. Revisa tu conexion o credenciales.
    exit /b 1
)
echo [FinanzaPro] Respaldo completado en GitHub (origin/main).
exit /b 0
