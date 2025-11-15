@echo off
echo Starting Hiring Portal...
echo.

echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd vite-admin\server && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd vite-admin\hirewise-admin-vite && npm run dev"

echo.
echo ✓ Both servers are starting in separate windows
echo ✓ Backend: http://localhost:5000
echo ✓ Frontend: http://localhost:5173
echo.
pause
