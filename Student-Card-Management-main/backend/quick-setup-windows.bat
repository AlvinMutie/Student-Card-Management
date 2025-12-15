@echo off
REM Quick Setup Script for Windows
REM This script automates the backend setup process

echo ==========================================
echo Student Card Management - Backend Setup
echo ==========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
) else (
    echo [OK] Node.js is installed
    node --version
)

REM Check if PostgreSQL is installed
echo.
echo [2/6] Checking PostgreSQL installation...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: PostgreSQL psql command not found in PATH
    echo.
    echo Please do ONE of the following:
    echo   1. Install PostgreSQL from https://www.postgresql.org/download/windows/
    echo   2. Add PostgreSQL bin folder to your PATH
    echo      (Usually: C:\Program Files\PostgreSQL\16\bin)
    echo.
    echo After installing PostgreSQL, run this script again.
    pause
    exit /b 1
) else (
    echo [OK] PostgreSQL is installed
)

REM Install npm dependencies
echo.
echo [3/6] Installing npm dependencies...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

REM Create .env file
echo.
echo [4/6] Setting up environment variables...
if not exist ".env" (
    (
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=student_card_management
        echo DB_USER=postgres
        echo DB_PASSWORD=postgres
        echo JWT_SECRET=your-secret-key-change-this-in-production-%RANDOM%%RANDOM%
        echo PORT=3000
        echo NODE_ENV=development
        echo CORS_ORIGIN=http://localhost:5500
    ) > .env
    echo [OK] .env file created
    echo.
    echo IMPORTANT: Please edit .env file and change DB_PASSWORD
    echo to match your PostgreSQL password!
    echo.
) else (
    echo [OK] .env file already exists
)

REM Create database
echo.
echo [5/6] Setting up database...
echo Please enter your PostgreSQL password when prompted:
psql -U postgres -c "DROP DATABASE IF EXISTS student_card_management;" 2>nul
psql -U postgres -c "CREATE DATABASE student_card_management;"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database
    echo Make sure PostgreSQL is running and password is correct
    pause
    exit /b 1
)
echo [OK] Database created

REM Run schema
echo.
echo [6/6] Setting up database tables...
psql -U postgres -d student_card_management -f migrations\schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run schema
    pause
    exit /b 1
)
echo [OK] Tables created

REM Generate hashes and seed
echo.
echo Generating password hashes and seeding database...
node -e "const bcrypt=require('bcrypt');bcrypt.hash('admin123',10).then(h=>{console.log('Admin hash:',h);return bcrypt.hash('parent123',10)}).then(h=>console.log('Parent hash:',h))" > temp_hashes.txt 2>&1

REM Note: For Windows, we'll use the existing seed.sql file
REM User should run generate-all-hashes.js manually and update seed.sql
echo.
echo IMPORTANT: Before seeding, please run:
echo   node migrations\generate-all-hashes.js
echo.
echo Then update migrations\seed.sql with the generated hashes
echo and run:
echo   psql -U postgres -d student_card_management -f migrations\seed.sql
echo.

del temp_hashes.txt 2>nul

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Edit .env file and set correct DB_PASSWORD
echo   2. Run: node migrations\generate-all-hashes.js
echo   3. Update migrations\seed.sql with generated hashes
echo   4. Run: psql -U postgres -d student_card_management -f migrations\seed.sql
echo   5. Start server: npm run dev
echo.
echo Server will run on: http://localhost:3000
echo.
pause

