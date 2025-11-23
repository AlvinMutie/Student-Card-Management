# Login Troubleshooting Guide (No Shell Access)

Since you're on Render's free tier and can't use shell, use these **web-based tools** to fix login issues.

## Quick Fix Steps

### Step 1: Check Database Status

Visit your diagnostic page:
```
https://hechl1nk.netlify.app/public/api-test.html
```

Click **"Check Database Status"** to see:
- ✅ If database is connected
- ✅ If tables exist
- ✅ If any users exist
- ✅ If admin users exist

### Step 2: Run Migrations (If Tables Don't Exist)

If the status shows "Users table does not exist":

1. On the diagnostic page, click **"Run Migrations"**
2. Wait for success message
3. This creates all database tables

### Step 3: Create Admin User

If no admin users exist:

1. Click **"Create Admin User"**
2. Enter email: `admin@hechlink.edu` (or your preferred email)
3. Enter password: `admin123` (or your preferred password)
4. Click OK
5. You'll see a success message with your credentials

### Step 4: Test Login

1. Click **"Test Login"**
2. Enter the email and password you just created
3. Verify it says "Login Credentials Valid!"

### Step 5: Try Logging In

Go to your admin login page and use the credentials you created.

## API Endpoints (Alternative Method)

If you prefer using curl or Postman, here are the endpoints:

### 1. Check Database Status
```bash
curl https://your-backend.onrender.com/api/setup/status
```

### 2. Run Migrations
```bash
curl https://your-backend.onrender.com/api/setup/run-migrations
```

### 3. Create Admin User
```bash
curl -X POST https://your-backend.onrender.com/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hechlink.edu","password":"admin123"}'
```

### 4. Test Login
```bash
curl -X POST https://your-backend.onrender.com/api/setup/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hechlink.edu","password":"admin123"}'
```

## Common Issues & Solutions

### Issue: "Invalid email or password"

**Possible Causes:**
1. ❌ User doesn't exist in database
2. ❌ Password hash is incorrect
3. ❌ Database not migrated

**Solution:**
1. Check database status (Step 1)
2. If no users exist, create admin user (Step 3)
3. If user exists but password wrong, create admin user again (it will update the password)

### Issue: "Users table does not exist"

**Solution:**
1. Run migrations (Step 2)
2. Then create admin user (Step 3)

### Issue: "Cannot connect to database"

**Solution:**
1. Check Render dashboard → Your service → Logs
2. Verify `DATABASE_URL` environment variable is set
3. Check if PostgreSQL database is running in Render

### Issue: "Database connected but no users"

**Solution:**
1. Click "Create Admin User" on diagnostic page
2. Use default: `admin@hechlink.edu` / `admin123`
3. Or create with your own credentials

## Default Credentials

After running setup, you can use:
- **Email**: `admin@hechlink.edu`
- **Password**: `admin123`

**⚠️ Important**: Change these after first login in production!

## Step-by-Step Troubleshooting

### Scenario 1: Fresh Deployment (No Database Setup)

1. ✅ Visit: `https://hechl1nk.netlify.app/public/api-test.html`
2. ✅ Click "Check Database Status"
3. ✅ If tables don't exist → Click "Run Migrations"
4. ✅ Click "Create Admin User"
5. ✅ Click "Test Login" to verify
6. ✅ Try logging in at admin login page

### Scenario 2: Database Exists But Can't Login

1. ✅ Click "Check Database Status" - verify users exist
2. ✅ Click "Test Login" with your credentials
3. ✅ If password wrong → Click "Create Admin User" (updates password)
4. ✅ If user doesn't exist → Click "Create Admin User" (creates new)

### Scenario 3: Everything Works But Login Fails

1. ✅ Check browser console (F12) for errors
2. ✅ Verify API URL is correct in diagnostic page
3. ✅ Test login endpoint directly: Click "Test Login"
4. ✅ Check Render logs for backend errors

## Diagnostic Page Features

The diagnostic page at `/public/api-test.html` provides:

- ✅ **Check Database Status** - See if database is set up
- ✅ **Run Migrations** - Create database tables
- ✅ **Create Admin User** - Set up admin account
- ✅ **Test Login** - Verify credentials work
- ✅ **Test Connection** - Check if backend is reachable
- ✅ **Update API URL** - Fix API configuration

## Quick Reference

**Diagnostic Page**: `https://hechl1nk.netlify.app/public/api-test.html`

**Setup Endpoints**:
- Status: `GET /api/setup/status`
- Migrations: `GET /api/setup/run-migrations`
- Create Admin: `POST /api/setup/create-admin`
- Test Login: `POST /api/setup/test-login`

**Default Admin**:
- Email: `admin@hechlink.edu`
- Password: `admin123`

---

**All of these tools work without shell access!** Just use the web interface or API endpoints.

