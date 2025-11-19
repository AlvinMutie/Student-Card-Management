#!/bin/bash

# Simple script to start the backend server
# This script checks prerequisites and starts the server

echo "========================================="
echo "Starting Backend Server"
echo "========================================="
echo ""

cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js and try again"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating it..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please update .env with your database credentials if needed"
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing dependencies..."
    npm install
fi

# Check database connection
echo ""
echo "Checking database connection..."
node check-setup.js > /tmp/setup-check.log 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Database connection check failed"
    echo "Please check:"
    echo "1. PostgreSQL is running"
    echo "2. Database exists: student_card_management"
    echo "3. .env file has correct database credentials"
    echo ""
    echo "To fix:"
    echo "  sudo -u postgres createdb student_card_management"
    echo "  sudo -u postgres psql -d student_card_management -f migrations/schema.sql"
    echo "  sudo -u postgres psql -d student_card_management -f migrations/clean-seed.sql"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "Starting server on http://localhost:3000"
echo "========================================="
echo ""
echo "⚠️  Keep this terminal open!"
echo "⚠️  Press Ctrl+C to stop the server"
echo ""
echo "To test, open: http://localhost:3000/api/health"
echo ""

# Start the server
npm start

