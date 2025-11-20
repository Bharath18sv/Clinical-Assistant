#!/bin/bash

# Smart Care Assistant - Service Startup Script

echo "Starting Smart Care Assistant services..."

# Navigate to the project directory (modify this path as needed)
cd /home/ubuntu/Clinical-Assistant

# Check if docker-compose file exists
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found!"
    exit 1
fi

# Stop any existing services
echo "Stopping existing services..."
docker-compose down

# Build and start all services
echo "Building and starting services..."
docker-compose up -d --build

# Wait a moment for services to start
sleep 10

# Check service status
echo "Checking service status..."
docker-compose ps

echo "Services started successfully!"
echo "Backend API: http://localhost:5001"
echo "ML ADR Service: http://localhost:6001"
echo "MongoDB: mongodb://localhost:27017"