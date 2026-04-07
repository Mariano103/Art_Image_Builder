@echo off
REM Windows Batch Setup Script for AI Image Editor
REM Run this script to quickly set up and start the application

echo.
echo ========================================
echo   AI Image Editor - Quick Setup
echo ========================================
echo.

REM Check Node.js installation
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Node.js not found!
    echo   Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   Node.js %NODE_VERSION% detected
echo.

REM Check for .env file
echo Checking environment configuration...
if exist .env (
    echo   .env file found
) else (
    echo   Creating .env file from template...
    copy .env.example .env >nul
    echo   .env file created!
    echo.
    echo   IMPORTANT: You need to add your API key to .env file!
    echo.
    echo   For OpenAI: Get key from https://platform.openai.com
    echo   For Stability AI: Get key from https://platform.stability.ai
    echo.
    set /p OPEN_ENV="Do you want to open backend\.env now? (Y/N): "
    if /i "%OPEN_ENV%"=="Y" (
        notepad backend\.env
        echo.
        echo   Please add your API key and save the file
        pause
    )
)

REM Install dependencies
echo.
echo Installing backend dependencies...
echo   This may take a few minutes...
echo.
cd backend
call npm install
cd ..

if errorlevel 1 (
    echo.
    echo   ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo   Dependencies installed successfully!
echo.

REM Setup complete
echo ========================================
echo   Setup Complete!
echo ========================================
echo.backend\.env file
echo   2. Run: npm start  (or: cd backend then npm start)
echo   3. Open: http://localhost:3000
echo.
echo For development with auto-reload:
echo   npm run dev  (or: cd backend then npm run dev)
echo For development with auto-reload:
echo   npm run dev
echo.

set /p START_NOW="Do you want to start the server now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    echo.
    echo Starting server...
    echo.
    cd backend
    call npm start
) else (
    echo.
    echo Run 'npm start' when ready to start the server
    echo.
    pause
)
