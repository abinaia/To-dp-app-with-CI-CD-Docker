@echo off
REM Setup script for DevOps Todo App (Windows)
REM This script helps set up the project for different environments

echo 🚀 DevOps Todo App Setup Script
echo =================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker version:
    docker --version
) else (
    echo ⚠️  Docker is not installed. Install Docker to use containerization features.
)

echo.
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo 🧪 Running tests...
npm test

echo.
REM Build Docker image if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐳 Building Docker image...
    docker build -t todo-app-devops .
    if %errorlevel% equ 0 (
        echo ✅ Docker image built successfully!
        echo    Run with: docker run -p 3000:3000 todo-app-devops
    )
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 Available commands:
echo    npm start          # Start production server
echo    npm run dev        # Start development server
echo    npm test           # Run tests
echo    npm run docker:build # Build Docker image
echo    npm run docker:run   # Run Docker container
echo.
echo 🌐 Access the app at: http://localhost:3000
echo 📊 Health check at: http://localhost:3000/health
echo.
echo 📚 Next steps:
echo 1. Push to GitHub repository
echo 2. Set up CI/CD pipeline with GitHub Actions
echo 3. Deploy to cloud platform (Render/Heroku/Railway)
echo 4. Configure environment variables and secrets
