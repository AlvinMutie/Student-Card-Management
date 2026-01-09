#!/bin/bash

# Setup script for Student Card Management Database
# This script helps set up the database with proper password hashes

echo "Setting up Student Card Management Database..."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL and try again"
    exit 1
fi

# Database name
DB_NAME="student_card_management"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Database '$DB_NAME' already exists"
    read -p "Do you want to recreate it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql -c "DROP DATABASE $DB_NAME;"
        echo "Creating new database..."
        psql -c "CREATE DATABASE $DB_NAME;"
    fi
else
    echo "Creating database '$DB_NAME'..."
    psql -c "CREATE DATABASE $DB_NAME;"
fi

# Run schema
echo "Running schema migration..."
psql -d $DB_NAME -f migrations/schema.sql

# Generate password hashes
echo "Generating password hashes..."
node migrations/generate-hash.js > /tmp/hashes.txt

# Extract hashes
ADMIN_HASH=$(grep "Admin password hash" /tmp/hashes.txt -A 1 | tail -1)
PARENT_HASH=$(grep "Parent password hash" /tmp/hashes.txt -A 1 | tail -1)

# Create seed file with proper hashes
echo "Creating seed file with generated hashes..."
cat > migrations/seed_with_hashes.sql << EOF
-- Seed data with generated password hashes

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, role) VALUES
('admin@example.com', '$ADMIN_HASH', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample parent user (password: parent123)
INSERT INTO users (email, password_hash, role) VALUES
('parent@example.com', '$PARENT_HASH', 'parent')
ON CONFLICT (email) DO NOTHING;

-- Get the parent user_id and create parent/student records
DO \$\$
DECLARE
    parent_user_id INTEGER;
    parent_id_var INTEGER;
BEGIN
    SELECT id INTO parent_user_id FROM users WHERE email = 'parent@example.com';
    
    IF parent_user_id IS NOT NULL THEN
        -- Insert sample parent
        INSERT INTO parents (user_id, name, email, phone) VALUES
        (parent_user_id, 'Sarah Onyango', 'parent@example.com', '+254712345678')
        ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
        RETURNING id INTO parent_id_var;
        
        -- Insert sample student if parent was created/updated
        IF parent_id_var IS NOT NULL THEN
            INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
            ('ST3507', 'Emma Onyango', 'NEMIS-7894561230', 'Grade 7 - Blue Section', 15000.00, parent_id_var)
            ON CONFLICT (adm) DO NOTHING;
        END IF;
    END IF;
END \$\$;
EOF

# Run seed
echo "Seeding database with sample data..."
psql -d $DB_NAME -f migrations/seed_with_hashes.sql

echo ""
echo "Database setup complete!"
echo ""
echo "Default credentials:"
echo "  Admin: admin@example.com / admin123"
echo "  Parent: parent@example.com / parent123"
echo ""
echo "You can now start the backend server with: npm start"

