#!/bin/bash

# Setup .env file for backend
# This script helps configure the database connection

echo "========================================="
echo "Backend Environment Setup"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
    else
        echo "❌ .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Detect PostgreSQL user
echo ""
echo "Detecting PostgreSQL configuration..."

# Try common PostgreSQL users
DB_USER="postgres"
DB_PASSWORD="postgres"

# Check if we can connect as postgres
if sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
    echo "✅ Found PostgreSQL user: postgres"
    DB_USER="postgres"
    DB_PASSWORD="postgres"
elif psql -U postgres -c "SELECT 1;" &>/dev/null 2>&1; then
    echo "✅ Can connect as postgres"
    DB_USER="postgres"
    DB_PASSWORD=""
else
    # Try current user
    CURRENT_USER=$(whoami)
    if psql -U $CURRENT_USER -d postgres -c "SELECT 1;" &>/dev/null 2>&1; then
        echo "✅ Using current user: $CURRENT_USER"
        DB_USER="$CURRENT_USER"
        DB_PASSWORD=""
    else
        echo "⚠️  Could not auto-detect PostgreSQL user"
        read -p "Enter PostgreSQL username (default: postgres): " DB_USER
        DB_USER=${DB_USER:-postgres}
        read -sp "Enter PostgreSQL password (default: empty): " DB_PASSWORD
        echo ""
    fi
fi

# Update .env file
echo ""
echo "Updating .env file with database configuration..."

# Create .env content
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_card_management
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Secret
JWT_SECRET=student-card-management-secret-key-change-in-production

# Server Port
PORT=3000

# Node Environment
NODE_ENV=development
EOF

echo "✅ .env file updated"
echo ""
echo "Database Configuration:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: student_card_management"
echo "  User: $DB_USER"
echo "  Password: ${DB_PASSWORD:-'(empty)'}"
echo ""
echo "========================================="
echo "Next Steps:"
echo "1. Make sure PostgreSQL is running"
echo "2. Create database: createdb student_card_management"
echo "3. Load schema: psql -d student_card_management -f migrations/schema.sql"
echo "4. Load test data: psql -d student_card_management -f migrations/clean-seed.sql"
echo "5. Start server: npm start"
echo "========================================="

