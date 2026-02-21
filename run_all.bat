@echo off
TITLE QuMail Control Station

echo Starting QuMail...
echo ==================

echo [1/3] QKD Simulator Starting...
start cmd /k "call venv\Scripts\activate.bat && uvicorn km_simulator.km_server:app --port 8001"

echo [2/3] QuMail Backend Starting...
start cmd /k "call venv\Scripts\activate.bat && cd backend && uvicorn main:app --port 8000"

echo [3/3] Electron Desktop UI Starting...
start cmd /k "cd frontend && npm run electron"

echo QuMail is now booting. Windows will open shortly.
goto :eof
