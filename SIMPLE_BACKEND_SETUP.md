# Simple Backend Setup Guide
## For Kali Linux & Windows

This guide will help you set up the backend in the simplest way possible on both operating systems.

## ⚡ QUICKEST METHOD (Automated Scripts)

### 🐧 Kali Linux - One Command Setup:
```bash
cd /home/blueberyy/Documents/Student-Card-Management/backend
bash quick-setup-linux.sh
```

### 🪟 Windows - One Click Setup:
1. Double-click `quick-setup-windows.bat` in the `backend` folder
2. Follow the prompts

**That's it!** The scripts will handle everything automatically.

---

## 📖 Manual Setup (If you prefer step-by-step)

---

## 🐧 KALI LINUX Setup (Simple Method)

### Step 1: Install Node.js (if not installed)
```bash
# Check if Node.js is installed
node --version

# If not installed, install it:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install PostgreSQL
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Step 3: Create Database
```bash
# Create database
sudo -u postgres createdb student_card_management

# Verify database was created
sudo -u postgres psql -l | grep student_card_management
```

### Step 4: Set Up Backend
```bash
# Navigate to backend folder
cd /home/blueberyy/Documents/Student-Card-Management/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_card_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-this-in-production-12345
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500
EOF
```

### Step 5: Set Up Database Tables
```bash
# Run the schema to create tables
sudo -u postgres psql -d student_card_management -f migrations/schema.sql
```

### Step 6: Generate Password Hashes & Seed Data
```bash
# Generate password hashes for seed data
node migrations/generate-all-hashes.js

# This will show you hashes. Copy them and update migrations/seed.sql if needed
# Then run the seed file:
sudo -u postgres psql -d student_card_management -f migrations/seed.sql
```

### Step 7: Start the Server
```bash
# Start in development mode (auto-reload on changes)
npm run dev

# OR start in production mode
npm start
```

**✅ Your backend is now running on `http://localhost:3000`**

---

## 🪟 WINDOWS Setup (Simple Method)

### Step 1: Install Node.js
1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Check "Add to PATH" during installation
5. Click "Install"
6. Open **Command Prompt** or **PowerShell** and verify:
   ```cmd
   node --version
   npm --version
   ```

### Step 2: Install PostgreSQL (Easy Method)
**Option A: Using Installer (Recommended)**
1. Go to: https://www.postgresql.org/download/windows/
2. Download the **PostgreSQL Installer**
3. Run the installer
4. During installation:
   - Remember the password you set for `postgres` user (use: `postgres` for simplicity)
   - Port: `5432` (default)
   - Click "Next" through all steps
