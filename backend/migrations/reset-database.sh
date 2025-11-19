#!/bin/bash

# Reset Database Script
# This script deletes all data and loads fresh test data

echo "========================================="
echo "Resetting Student Card Management Database"
echo "========================================="
echo ""

# Database configuration
DB_NAME="student_card_management"
DB_USER="${PGUSER:-postgres}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL and try again"
    exit 1
fi

# Function to run psql command (try postgres user first, then current user)
run_psql() {
    if sudo -u postgres psql "$@" 2>/dev/null; then
        return 0
    elif psql -U postgres "$@" 2>/dev/null; then
        return 0
    else
        psql "$@"
    fi
}

# Check if database exists
if ! run_psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Database '$DB_NAME' does not exist. Creating it..."
    run_psql -c "CREATE DATABASE $DB_NAME;" || {
        echo "Error: Could not create database. Please create it manually:"
        echo "  sudo -u postgres createdb $DB_NAME"
        echo "  or"
        echo "  createdb -U postgres $DB_NAME"
        exit 1
    }
    echo "Running schema..."
    run_psql -d $DB_NAME -f migrations/schema.sql
fi

# Generate fresh password hashes
echo "Generating fresh password hashes..."
node migrations/generate-fresh-hashes.js

# Load clean seed data
echo ""
echo "Loading clean seed data..."
echo "This will DELETE all existing data and create fresh test data."
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Run clean seed
echo "Loading clean seed data..."
run_psql -d $DB_NAME -f migrations/clean-seed.sql || {
    echo "Error: Could not load seed data. Trying with postgres user..."
    sudo -u postgres psql -d $DB_NAME -f migrations/clean-seed.sql || {
        echo "Error: Failed to load seed data. Please check database permissions."
        exit 1
    }
}

echo ""
echo "========================================="
echo "Database reset complete!"
echo "========================================="
echo ""
echo "Test Accounts:"
echo "  Admin:  admin@hechlink.edu / admin123"
echo "  Parent: sarah.onyango@example.com / parent123"
echo "  Staff:  staff1@hechlink.edu / staff123"
echo ""
echo "========================================="

