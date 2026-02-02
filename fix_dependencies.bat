@echo off
echo Installing missing dependencies...
cd sharma-store
call npm install react-router-dom lucide-react tailwindcss postcss autoprefixer
echo Installation complete.
pause
