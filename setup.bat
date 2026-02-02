@echo off
echo Initializing Sharma Store...
REM Create project
call npm create vite@latest sharma-store -- --template react
cd sharma-store
REM Install dependencies
call npm install
call npm install tailwindcss postcss autoprefixer react-router-dom lucide-react
REM Initialize Tailwind
call npx tailwindcss init -p
echo Setup Complete!
pause
