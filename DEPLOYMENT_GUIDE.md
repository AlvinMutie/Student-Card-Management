# 🚀 Deployment Guide: Netlify + Render

This guide will walk you through deploying the Student Card Management System:
- **Frontend** → Netlify (static hosting)
- **Backend** → Render (Node.js service)
- **Database** → Render PostgreSQL (managed database)

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ A GitHub account
- ✅ A Netlify account (free tier works)
- ✅ A Render account (free tier works)
- ✅ Your code pushed to a GitHub repository
- ✅ Node.js installed locally (for testing)

---

## Part 1: Deploy Backend to Render

### Step 1: Create PostgreSQL Database on Render

1. **Log in to Render**
   - Go to [https://render.com](https://render.com)
   - Sign up or log in with your GitHub account

2. **Create a PostgreSQL Database**
   - Click **"New +"** → **"PostgreSQL"**
   - Configure:
     - **Name**: `student-card-db` (or your preferred name)
     - **Database**: `student_card_management`
     - **User**: Auto-generated (save this)
     - **Region**: Choose closest to you
     - **PostgreSQL Version**: Latest stable
     - **Plan**: Free (or paid if needed)
   - Click **"Create Database"**

3. **Save Database Connection Details**
   - Wait for the database to be created (takes ~1-2 minutes)
   - Once ready, go to the database dashboard
   - Copy the **"Internal Database URL"** (for Render services)
   - Copy the **"External Database URL"** (for local access if needed)
   - **Important**: The Internal URL looks like:
     ```
     postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/student_card_management
     ```

### Step 2: Run Database Migrations

You need to run the database schema on your Render database:

1. **Option A: Using Render Shell (Recommended)**
   - In your Render database dashboard, click **"Connect"** → **"Shell"**
   - Or use the **"psql"** connection string from the database dashboard
   - Run:
     ```bash
     psql <your-external-database-url>
     ```
   - Then run:
     ```sql
     \i /path/to/migrations/schema.sql
     ```
   - Or paste the contents of `backend/migrations/schema.sql` directly

2. **Option B: Using Local psql**
   - Install PostgreSQL client tools locally
   - Use the External Database URL:
     ```bash
     psql "postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/student_card_management" -f backend/migrations/schema.sql
     ```

3. **Option C: Using a Migration Script (if you have one)**
   - Some projects have migration scripts that can be run via Node.js
   - Check `backend/migrations/` for available scripts

### Step 3: Create Web Service on Render

1. **Create a New Web Service**
   - In Render dashboard, click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the repository containing your code

2. **Configure the Service**
   - **Name**: `student-card-backend` (or your preferred name)
   - **Region**: Same as your database (recommended)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` (important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

3. **Set Environment Variables**
   Click **"Advanced"** → **"Add Environment Variable"** and add:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | Required |
   | `DATABASE_URL` | `[Internal Database URL from Step 1]` | Use the **Internal** URL |
   | `JWT_SECRET` | `[Generate a random secret]` | Use a strong random string |
   | `PORT` | `10000` | Render sets this automatically, but you can specify |
   | `CORS_ORIGIN` | `https://your-netlify-site.netlify.app` | Replace with your Netlify URL (you'll update this after deploying frontend) |

   **Generate JWT_SECRET:**
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # Or use an online generator:
   # https://www.random.org/strings/
   ```

4. **Create the Service**
   - Click **"Create Web Service"**
   - Render will start building and deploying your backend
   - Wait for the build to complete (takes ~2-5 minutes)

5. **Get Your Backend URL**
   - Once deployed, your backend will be available at:
     ```
     https://student-card-backend.onrender.com
     ```
   - (Your actual URL will be shown in the Render dashboard)
   - **Save this URL** - you'll need it for the frontend!

### Step 4: Verify Backend Deployment

1. **Test the Health Endpoint**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Test the API**
   ```bash
   curl https://your-backend-url.onrender.com/api/students
   ```
   Should return a JSON response (may be empty array if no data)

3. **Check Logs**
   - In Render dashboard, go to your service → **"Logs"**
   - Look for any errors or connection issues

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Prepare Your Repository

1. **Ensure `netlify.toml` is in the root**
   - The file should already exist with:
     ```toml
     [build]
       command = "node scripts/generate-runtime-config.js"
       publish = "web"
     ```

2. **Verify the build script exists**
   - Check that `scripts/generate-runtime-config.js` exists
   - This script generates `web/runtime-config.js` with the correct API URL

### Step 2: Deploy to Netlify

1. **Log in to Netlify**
   - Go to [https://netlify.com](https://netlify.com)
   - Sign up or log in with your GitHub account

2. **Create a New Site**
   - Click **"Add new site"** → **"Import an existing project"**
   - Select **"GitHub"** and authorize Netlify
   - Choose your repository

3. **Configure Build Settings**
   - **Base directory**: Leave empty (root)
   - **Build command**: `node scripts/generate-runtime-config.js`
   - **Publish directory**: `web`
   - **Branch to deploy**: `main` (or your default branch)

4. **Set Environment Variables**
   Click **"Show advanced"** → **"New variable"** and add:

   | Key | Value |
   |-----|-------|
   | `API_BASE_URL` | `https://your-backend-url.onrender.com/api` |

   **Important**: Replace `your-backend-url.onrender.com` with your actual Render backend URL (from Part 1, Step 3).

5. **Deploy**
   - Click **"Deploy site"**
   - Netlify will start building and deploying
   - Wait for the build to complete (takes ~1-2 minutes)

6. **Get Your Frontend URL**
   - Once deployed, your site will be available at:
     ```
     https://random-name-12345.netlify.app
     ```
   - You can customize this in **"Site settings"** → **"Change site name"**

### Step 3: Update Backend CORS Settings

1. **Go back to Render**
   - Open your backend service dashboard
   - Go to **"Environment"** tab

2. **Update CORS_ORIGIN**
   - Update the `CORS_ORIGIN` variable to your Netlify URL:
     ```
     https://your-netlify-site.netlify.app
     ```
   - Or use a wildcard (less secure but easier):
     ```
     https://*.netlify.app
     ```
   - Click **"Save Changes"**
   - Render will automatically redeploy with the new settings

### Step 4: Verify Frontend Deployment

1. **Visit Your Netlify Site**
   - Open your Netlify URL in a browser
   - You should see the landing page

2. **Test Login**
   - Try logging in with test credentials:
     - **Admin**: `admin@hechlink.edu` / `admin123`
     - **Parent**: Check your seed data for parent credentials

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to **Console** tab
   - Look for any API connection errors
   - Verify that API calls are going to your Render backend URL

---

## Part 3: Seed Test Data (Optional)

If you want to populate your production database with test data:

1. **Connect to Your Render Database**
   ```bash
   psql "postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/student_card_management"
   ```

2. **Run Seed Script**
   ```bash
   psql "postgresql://..." -f backend/migrations/clean-seed.sql
   ```

   Or manually paste the contents of `backend/migrations/clean-seed.sql` into the psql prompt.

3. **Verify Data**
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM students;
   SELECT COUNT(*) FROM parents;
   ```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Backend fails to start
- **Solution**: Check Render logs for errors
- Common issues:
  - Missing environment variables
  - Database connection string incorrect
  - Port configuration issues

**Problem**: Database connection fails
- **Solution**: 
  - Verify `DATABASE_URL` uses the **Internal** URL (not External)
  - Check that database migrations have been run
  - Ensure database is in the same region as your service

**Problem**: CORS errors
- **Solution**:
  - Verify `CORS_ORIGIN` includes your Netlify URL
  - Check that the URL matches exactly (including `https://`)
  - Try using wildcard: `https://*.netlify.app`

### Frontend Issues

**Problem**: Frontend shows "Cannot connect to backend"
- **Solution**:
  - Verify `API_BASE_URL` in Netlify environment variables
  - Check that the URL includes `/api` at the end
  - Ensure backend is running (check Render dashboard)

**Problem**: Build fails on Netlify
- **Solution**:
  - Check build logs in Netlify dashboard
  - Verify `scripts/generate-runtime-config.js` exists
  - Ensure Node.js version is compatible (Netlify uses Node 18 by default)

**Problem**: API calls go to localhost
- **Solution**:
  - Verify `API_BASE_URL` is set in Netlify environment variables
  - Clear browser cache and hard refresh (Ctrl+Shift+R)
  - Check `web/runtime-config.js` in the deployed site (should show Render URL)

### Database Issues

**Problem**: Tables don't exist
- **Solution**: Run migrations (see Part 1, Step 2)

**Problem**: Can't connect to database
- **Solution**:
  - Use Internal URL for Render services
  - Use External URL only for local connections
  - Check database is running in Render dashboard

---

## 📝 Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
DATABASE_URL=[Internal Database URL from Render]
JWT_SECRET=[Random secure string]
PORT=10000 (optional, Render sets this)
CORS_ORIGIN=https://your-netlify-site.netlify.app
```

### Netlify (Frontend)
```
API_BASE_URL=https://your-backend-url.onrender.com/api
```

---

## 🔄 Updating Your Deployment

### Update Backend
1. Push changes to GitHub
2. Render automatically redeploys (if auto-deploy is enabled)
3. Or manually trigger redeploy in Render dashboard

### Update Frontend
1. Push changes to GitHub
2. Netlify automatically redeploys (if auto-deploy is enabled)
3. Or manually trigger redeploy in Netlify dashboard

### Update Environment Variables
- **Render**: Go to service → Environment → Update variables → Save (auto-redeploys)
- **Netlify**: Go to site → Site settings → Environment variables → Update → Redeploy

---

## 🎉 You're Done!

Your application should now be live:
- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://your-backend.onrender.com`
- **API**: `https://your-backend.onrender.com/api`

### Test Accounts (if you seeded data)
- **Admin**: `admin@hechlink.edu` / `admin123`
- **Parent**: Check your seed data for parent emails and passwords

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

## 💡 Tips

1. **Free Tier Limitations**:
   - Render free tier services spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading to paid tier for production use

2. **Custom Domains**:
   - Both Netlify and Render support custom domains
   - Configure in site/service settings

3. **Monitoring**:
   - Use Render logs for backend monitoring
   - Use Netlify analytics for frontend monitoring

4. **Backups**:
   - Render automatically backs up PostgreSQL databases
   - Configure backup schedule in database settings

---

**Need Help?** Check the troubleshooting section above or review the logs in Render/Netlify dashboards.

