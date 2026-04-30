@echo off
cd /d "%~dp0"
echo Building QMMD...
wails build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo Running QMMD...
start "" "build\bin\qmmd.exe"
echo Done.
