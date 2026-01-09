#!/bin/bash

# Student Card Management - VPS Deployment Script
# Run this script on your VPS as root

set -e

# Configuration
DOMAIN="shuleniadvantage.co.ke"
APP_DIR="/var/www/student-card-management"
REPO_ZIP="deployment_package.zip"
DB_NAME="student_card_management"
DB_USER="postgres"
DB_PASS="postgres" # Change this if you want a stronger password
PORT=3000

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting Deployment for $DOMAIN...${NC}"

# 1. System Update
echo -e "${YELLOW}[1/8] Updating system packages...${NC}"

# FIX: Switch to main Ubuntu mirrors to avoid checksum errors
cp /etc/apt/sources.list /etc/apt/sources.list.bak
sed -i 's|http://de.archive.ubuntu.com/ubuntu/|http://archive.ubuntu.com/ubuntu/|g' /etc/apt/sources.list
sed -i 's|http://.*.ec2.archive.ubuntu.com/ubuntu/|http://archive.ubuntu.com/ubuntu/|g' /etc/apt/sources.list

# Clean apt
rm -rf /var/lib/apt/lists/*

apt-get update --fix-missing
apt-get upgrade -y
apt-get install -y curl git unzip

# 2. Install Dependencies (Node.js, Nginx, Certbot)
echo -e "${YELLOW}[2/8] Installing dependencies...${NC}"

# Install Node.js 18.x
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Nginx
apt-get install -y nginx

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# 3. Setup Database
echo -e "${YELLOW}[3/8] Configuring Database...${NC}"
systemctl start postgresql
systemctl enable postgresql

# Create DB User and Database
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || echo "Database already exists"

# 4. Extract Application
echo -e "${YELLOW}[4/8] Setting up application files...${NC}"
mkdir -p $APP_DIR

if [ -f "$REPO_ZIP" ]; then
    unzip -o $REPO_ZIP -d $APP_DIR
else
    echo -e "${RED}Error: $REPO_ZIP not found! execute this script in the same directory as the zip file.${NC}"
    exit 1
fi

# Fix permissions
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# 5. Install Backend Dependencies
echo -e "${YELLOW}[5/8] Installing backend dependencies...${NC}"
cd $APP_DIR/backend
npm install --omit=dev

# 6. Configure Environment
echo -e "${YELLOW}[6/8] Configuring .env...${NC}"
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
JWT_SECRET=$(openssl rand -hex 32)
PORT=$PORT
NODE_ENV=production
CORS_ORIGIN=http://$DOMAIN
EOF

# 7. Run Migrations & Start Backend
echo -e "${YELLOW}[7/8] Running migrations and starting backend...${NC}"
# Run schema and seed
sudo -u postgres psql -d $DB_NAME -f migrations/schema.sql
# Check if seed is needed or just skip to avoid duplicates (schema.sql usually drops tables or handles IF NOT EXISTS)
sudo -u postgres psql -d $DB_NAME -f migrations/seed.sql || echo "Seed might have failed due to constraints, ignoring..."

# Start with PM2
pm2 stop student-backend || true
pm2 delete student-backend || true
pm2 start server.js --name "student-backend"
pm2 save
# Generate startup script explicitly for systemd
pm2 startup systemd -u root --hp /root

# 8. Configure Nginx
echo -e "${YELLOW}[8/8] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/web;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location /api {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
# FIX: Increase hash bucket size for long domain names via conf.d (safer than sed)
echo "server_names_hash_bucket_size 128;" > /etc/nginx/conf.d/custom_hash_size.conf

nginx -t && systemctl restart nginx

echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "Your website should be live at http://$DOMAIN"
echo -e "To enable HTTPS, run: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
