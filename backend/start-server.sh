#!/bin/bash

# Start Backend Server Script
# This script checks prerequisites and starts the backend server

echo "========================================="
echo "Starting Student Card Management Backend"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js and try again"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install npm and try again"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  Warning: psql is not installed or not in PATH"
    echo "Please make sure PostgreSQL is installed and running"
else
    echo "✅ PostgreSQL client found"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please update .env with your database credentials"
    else
        echo "❌ Error: .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies installed"
fi

# Load environment variables
source .env 2>/dev/null || true

# Test database connection
echo ""
echo "Testing database connection..."
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'student_card_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connection successful');
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('');
    console.error('Please check:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database exists: ' + (process.env.DB_NAME || 'student_card_management'));
    console.error('3. Database credentials in .env are correct');
    pool.end();
    process.exit(1);
  });
" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Cannot start server - database connection failed"
    echo "Please fix the database connection and try again"
    exit 1
fi

echo ""
echo "========================================="
echo "Starting server..."
echo "========================================="
echo ""
echo "Server will start on: http://localhost:${PORT:-3000}"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start

