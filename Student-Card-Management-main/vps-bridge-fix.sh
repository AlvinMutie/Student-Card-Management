#!/bin/bash

# Shuleni Advantage - Universal VPS Fix Script
# This script detects the correct paths and fixes the Database + API Bridge

echo "--- 🛡️ Shuleni Advantage: VPS Fix Protocol ---"

# 1. PATH DETECTION
if [ -d "Student-Card-Management-main" ]; then
    PROJECT_ROOT="$(pwd)/Student-Card-Management-main"
else
    PROJECT_ROOT="$(pwd)"
fi

echo "✅ Project detected at: $PROJECT_ROOT"

# 2. DATABASE INITIALIZATION
echo "📦 Initializing Database..."
cd "$PROJECT_ROOT/backend" || exit
# Ensure the database exists
sudo -u postgres psql -c "CREATE DATABASE student_card_management;" 2>/dev/null || echo "⚠️ Database already exists (continuing)"

# Run migrations using raw SQL as a fallback
sudo -u postgres psql -d student_card_management -f migrations/schema.sql
sudo -u postgres psql -d student_card_management -f migrations/seed.sql

echo "✅ Database initialized."

# 3. APACHE API BRIDGE (THE 404 FIX)
echo "🌐 Installing API Bridge..."
sudo a2enmod proxy proxy_http

# Find the active SSL config file (Certbot)
SSL_FILE=$(grep -l "SSLEngine on" /etc/apache2/sites-enabled/*.conf | head -n 1)

if [ -n "$SSL_FILE" ]; then
    echo "📄 Found SSL Config: $SSL_FILE"
    
    # Check if ProxyPass already exists to avoid duplicates
    if grep -q "ProxyPass /api" "$SSL_FILE"; then
        echo "⚠️ API Bridge already exists in config."
    else
        # Insert Bridge after DocumentRoot
        sudo sed -i '/DocumentRoot/a \    ProxyPass /api http://localhost:3000/api\n    ProxyPassReverse /api http://localhost:3000/api' "$SSL_FILE"
        echo "✅ API Bridge installed in $SSL_FILE"
    fi
else
    echo "❌ ERROR: No active SSL configuration found. Manual bridge required."
fi

# 4. RESTART SERVICES
echo "🔄 Restarting Services..."
sudo systemctl restart apache2
pm2 restart all || (echo "⚠️ PM2 not found, skipping backend restart")

echo "--- 🏁 FIX COMPLETE ---"
echo "Try logging in now at shuleniadvantage.co.ke"
