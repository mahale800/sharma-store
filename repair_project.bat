@echo off
echo Repairing Sharma Store...

REM Remove existing broken directory
if exist sharma-store (
    echo Removing old directory...
    rmdir /s /q sharma-store
)

REM Re-create project
echo Creating Vite Project...
call npm create vite@latest sharma-store -- --template react

REM Install Dependencies
cd sharma-store
echo Installing dependencies...
call npm install
call npm install tailwindcss postcss autoprefixer react-router-dom lucide-react firebase

REM Initialize Tailwind
call npx tailwindcss init -p

echo Project Repair Complete!
pause
