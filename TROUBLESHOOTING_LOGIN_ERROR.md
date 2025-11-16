# 🔧 Troubleshooting: "Login failed: Internal server error"

This error means your backend is receiving the login request but something is failing on the server side. Follow these steps to diagnose and fix the issue.

---

## Step 1: Check Render Backend Logs

1. **Go to Render Dashboard**
   - Open your backend service
   - Click on the **"Logs"** tab
   - Look for error messages (they'll be in red)

2. **Common Error Messages to Look For:**

   **Database Connection Error:**
   ```
   Error: connect ECONNREFUSED
   Error: password authentication failed
   Error: database does not exist
   ```
   → **Solution**: Check your `DATABASE_URL` environment variable

   **Table Missing Error:**
   ```
   Error: relation "users" does not exist
   ```
   → **Solution**: You need to run database migrations (see Step 2)

   **JWT Secret Error:**
   ```
   Error: secretOrPrivateKey must have a value
   ```
   → **Solution**: Set `JWT_SECRET` environment variable

---

## Step 2: Verify Database Connection

### Check if Database is Connected

1. **In Render Dashboard:**
   - Go to your **PostgreSQL database** service
   - Check that it shows **"Available"** status
   - Copy the **Internal Database URL** (not External)

2. **Verify DATABASE_URL in Backend:**
   - Go to your backend service → **Environment** tab
   - Check that `DATABASE_URL` is set
   - **Important**: It should use the **Internal** URL, which looks like:
     ```
     postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/student_card_management
     ```
   - Make sure it doesn't have any extra spaces or quotes

3. **Test Database Connection:**
   - In Render backend logs, you should see:
     ```
     Connected to PostgreSQL database
     ```
   - If you don't see this, the database connection is failing

---

## Step 3: Run Database Migrations

If your database tables don't exist, the login will fail. You need to run the schema migration.

### Option A: Using Render Shell (Easiest)

1. **In Render Dashboard:**
   - Go to your **PostgreSQL database** service
   - Click **"Connect"** → **"Shell"**
   - This opens a psql prompt

2. **Run the Schema:**
   - Copy the contents of `backend/migrations/schema.sql`
   - Paste it into the shell and press Enter
   - You should see `CREATE TABLE` messages

3. **Verify Tables Were Created:**
   ```sql
   \dt
   ```
   You should see tables: `users`, `students`, `parents`, `staff`

### Option B: Using Local psql

1. **Get External Database URL:**
   - In Render database dashboard, copy the **External Database URL**

2. **Run Migration:**
   ```bash
   psql "postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/student_card_management" -f backend/migrations/schema.sql
   ```

### Option C: Using a Migration Script

If you have a migration script in `backend/migrations/`, you can run it via Render Shell or locally.

---

## Step 4: Verify Environment Variables

In your Render backend service → **Environment** tab, make sure you have:

| Variable | Required | Example Value |
|----------|----------|---------------|
| `DATABASE_URL` | ✅ Yes | `postgresql://user:pass@host/db` (Internal URL) |
| `JWT_SECRET` | ✅ Yes | `your-random-secret-string-here` |
| `NODE_ENV` | ✅ Yes | `production` |
| `CORS_ORIGIN` | ⚠️ Recommended | `https://your-site.netlify.app` |

**To Generate JWT_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use an online generator
```

**After updating environment variables:**
- Click **"Save Changes"**
- Render will automatically redeploy

---

## Step 5: Seed Test Data (Optional)

If your database is empty, you won't be able to login. Seed some test data:

1. **Connect to Database** (using Render Shell or local psql)

2. **Run Seed Script:**
   ```bash
   psql "[External Database URL]" -f backend/migrations/clean-seed.sql
   ```

3. **Or Manually Insert Admin User:**
   ```sql
   -- First, generate a password hash for 'admin123'
   -- You can use: node -e "const bcrypt=require('bcrypt');bcrypt.hash('admin123',10).then(h=>console.log(h))"
   
   -- Then insert (replace HASH_HERE with the generated hash):
   INSERT INTO users (email, password_hash, role) 
   VALUES ('admin@hechlink.edu', 'HASH_HERE', 'admin')
   ON CONFLICT (email) DO NOTHING;
   ```

---

## Step 6: Test Backend Directly

Before testing from Netlify, test your backend directly:

1. **Test Health Endpoint:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok","message":"Student Card Management API is running"}`

2. **Test Login Endpoint:**
   ```bash
   curl -X POST https://your-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@hechlink.edu","password":"admin123"}'
   ```
   
   **If this works:** The backend is fine, the issue is with Netlify → Backend connection
   
   **If this fails:** Check the error message in the response

---

## Step 7: Check Netlify Configuration

1. **Verify API_BASE_URL:**
   - Go to Netlify Dashboard → Your site → **Site settings** → **Environment variables**
   - Check that `API_BASE_URL` is set to: `https://your-backend.onrender.com/api`
   - Make sure it includes `/api` at the end
   - Make sure there are no trailing slashes

2. **Redeploy Netlify:**
   - After updating environment variables, trigger a new deploy
   - Go to **Deploys** tab → **Trigger deploy** → **Deploy site**

3. **Check Browser Console:**
   - Open your Netlify site
   - Open Developer Tools (F12) → **Console** tab
   - Try to login
   - Look for error messages that show the actual API URL being called

---

## Step 8: Check CORS Configuration

If you see CORS errors in the browser console:

1. **In Render Backend:**
   - Go to **Environment** tab
   - Set `CORS_ORIGIN` to your Netlify URL:
     ```
     https://your-site.netlify.app
     ```
   - Or use wildcard (less secure):
     ```
     https://*.netlify.app
     ```

2. **Save and Redeploy:**
   - Render will automatically redeploy

---

## Common Issues Summary

| Error in Logs | Cause | Solution |
|---------------|-------|----------|
| `relation "users" does not exist` | Database tables not created | Run `schema.sql` migration |
| `password authentication failed` | Wrong database credentials | Check `DATABASE_URL` |
| `connect ECONNREFUSED` | Database not accessible | Use Internal Database URL |
| `secretOrPrivateKey must have a value` | Missing JWT_SECRET | Set `JWT_SECRET` env var |
| CORS error in browser | CORS not configured | Set `CORS_ORIGIN` in Render |
| `Invalid email or password` | User doesn't exist | Seed test data |

---

## Quick Checklist

- [ ] Backend service is running (check Render dashboard)
- [ ] Database is available (check Render dashboard)
- [ ] `DATABASE_URL` is set (use Internal URL)
- [ ] `JWT_SECRET` is set
- [ ] Database migrations have been run (`schema.sql`)
- [ ] Test data has been seeded (optional but recommended)
- [ ] `API_BASE_URL` is set in Netlify
- [ ] `CORS_ORIGIN` is set in Render
- [ ] Health endpoint works: `curl https://your-backend.onrender.com/api/health`
- [ ] Login endpoint works when tested directly with curl

---

## Still Having Issues?

1. **Check Render Logs** - Most errors will be logged there
2. **Check Browser Console** - Look for network errors or CORS issues
3. **Test Backend Directly** - Use curl to isolate if it's a backend or frontend issue
4. **Verify All Environment Variables** - Double-check spelling and values

---

**Need More Help?** Share the error messages from:
- Render backend logs
- Browser console (F12 → Console)
- Network tab (F12 → Network → look for the failed login request)

