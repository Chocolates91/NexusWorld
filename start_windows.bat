@echo off
setlocal
cd /d "%~dp0"
start "Nexus Agent" cmd /k py -m agent.api.server
timeout /t 2 /nobreak >nul
where godot >nul 2>&1
if %errorlevel%==0 (
    start "Nexus World" godot --path game
    exit /b 0
)
where godot4 >nul 2>&1
if %errorlevel%==0 (
    start "Nexus World" godot4 --path game
    exit /b 0
)
echo No se encontro Godot en PATH. Abriendo el archivo del proyecto...
start "" "%~dp0game\project.godot"

