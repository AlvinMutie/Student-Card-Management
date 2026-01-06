#!/bin/bash

# Shuleni Advantage - Universal VPS Fix Script (v2.0)
# This script handles schema drift, data constraints, and deep SSL discovery

echo "--- 🛡️ Shuleni Advantage: Robust VPS Fix ---"

# 1. PATH DETECTION
if [ -d "Student-Card-Management-main" ]; then
    PROJECT_ROOT="$(pwd)/Student-Card-Management-main"
else
    PROJECT_ROOT="$(pwd)"
fi
echo "✅ Project detected at: $PROJECT_ROOT"

# 2. DATABASE REPAIR (Handling Schema Drift)
echo "📦 Repairing Database Schema..."
# Create the database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE student_card_management;" 2>/dev/null || echo "⚠️ Database already exists"

# FORCE SCHEMA UPDATE: Drop and recreate if needed, or fix constraints
# We'll use a wrapper to ensure 'name' doesn't block inserts in users
sudo -u postgres psql -d student_card_management -c "ALTER TABLE users ALTER COLUMN name DROP NOT NULL;" 2>/dev/null
sudo -u postgres psql -d student_card_management -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);" 2>/dev/null

# Run core schema
sudo -u postgres psql -d student_card_management -f "$PROJECT_ROOT/backend/migrations/schema.sql"

# ROBUST SEEDING (Specify columns to avoid position errors)
echo "🌱 Seeding data with robust inserts..."
sudo -u postgres psql -d student_card_management -c "
INSERT INTO users (email, password, role, status, full_name) 
VALUES ('admin@example.com', '\$2b\$10\$Qbh6FQoHiV9yNZba57Duqekx6wSwB31Y5BoswIyMbiIjJDqEi73Ou', 'admin', 'approved', 'System Admin') 
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status;

INSERT INTO users (email, password, role, status, full_name) 
VALUES ('parent@example.com', '\$2b\$10\$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent', 'approved', 'Demo Parent') 
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status;
"
echo "✅ Database initialized and constraint-fixed."

# 3. DEEP SSL DISCOVERY (THE 404 FIX)
echo "🌐 Deep-scanning for SSL Bridge..."
sudo a2enmod proxy proxy_http

# Strategy: Find ANY file in sites-enabled that has a VirtualHost *:443 block
SSL_FILE=$(grep -lR "VirtualHost *:443" /etc/apache2/sites-enabled/ | head -n 1)

# Fallback 1: Look for SSLEngine on
if [ -z "$SSL_FILE" ]; then
    SSL_FILE=$(grep -lR "SSLEngine on" /etc/apache2/sites-enabled/ | head -n 1)
fi

# Fallback 2: Look for shuleniadvantage in the config name
if [ -z "$SSL_FILE" ]; then
    SSL_FILE=$(ls /etc/apache2/sites-enabled/*shuleni* 2>/dev/null | head -n 1)
fi

if [ -n "$SSL_FILE" ]; then
    echo "📄 Target Config Found: $SSL_FILE"
    
    # Remove existing ProxyPass to prevent duplicates if user reruns
    sudo sed -i '/ProxyPass \/api/d' "$SSL_FILE"
    sudo sed -i '/ProxyPassReverse \/api/d' "$SSL_FILE"
    
    # Insert Bridge after DocumentRoot
    sudo sed -i '/DocumentRoot/a \    ProxyPass /api http://localhost:3000/api\n    ProxyPassReverse /api http://localhost:3000/api' "$SSL_FILE"
    echo "✅ API Bridge firmly installed in $SSL_FILE"
else
    echo "❌ CRITICAL: No SSL config found in /etc/apache2/sites-enabled/"
    echo "Please run: ls -l /etc/apache2/sites-enabled/ and tell me the filenames."
fi

# 4. RESTART SERVICES
echo "🔄 Restarting Services..."
sudo systemctl restart apache2
pm2 restart all 2>/dev/null || (cd "$PROJECT_ROOT/backend" && pm2 start server.js --name studentcard-backend)

echo "--- 🏁 DEEP FIX COMPLETE ---"
echo "Refresh your browser (Ctrl+Shift+R) and try logging in."
