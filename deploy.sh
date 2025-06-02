#!/bin/bash

# Build and deploy script for Balan Coffee & Roastery
# Usage: ./deploy.sh [production|staging]

# Default environment is staging
ENV=${1:-staging}

echo "🚀 Starting deployment process for $ENV environment..."

# Check if git is clean
if ! git diff-index --quiet HEAD --; then
  echo "❌ You have uncommitted changes. Please commit or stash them before deploying."
  exit 1
fi

# Frontend build
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi
echo "✅ Frontend build successful!"

# Backend build
echo "📦 Building backend..."
cd backend
npm i --production
if [ $? -ne 0 ]; then
  echo "❌ Backend dependencies installation failed!"
  exit 1
fi
cd ..
echo "✅ Backend build successful!"

# Deploy based on environment
if [ "$ENV" = "production" ]; then
  echo "🌍 Deploying to PRODUCTION..."
  
  # Copy frontend dist to production server
  echo "📂 Copying frontend files..."
  # Replace with your actual deployment commands
  # scp -r dist/* user@production-server:/var/www/html/
  
  # Deploy backend
  echo "📂 Deploying backend..."
  # Replace with your actual deployment commands
  # scp -r backend/* user@production-server:/var/www/api/
  
  echo "🔄 Restarting services..."
  # Replace with your actual restart commands
  # ssh user@production-server "pm2 restart api"
  
elif [ "$ENV" = "staging" ]; then
  echo "🧪 Deploying to STAGING..."
  
  # Copy frontend dist to staging server
  echo "📂 Copying frontend files..."
  # Replace with your actual deployment commands
  # scp -r dist/* user@staging-server:/var/www/html/
  
  # Deploy backend
  echo "📂 Deploying backend..."
  # Replace with your actual deployment commands
  # scp -r backend/* user@staging-server:/var/www/api/
  
  echo "🔄 Restarting services..."
  # Replace with your actual restart commands
  # ssh user@staging-server "pm2 restart api"
  
else
  echo "❌ Unknown environment: $ENV. Use 'production' or 'staging'."
  exit 1
fi

echo "✨ Deployment completed successfully!"
echo "📊 Don't forget to run database migrations if needed."
