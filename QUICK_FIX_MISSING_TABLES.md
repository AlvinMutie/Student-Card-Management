# 🚨 Quick Fix: Missing Database Tables

**Error**: `relation "users" does not exist`

**Solution**: Run the database schema migration to create all tables.

---

## Method 1: Using Render Shell (Easiest) ⭐

1. **Go to Render Dashboard**
   - Open your **PostgreSQL database** service (not the web service)
   - Click on the **"Connect"** button
   - Select **"Shell"** from the dropdown

2. **This opens a psql prompt** - you'll see something like:
   ```
   student_card_management=>
   ```

3. **Copy the Schema**
   - Open `backend/migrations/schema.sql` from your local project
   - Copy **ALL** the contents (Ctrl+A, Ctrl+C)

4. **Paste into the Shell**
   - Right-click in the Render shell window
   - Select **"Paste"** (or Ctrl+V)
   - Press **Enter**

5. **Wait for Completion**
   - You should see multiple `CREATE TABLE` messages
   - When done, you'll see the prompt again: `student_card_management=>`

6. **Verify Tables Were Created**
   - Type this command and press Enter:
     ```sql
     \dt
     ```
   - You should see a list of tables:
     - `users`
     - `students`
     - `parents`
     - `staff`

7. **Exit the Shell**
   - Type `\q` and press Enter

---

## Method 2: Using Local psql (Alternative)

If you have PostgreSQL client tools installed locally:

1. **Get External Database URL**
   - In Render database dashboard, copy the **External Database URL**
   - It looks like: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/student_card_management`

2. **Run Migration**
   ```bash
   psql "postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/student_card_management" -f backend/migrations/schema.sql
   ```

3. **Verify**
   ```bash
   psql "postgresql://..." -c "\dt"
   ```

---

## Method 3: Using pgAdmin or DBeaver (GUI Tools)

1. **Connect to Database**
   - Use the External Database URL from Render
   - Host: `dpg-xxxxx-a.oregon-postgres.render.com`
   - Port: `5432`
   - Database: `student_card_management`
   - Username/Password: From the connection string

2. **Run SQL Script**
   - Open `backend/migrations/schema.sql`
   - Copy all contents
   - Paste into SQL query window
   - Execute

---

## After Running Migration

1. **Check Render Logs**
   - Go to your backend service → **Logs**
   - You should now see: `✅ Users table exists` (after next deploy/restart)

2. **Test Login**
   - Try logging in again from your Netlify site
   - If you haven't seeded data yet, you'll need to create a user first (see below)

---

## Optional: Seed Test Data

After creating tables, you might want to add test users:

1. **Connect to Database** (using Render Shell or local psql)

2. **Run Seed Script**
   ```bash
   psql "[External Database URL]" -f backend/migrations/clean-seed.sql
   ```

3. **Or Manually Create Admin User**
   
   First, generate a password hash for 'admin123':
   ```bash
   # In your local backend directory:
   node -e "const bcrypt=require('bcrypt');bcrypt.hash('admin123',10).then(h=>console.log(h))"
   ```
   
   Then insert the user (replace `HASH_HERE` with the generated hash):
   ```sql
   INSERT INTO users (email, password_hash, role) 
   VALUES ('admin@hechlink.edu', 'HASH_HERE', 'admin')
   ON CONFLICT (email) DO NOTHING;
   ```

---

## Verify Everything Works

1. **Check Backend Logs**
   - After redeploy, you should see:
     ```
     ✅ Database connection successful
     ✅ Users table exists
     ```

2. **Test Health Endpoint**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

3. **Test Login**
   - Try logging in from your Netlify site
   - Or test directly:
     ```bash
     curl -X POST https://your-backend.onrender.com/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"admin@hechlink.edu","password":"admin123"}'
     ```

---

## Still Having Issues?

- Make sure you're connected to the **correct database** (check the database name in the connection string)
- Verify the schema.sql file is complete (should have CREATE TABLE statements for users, students, parents, staff)
- Check Render database logs for any errors during migration
- Ensure you have the correct permissions (Render should handle this automatically)

---

**Once tables are created, your login should work!** 🎉

