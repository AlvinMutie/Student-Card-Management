# 🚀 Quick Start - Get Backend Running NOW

## Step 1: Setup Environment (One Time)

```bash
cd backend
./setup-env.sh
```

This will create/update your `.env` file with database settings.

## Step 2: Create Database & Load Data

```bash
# Create database (use postgres user)
sudo -u postgres createdb student_card_management

# Or if you have postgres password:
createdb -U postgres student_card_management

# Load schema
sudo -u postgres psql -d student_card_management -f migrations/schema.sql

# Load clean test data
sudo -u postgres psql -d student_card_management -f migrations/clean-seed.sql
```

## Step 3: Start the Server

```bash
cd backend
npm start
```

**Keep this terminal open!** The server must stay running.

You should see:
```
Server is running on http://localhost:3000
Connected to PostgreSQL database
```

## Step 4: Test Login

1. Open: `public/index.html` (admin login)
2. Email: `admin@hechlink.edu`
3. Password: `admin123`
4. Should work! ✅

## 🔧 If Database Commands Fail

### Option 1: Use postgres user
```bash
sudo -u postgres psql
```

Then in psql:
```sql
CREATE DATABASE student_card_management;
\c student_card_management
\i migrations/schema.sql
\i migrations/clean-seed.sql
\q
```

### Option 2: Update .env with correct user

Edit `.env` file:
```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

## ✅ Verify Everything Works

### Check Server:
```bash
curl http://localhost:3000/api/health
```
Should return: `{"status":"ok",...}`

### Check Database:
```bash
cd backend
node check-setup.js
```

## 🎯 Test Accounts

**Admin:**
- Email: `admin@hechlink.edu`
- Password: `admin123`

**Parent:**
- Email: `sarah.onyango@example.com`
- Password: `parent123`

**Staff:**
- Email: `staff1@hechlink.edu`
- Password: `staff123`

## ⚠️ Important

1. **Backend server MUST be running** for login to work
2. **Keep the terminal open** where you ran `npm start`
3. **Database must have data** - run clean-seed.sql if needed
4. **Check .env file** has correct database credentials

## 🐛 Still Not Working?

Run the setup checker:
```bash
cd backend
node check-setup.js
```

This will tell you exactly what's wrong!

