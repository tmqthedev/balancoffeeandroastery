#!/usr/bin/env bash

# MongoDB Schema Import Script for Balan Coffee & Roastery
# This script imports the complete schema and sample data to MongoDB

echo "🚀 Balan Coffee & Roastery - MongoDB Schema Import"
echo "=================================================="

# Check if mongosh is available
if ! command -v mongosh &> /dev/null; then
    echo "❌ Error: mongosh (MongoDB Shell) is not installed or not in PATH"
    echo "Please install MongoDB Shell first:"
    echo "Windows: winget install MongoDB.Shell"
    echo "macOS: brew install mongosh"
    echo "Linux: Download from https://www.mongodb.com/try/download/shell"
    exit 1
fi

# Set default MongoDB URI if not provided
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI environment variable not set"
    echo "Using default: mongodb://localhost:27017"
    MONGODB_URI="mongodb://localhost:27017"
fi

echo "📍 MongoDB URI: $MONGODB_URI"

# Confirm before proceeding
echo ""
read -p "🔄 This will create/recreate the 'balancoffee' database. Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Import cancelled"
    exit 1
fi

echo ""
echo "📥 Starting MongoDB schema import..."

# Check if schema file exists
SCHEMA_FILE="./mongodb-complete-schema.js"
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: Schema file not found: $SCHEMA_FILE"
    echo "Please ensure you're running this script from the database directory"
    exit 1
fi

# Import schema
echo "🔧 Importing schema and data..."
if mongosh "$MONGODB_URI" < "$SCHEMA_FILE"; then
    echo ""
    echo "✅ Schema import completed successfully!"
    echo ""
    echo "🎉 Your Balan Coffee & Roastery database is ready!"
    echo ""
    echo "📋 Quick verification commands:"
    echo "mongosh \"$MONGODB_URI\" --eval \"use balancoffee; db.stats()\""
    echo "mongosh \"$MONGODB_URI\" --eval \"use balancoffee; db.products.find().limit(3)\""
    echo "mongosh \"$MONGODB_URI\" --eval \"use balancoffee; db.categories.find()\""
    echo ""
    echo "🌐 Next steps:"
    echo "1. Update your backend .env file with: MONGODB_URI=$MONGODB_URI/balancoffee"
    echo "2. Test your application connection"
    echo "3. Start your backend server: npm run dev"
else
    echo ""
    echo "❌ Schema import failed!"
    echo "Please check the error messages above and try again"
    exit 1
fi
