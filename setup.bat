@echo off
echo ==========================================
echo   Traveloop - Project Setup
echo ==========================================
echo.

echo [1/4] Installing server dependencies...
cd server
call npm install
cd ..

echo.
echo [2/4] Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo To start the backend:
echo   cd server ^&^& npm run dev
echo.
echo To start the frontend:
echo   cd client ^&^& npm run dev
echo.
echo Make sure MongoDB is running on localhost:27017
echo ==========================================
pause
