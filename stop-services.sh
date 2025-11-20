#!/bin/bash

# Smart Care Assistant - Service Stop Script

echo "Stopping Smart Care Assistant services..."

# Navigate to the project directory (modify this path as needed)
cd /home/ubuntu/Clinical-Assistant

# Check if docker-compose file exists
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found!"
    exit 1
fi

# Stop all services
echo "Stopping services..."
docker-compose down

echo "Services stopped successfully!"