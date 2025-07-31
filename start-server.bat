@echo off
echo Starting Greedy Geckoz development server on port 4000...
cd /d "C:\Users\Hutch\greedy-geckoz-refresh"
echo Current directory: %CD%
echo.
echo Checking if Next.js is installed...
if exist "node_modules\.bin\next.cmd" (
    echo Next.js found, starting server...
    call npm run dev -- --port 4000
) else (
    echo Next.js not found, installing dependencies first...
    call npm install --legacy-peer-deps
    echo.
    echo Starting server...
    call npm run dev -- --port 4000
)
pause