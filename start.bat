@echo off
REM Script to start both frontend and backend together on Windows

echo Starting Z+ Application...

REM Navigate to backend directory
cd "Z plus"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies if needed
if not exist "venv\.installed" (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    type nul > venv\.installed
)

REM Build React app
echo Building React app...
cd "..\Z+ Website UI Design (1)"

REM Install npm dependencies if needed
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

REM Build the React app
call npm run build

REM Return to backend directory
cd "..\Z plus"

REM Run Django server
echo.
echo ==========================================
echo Starting Django server...
echo Access the application at: http://localhost:8000
echo ==========================================
echo.

python manage.py runserver

pause

