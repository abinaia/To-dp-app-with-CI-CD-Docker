#!/bin/bash

# Setup script for DevOps Todo App
# This script helps set up the project for different environments

set -e

echo "🚀 DevOps Todo App Setup Script"
echo "================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

if command_exists docker; then
    echo "✅ Docker version: $(docker --version)"
else
    echo "⚠️  Docker is not installed. Install Docker to use containerization features."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run tests
echo ""
echo "🧪 Running tests..."
npm test

# Build Docker image if Docker is available
if command_exists docker; then
    echo ""
    echo "🐳 Building Docker image..."
    docker build -t todo-app-devops .
    echo "✅ Docker image built successfully!"
    echo "   Run with: docker run -p 3000:3000 todo-app-devops"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 Available commands:"
echo "   npm start          # Start production server"
echo "   npm run dev        # Start development server"
echo "   npm test           # Run tests"
echo "   npm run docker:build # Build Docker image"
echo "   npm run docker:run   # Run Docker container"
echo ""
echo "🌐 Access the app at: http://localhost:3000"
echo "📊 Health check at: http://localhost:3000/health"
echo ""
echo "📚 Next steps:"
echo "1. Push to GitHub repository"
echo "2. Set up CI/CD pipeline with GitHub Actions"
echo "3. Deploy to cloud platform (Render/Heroku/Railway)"
echo "4. Configure environment variables and secrets"
