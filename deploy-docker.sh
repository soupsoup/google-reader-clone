#!/bin/bash

echo "🚀 Docker Deployment Script"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your Supabase credentials first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is installed"
echo ""
echo "📦 Building Docker image..."
docker build -t google-reader-clone .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "🚀 Starting application with docker-compose..."
    docker-compose up -d

    echo ""
    echo "✅ Application is running!"
    echo "📍 Access at: http://localhost:8080"
    echo "🏥 Health check: http://localhost:8080/health"
    echo ""
    echo "📝 To view logs: docker-compose logs -f"
    echo "📝 To stop: docker-compose down"
else
    echo "❌ Docker build failed!"
    exit 1
fi
