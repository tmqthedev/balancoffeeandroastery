#!/bin/bash
# Development startup script for Balan Coffee E-commerce

echo "🚀 Starting Balan Coffee Development Environment..."

# Start backend server
echo "📡 Starting backend server on port 5000..."
cd backend
start cmd /k "node server.js"
cd ..

# Wait a moment for backend to start
timeout /t 3 /nobreak

# Start frontend development server
echo "🌐 Starting frontend server on port 3000..."
start cmd /k "npm run dev"

echo "✅ Development environment started!"
echo "📡 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Facebook OAuth: http://localhost:3000/api/auth/facebook"

pause
