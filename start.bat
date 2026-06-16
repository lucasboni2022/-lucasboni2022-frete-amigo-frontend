@echo off
echo Instalando dependencias...
cd /d "%~dp0"
call npm install
echo.
echo Iniciando servidor de desenvolvimento...
call npm run dev
pause