5. **Important**: Make sure "Stack Builder" is NOT checked (we don't need it)

**Option B: Using Chocolatey (If you have it)**
```powershell
choco install postgresql
```

### Step 3: Create Database
1. Open **pgAdmin 4** (installed with PostgreSQL) OR use **Command Prompt**
2. **Using Command Prompt:**
   ```cmd
   # Navigate to PostgreSQL bin folder (adjust path if needed)
   cd "C:\Program Files\PostgreSQL\16\bin"
   
   # Create database
   psql -U postgres -c "CREATE DATABASE student_card_management;"
   
   # Enter password when prompted (the one you set during installation)
   ```

**OR using pgAdmin 4:**
1. Open pgAdmin 4
2. Connect to server (enter password)
3. Right-click "Databases" → "Create" → "Database"
4. Name: `student_card_management`
5. Click "Save"

### Step 4: Set Up Backend
1. Open **Command Prompt** or **PowerShell**
2. Navigate to your project:
   ```cmd
   cd C:\Users\YourUsername\Documents\Student-Card-Management\backend
   ```
   *(Replace `YourUsername` with your actual Windows username)*

3. Install dependencies:
   ```cmd
   npm install
   ```

4. Create `.env` file:
   - Create a new file named `.env` in the `backend` folder
   - Copy and paste this content:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=student_card_management
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=your-secret-key-change-this-in-production-12345
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5500
   ```
   **⚠️ Important**: Change `DB_PASSWORD=postgres` to the password you set during PostgreSQL installation!

### Step 5: Set Up Database Tables
**Using Command Prompt:**
```cmd
# Navigate to PostgreSQL bin folder
cd "C:\Program Files\PostgreSQL\16\bin"

# Run schema (adjust path to your project)
psql -U postgres -d student_card_management -f "C:\Users\YourUsername\Documents\Student-Card-Management\backend\migrations\schema.sql"
```

**OR using pgAdmin 4:**
1. Open pgAdmin 4
2. Connect to server
3. Right-click `student_card_management` database → "Query Tool"
4. Open `migrations/schema.sql` file in a text editor
5. Copy all content and paste into Query Tool
6. Click "Execute" (F5)

### Step 6: Generate Password Hashes & Seed Data
```cmd
# Navigate back to backend folder
cd C:\Users\YourUsername\Documents\Student-Card-Management\backend

# Generate password hashes
node migrations/generate-all-hashes.js

# Run seed file
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres -d student_card_management -f "C:\Users\YourUsername\Documents\Student-Card-Management\backend\migrations\seed.sql"
```

### Step 7: Start the Server
```cmd
# Navigate to backend folder
cd C:\Users\YourUsername\Documents\Student-Card-Management\backend

# Start in development mode (auto-reload on changes)
npm run dev

# OR start in production mode
npm start
```

**✅ Your backend is now running on `http://localhost:3000`**

---

## 🧪 Test Your Backend

### Test 1: Health Check
Open your browser and go to:
```
http://localhost:3000/api/health
```
You should see: `{"status":"ok","message":"Student Card Management API is running"}`

### Test 2: Test Login (Using PowerShell/Command Prompt)
**Windows:**
```powershell
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"parent@example.com\",\"password\":\"parent123\"}'
```

**Kali Linux:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com","password":"parent123"}'
```

---

## 🔧 Troubleshooting

### Problem: "Cannot find module" error
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json  # Linux
# OR
rmdir /s node_modules && del package-lock.json  # Windows

npm install
```

### Problem: "Database connection failed"
**Kali Linux:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# If not running, start it:
sudo systemctl start postgresql

# Check if database exists
sudo -u postgres psql -l | grep student_card_management
```

**Windows:**
```cmd
# Check if PostgreSQL service is running
# Open Services (Win + R, type: services.msc)
# Look for "postgresql-x64-16" (or similar)
# Right-click → Start (if stopped)

# OR using Command Prompt (as Administrator):
net start postgresql-x64-16
```

### Problem: "Port 3000 already in use"
**Solution:**
Change the PORT in `.env` file:
```
PORT=3001
```

### Problem: "Permission denied" (Kali Linux)
**Solution:**
```bash
# Make sure you're using sudo for postgres commands
sudo -u postgres psql -d student_card_management -f migrations/schema.sql
```

### Problem: "psql: command not found" (Windows)
**Solution:**
Add PostgreSQL to your PATH:
1. Copy this path: `C:\Program Files\PostgreSQL\16\bin` (adjust version number)
2. Add to System Environment Variables:
   - Win + R → `sysdm.cpl` → Advanced → Environment Variables
   - Under "System variables", find "Path" → Edit
   - Add new entry with the PostgreSQL bin path
   - Click OK and restart Command Prompt

---

## 📝 Default Login Credentials

After seeding the database, you can use:

- **Admin:**
  - Email: `admin@example.com`
  - Password: `admin123`

- **Parent:**
  - Email: `parent@example.com`
  - Password: `parent123`

---

## 🚀 Quick Start Commands

### Kali Linux:
```bash
cd /home/blueberyy/Documents/Student-Card-Management/backend
npm install
npm run dev
```

### Windows:
```cmd
cd C:\Users\YourUsername\Documents\Student-Card-Management\backend
npm install
npm run dev
```

---

## 📚 Next Steps

1. ✅ Backend is running on `http://localhost:3000`
2. Open your frontend HTML files in a browser
3. Make sure `shared/api-client.js` points to `http://localhost:3000/api`
4. Test login functionality

**Need help?** Check the main `BACKEND_SETUP_GUIDE.md` for more details!

