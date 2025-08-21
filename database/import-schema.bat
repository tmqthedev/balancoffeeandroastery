@echo off
REM MongoDB Schema Import Script for Windows
REM Balan Coffee & Roastery - Complete Database Setup

echo 🚀 Balan Coffee ^& Roastery - MongoDB Schema Import
echo ==================================================

REM Check if mongosh is available
where mongosh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: mongosh (MongoDB Shell) is not installed or not in PATH
    echo Please install MongoDB Shell first:
    echo winget install MongoDB.Shell
    echo Then restart this script
    pause
    exit /b 1
)

REM Set default MongoDB URI if not provided
if "%MONGODB_URI%"=="" (
    echo ⚠️  MONGODB_URI environment variable not set
    echo Using connection string from .env file...
    set "MONGODB_URI=mongodb+srv://balancoffeeandroastery:Balan00113355.@balancoffee.ah4nfkp.mongodb.net/?retryWrites=true&w=majority&appName=balancoffee"
)

echo 📍 MongoDB URI: %MONGODB_URI%

REM Confirm before proceeding
echo.
set /p "confirm=🔄 This will create/recreate the 'balancoffee' database. Continue? (y/N): "
if /i "%confirm%" NEQ "y" (
    echo ❌ Import cancelled
    pause
    exit /b 0
)

echo.
echo 📥 Starting MongoDB schema import...

REM Check if schema file exists
if not exist "mongodb-complete-schema.js" (
    echo ❌ Error: Schema file not found: mongodb-complete-schema.js
    echo Please ensure you're running this script from the database directory
    pause
    exit /b 1
)

REM Import schema
echo 🔧 Importing schema and data...
mongosh "%MONGODB_URI%" < mongodb-complete-schema.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Schema import completed successfully!
    echo.
    echo 🎉 Your Balan Coffee ^& Roastery database is ready!
    echo.
    echo 📋 Quick verification commands:
    echo mongosh "%MONGODB_URI%" --eval "use balancoffee; db.stats()"
    echo mongosh "%MONGODB_URI%" --eval "use balancoffee; db.products.find().limit(3)"
    echo mongosh "%MONGODB_URI%" --eval "use balancoffee; db.categories.find()"
    echo.
    echo 🌐 Next steps:
    echo 1. Your backend .env file is already configured
    echo 2. Test your application connection: cd ../backend ^&^& node mongodb-connection.js
    echo 3. Seed additional data: node seed-mongodb.js
    echo 4. Start your backend server: npm run dev
) else (
    echo.
    echo ❌ Schema import failed!
    echo Please check the error messages above and try again
)

echo.
pause
