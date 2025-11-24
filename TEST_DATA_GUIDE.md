# Test Data Guide - Loading Demo Data Without Shell

This guide shows you how to load comprehensive test data (parents, staff, students) using web-based tools - **no shell access needed!**

## Quick Start

### Option 1: Using Diagnostic Page (Easiest)

1. **Visit**: `https://hechl1nk.netlify.app/public/api-test.html`
2. **Click**: "Check Database Status" (verify tables exist)
3. **Click**: "Run Migrations" (if tables don't exist)
4. **Click**: "Load Test Data" (loads everything)
5. **Wait**: 30-60 seconds for data to load
6. **Done!** You now have test data

### Option 2: Using API Endpoint

```bash
curl -X POST https://your-backend.onrender.com/api/setup/load-test-data
```

## What Test Data Includes

After loading, you'll have:

### Admin Users
- **1 Admin**: `admin@hechlink.edu` / `admin123`

### Parent Users (with students)
- **Multiple parents** with password: `parent123`
- Each parent has **1-2 students** linked to them
- Students have realistic data (names, classes, fee balances)

**Example Parent Accounts:**
- `sarah.onyango@example.com` / `parent123` (has 2 students)
- `john.mwangi@example.com` / `parent123` (has 1 student)
- `mary.kipchoge@example.com` / `parent123` (has 2 students)
- And more...

### Staff Users
- **5 Staff members** with password: `parent123` (same as parents for testing)
- Different departments (Teaching, Administration, Library, Health, Security)

**Example Staff Accounts:**
- `staff1@hechlink.edu` / `parent123` (Teaching - John Mwangi)
- `staff2@hechlink.edu` / `parent123` (Administration - Mary Wanjiku)
- `staff3@hechlink.edu` / `parent123` (Library - Peter Kamau)
- `staff4@hechlink.edu` / `parent123` (Health - Jane Njeri)
- `staff5@hechlink.edu` / `parent123` (Security - Robert Kariuki)

### Students
- **Multiple students** linked to parent accounts
- Realistic data: admission numbers, classes, fee balances, NEMIS numbers
- Proper parent-student relationships

## Test Data Files

The test data comes from:
- **`backend/migrations/comprehensive-seed.sql`** - Main comprehensive test data
- **`backend/migrations/clean-seed.sql`** - Clean seed with reset
- **`backend/migrations/realistic-seed.sql`** - Realistic test scenarios

## Step-by-Step: Loading Test Data

### Step 1: Verify Database is Ready

Visit diagnostic page and click **"Check Database Status"**

You should see:
- ✅ Database connected
- ✅ Users table exists
- ✅ Students table exists (after migrations)

### Step 2: Run Migrations (If Needed)

If status shows "tables do not exist":
1. Click **"Run Migrations"**
2. Wait for success message
3. Click **"Check Database Status"** again to verify

### Step 3: Load Test Data

1. Click **"Load Test Data"**
2. Confirm the action
3. Wait 30-60 seconds (data is being inserted)
4. You'll see a summary with:
   - Number of admins, parents, staff, students created
   - Test credentials for each user type

### Step 4: Verify Data Loaded

Click **"Check Database Status"** again to see:
- User counts for each role
- Student count
- Confirmation that data is loaded

## Test Credentials

After loading test data, you can use:

### Admin
- **Email**: `admin@hechlink.edu`
- **Password**: `admin123`

### Parents (Example)
- **Email**: `sarah.onyango@example.com`
- **Password**: `parent123`
- **Has Students**: Emma Onyango, James Onyango

### Staff (Example)
- **Email**: `staff1@hechlink.edu`
- **Password**: `parent123`
- **Department**: Teaching
- **Name**: John Mwangi

## What Gets Created

### Users Table
- Admin users
- Parent users
- Staff users

### Parents Table
- Parent profiles linked to user accounts
- Names, emails, phone numbers

### Students Table
- Student records with:
  - Admission numbers (ADM)
  - Names
  - Classes
  - Fee balances
  - NEMIS numbers
  - Linked to parent accounts

### Staff Table
- Staff profiles with:
  - Staff numbers
  - Departments
  - Names, emails, phones

## Using Test Data for Demos

### For Admin Dashboard Demo
1. Login as: `admin@hechlink.edu` / `admin123`
2. You'll see:
   - All students in the system
   - All parents
   - All staff
   - Charts populated with data
   - Fee summaries

### For Parent Portal Demo
1. Login as: `sarah.onyango@example.com` / `parent123`
2. You'll see:
   - Linked students (Emma and James Onyango)
   - Fee information
   - Student details

### For Staff Demo
1. Login as: `staff1@hechlink.edu` / `staff123`
2. Access staff features

## API Endpoints for Test Data

### Load Test Data
   ```bash
POST /api/setup/load-test-data
```

**Response:**
```json
{
  "success": true,
  "message": "Test data loaded successfully!",
  "data": {
    "admins": 1,
    "parents": 10,
    "staff": 5,
    "students": 15
  },
  "credentials": {
    "admin": {
      "email": "admin@hechlink.edu",
      "password": "admin123"
    },
    "parents": {
      "email": "sarah.onyango@example.com",
      "password": "parent123"
    },
    "staff": {
      "email": "staff1@hechlink.edu",
      "password": "parent123"
    }
  }
}
```

### Check Status (See What's Loaded)
   ```bash
GET /api/setup/status
```

**Response includes:**
- User counts (admin, parent, staff)
- Student count
- Table existence status

## Troubleshooting

### Issue: "Seed file not found"
- **Solution**: Make sure `comprehensive-seed.sql` exists in `backend/migrations/`
- Check Render logs for file path issues

### Issue: "Foreign key constraint error"
- **Solution**: Make sure migrations ran first
- Click "Run Migrations" before loading test data

### Issue: "Data loads but users can't login"
- **Solution**: 
  1. Click "Test Login" with the credentials
  2. If password wrong, click "Create Admin User" to reset
  3. For parents/staff, the seed uses known password hashes

### Issue: "Takes too long to load"
- **Normal**: Loading comprehensive data takes 30-60 seconds
- **Free tier**: Render may be slow on first request
- **Wait**: Don't refresh, let it complete

## Data Summary

After loading test data, you typically get:

- **1 Admin** user
- **10-15 Parent** users
- **5 Staff** members
- **15-20 Students** (linked to parents)
- **Realistic relationships** (parents have children with matching last names)
- **Fee balances** for students
- **Classes and grades** for students

## Next Steps After Loading

1. ✅ **Test Admin Login**: Use admin credentials
2. ✅ **Test Parent Login**: Use parent credentials
3. ✅ **View Dashboard**: See populated charts and data
4. ✅ **Import More Data**: Use admin panel to import CSV/Excel
5. ✅ **Create More Users**: Use registration pages

## Files Reference

- **Test Data SQL**: `backend/migrations/comprehensive-seed.sql`
- **Diagnostic Page**: `web/public/api-test.html`
- **Setup Routes**: `backend/routes/setup.js`

---

**All test data can be loaded through the web interface - no shell access needed!**
