#!/bin/bash

# Quick Setup Script for Kali Linux
# This script automates the backend setup process

echo "=========================================="
echo "Student Card Management - Backend Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root for certain operations
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please don't run this script as root (except for PostgreSQL setup)${NC}"
   exit 1
fi

# Step 1: Check Node.js
echo -e "${YELLOW}[1/7]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed!${NC}"
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}✓ Node.js is installed: $(node --version)${NC}"
fi

# Step 2: Check PostgreSQL
echo -e "${YELLOW}[2/7]${NC} Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL is not installed. Installing...${NC}"
    sudo apt update
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo -e "${GREEN}✓ PostgreSQL installed${NC}"
else
    echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
fi

# Step 3: Start PostgreSQL service
echo -e "${YELLOW}[3/7]${NC} Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo -e "${GREEN}✓ PostgreSQL service started${NC}"

# Step 4: Set postgres password and create database
echo -e "${YELLOW}[4/7]${NC} Setting up database..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || true

# Create database if it doesn't exist
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw student_card_management; then
    echo -e "${YELLOW}Database already exists. Recreating...${NC}"
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS student_card_management;"
fi

sudo -u postgres psql -c "CREATE DATABASE student_card_management;"
echo -e "${GREEN}✓ Database created${NC}"

# Step 5: Install npm dependencies
echo -e "${YELLOW}[5/7]${NC} Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Step 6: Create .env file if it doesn't exist
echo -e "${YELLOW}[6/7]${NC} Setting up environment variables..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_card_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-this-in-production-$(date +%s)
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}✓ .env file already exists (skipping)${NC}"
fi

# Step 7: Set up database schema and seed data
echo -e "${YELLOW}[7/7]${NC} Setting up database tables and seed data..."

# Run schema
echo "  → Creating tables..."
sudo -u postgres psql -d student_card_management -f migrations/schema.sql > /dev/null 2>&1
echo -e "  ${GREEN}✓ Tables created${NC}"

# Generate hashes and update seed file
echo "  → Generating password hashes..."
ADMIN_HASH=$(node -e "const bcrypt=require('bcrypt');bcrypt.hash('admin123',10).then(h=>console.log(h))")
PARENT_HASH=$(node -e "const bcrypt=require('bcrypt');bcrypt.hash('parent123',10).then(h=>console.log(h))")

# Create a temporary seed file with hashes
cat > /tmp/seed_temp.sql << EOF
-- Insert admin user
INSERT INTO users (email, password_hash, role) VALUES
('admin@example.com', '$ADMIN_HASH', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert parent user
INSERT INTO users (email, password_hash, role) VALUES
('parent@example.com', '$PARENT_HASH', 'parent')
ON CONFLICT (email) DO NOTHING;

-- Get parent user_id and create parent/student records
DO \$\$
DECLARE
    parent_user_id INTEGER;
    parent_id_var INTEGER;
BEGIN
    SELECT id INTO parent_user_id FROM users WHERE email = 'parent@example.com';
    
    IF parent_user_id IS NOT NULL THEN
        INSERT INTO parents (user_id, name, email, phone) VALUES
        (parent_user_id, 'Sarah Onyango', 'parent@example.com', '+254712345678')
        ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
        RETURNING id INTO parent_id_var;
        
        IF parent_id_var IS NOT NULL THEN
            INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
            ('ST3507', 'Emma Onyango', 'NEMIS-7894561230', 'Grade 7 - Blue Section', 15000.00, parent_id_var)
            ON CONFLICT (adm) DO NOTHING;
        END IF;
    END IF;
END \$\$;
EOF

# Run seed
echo "  → Seeding database..."
sudo -u postgres psql -d student_card_management -f /tmp/seed_temp.sql > /dev/null 2>&1
rm /tmp/seed_temp.sql
echo -e "  ${GREEN}✓ Database seeded${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Default Login Credentials:"
echo "  Admin:  admin@example.com / admin123"
echo "  Parent: parent@example.com / parent123"
echo ""
echo "To start the server:"
echo "  npm run dev    (development with auto-reload)"
echo "  npm start      (production mode)"
echo ""
echo "Server will run on: http://localhost:3000"
echo ""

