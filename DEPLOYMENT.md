# Deployment Guide for Smart Care Assistant on EC2

This guide will help you deploy both the backend and ML ADR service on an EC2 instance using Docker.

## Prerequisites

1. AWS EC2 instance (Ubuntu 20.04 LTS or later recommended)
2. SSH access to the EC2 instance
3. Security groups configured to allow ports 22, 5001, 6001, and 27017

## Steps to Deploy

### 1. Connect to your EC2 instance

```bash
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip
```

### 2. Update system packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Docker

```bash
# Install Docker
sudo apt install docker.io -y

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Reboot to apply changes
sudo reboot
```

After reboot, reconnect to your instance.

### 4. Clone the repository

```bash
git clone https://github.com/Bharath18sv/Clinical-Assistant.git
cd Clinical-Assistant
```

If you don't have git installed:

```bash
sudo apt install git -y
```

### 5. Set up environment variables

Create a `.env` file in the backend directory:

```bash
cd backend
vi .env
```

Add your environment variables:

```
MONGO_URI=mongodb://localhost:27017/SCA
PORT=5001
NODE_ENV=production
# Add other required environment variables
```

### 6. Build and run services using Docker Compose

```bash
# Navigate to the root directory
cd ..

# Build and start all services
docker-compose up -d --build
```

### 7. Check service status

```bash
# Check if all containers are running
docker-compose ps

# View logs for a specific service
docker-compose logs backend
docker-compose logs ml-adr-service
docker-compose logs mongodb
```

### 8. Test the services

```bash
# Test backend health
curl http://localhost:5001/

# Test ML ADR service health
curl http://localhost:6001/health
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 5001, 6001, and 27017 are not being used by other services.

2. **Permission denied errors**: Ensure your user is in the docker group.

3. **MongoDB connection issues**: Check if MongoDB is running and accessible.

4. **Environment variables**: Make sure all required environment variables are set.

### Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Execute commands in a running container
docker-compose exec backend bash
docker-compose exec ml-adr-service bash
```

## Security Considerations

1. **Firewall**: Configure AWS Security Groups to only allow necessary ports.
2. **Environment Variables**: Never commit sensitive data to version control.
3. **HTTPS**: Consider using a reverse proxy like Nginx with SSL termination.
4. **Database Security**: Use strong authentication for MongoDB.

## Monitoring

For production deployment, consider setting up:

1. **Log aggregation**: Use tools like ELK stack or AWS CloudWatch.
2. **Health checks**: Implement monitoring for service availability.
3. **Resource monitoring**: Monitor CPU, memory, and disk usage.
4. **Backup strategy**: Regular backups of MongoDB data.

## Updating the Application

To update the application:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build
```
