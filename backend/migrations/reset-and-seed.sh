#!/bin/bash

# Script to completely reset the database and load clean seed data
# This ensures all test data is consistent and matches across all pages

set -e  # Exit on error

DB_NAME="student_card_management"
DB_USER="${DB_USER:-postgres}"

echo "=========================================="
echo "Database Reset and Seed Script"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Drop and recreate the database"
echo "2. Load the schema"
echo "3. Load clean seed data"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Step 1: Dropping existing database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" || psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Step 2: Creating fresh database..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || psql -U postgres -c "CREATE DATABASE $DB_NAME;"

echo "Step 3: Loading schema..."
cd "$(dirname "$0")"
sudo -u postgres psql -d $DB_NAME -f schema.sql || psql -U postgres -d $DB_NAME -f schema.sql

echo "Step 4: Loading clean seed data..."
sudo -u postgres psql -d $DB_NAME -f clean-seed.sql || psql -U postgres -d $DB_NAME -f clean-seed.sql

echo ""
echo "=========================================="
echo "Database reset complete!"
echo "=========================================="
echo ""
echo "Test Accounts:"
echo "  Admin: admin@hechlink.edu / admin123"
echo "  Parent: sarah.onyango@example.com / parent123"
echo "  Staff: staff1@hechlink.edu / staff123"
echo ""
echo "Total records created:"
sudo -u postgres psql -d $DB_NAME -c "SELECT 'Users: ' || COUNT(*) FROM users; SELECT 'Parents: ' || COUNT(*) FROM parents; SELECT 'Students: ' || COUNT(*) FROM students; SELECT 'Staff: ' || COUNT(*) FROM staff;" || psql -U postgres -d $DB_NAME -c "SELECT 'Users: ' || COUNT(*) FROM users; SELECT 'Parents: ' || COUNT(*) FROM parents; SELECT 'Students: ' || COUNT(*) FROM students; SELECT 'Staff: ' || COUNT(*) FROM staff;"
echo ""
echo "=========================================="

