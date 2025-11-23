# Deployment Guide - Student Card Management System

This guide will help you deploy the Student Card Management System to Render (backend) and Netlify (frontend).

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
4. **PostgreSQL Database** - Render provides free PostgreSQL databases

## Part 1: Deploy Backend to Render

### Step 1: Create PostgreSQL Database on Render

1. Go to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `student-card-db`
   - **Database**: `studentcard`
   - **User**: `studentcard_user`
   - **Plan**: Free
4. Click "Create Database"
5. **Important**: Copy the **Internal Database URL** (you'll need this later)

### Step 2: Deploy Backend Service

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `student-card-management-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if needed)

### Step 3: Set Environment Variables

In your Render service settings, add these environment variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-postgres-internal-url-from-step-1>
JWT_SECRET=<generate-a-random-secret-string>
CORS_ORIGIN=https://your-netlify-site.netlify.app
```

**To generate JWT_SECRET**, you can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Run Database Migrations

After the service is deployed, you need to run migrations:

1. Go to your Render service dashboard
2. Click "Shell" tab
3. Run:
```bash
cd backend
npm run migrate
```

Or manually run the SQL from `backend/migrations/schema.sql` in your PostgreSQL database.

### Step 5: Get Your Backend URL

Once deployed, Render will provide a URL like:
`https://student-card-management-api.onrender.com`

Your API will be available at:
`https://student-card-management-api.onrender.com/api`

**Copy this URL** - you'll need it for Netlify configuration.

## Part 2: Deploy Frontend to Netlify

### Step 1: Connect Repository

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository

### Step 2: Configure Build Settings

Netlify should auto-detect these from `netlify.toml`:

- **Build command**: `node scripts/generate-runtime-config.js`
- **Publish directory**: `web`
- **Node version**: `18`

### Step 3: Set Environment Variables

In Netlify site settings → Environment variables, add:

```
API_BASE_URL=https://student-card-management-api.onrender.com/api
```

**Important**: Replace with your actual Render backend URL from Part 1, Step 5.

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Your site will be live at: `https://your-site-name.netlify.app`

### Step 5: Update CORS in Backend

After getting your Netlify URL, update the `CORS_ORIGIN` environment variable in Render:

1. Go to Render dashboard → Your backend service
2. Environment → Edit `CORS_ORIGIN`
3. Set to: `https://your-site-name.netlify.app`
4. Save changes (service will restart)

## Part 3: Post-Deployment Checklist

### Backend Verification

1. ✅ Health check: `https://your-backend-url.onrender.com/api/health`
2. ✅ Test login endpoint: `https://your-backend-url.onrender.com/api/auth/login`
3. ✅ Verify database connection in Render logs

### Frontend Verification

1. ✅ Landing page loads: `https://your-site.netlify.app`
2. ✅ Admin login works
3. ✅ Parent registration works
4. ✅ API calls succeed (check browser console)

### Security Checklist

1. ✅ JWT_SECRET is set and secure
2. ✅ CORS_ORIGIN is set correctly
3. ✅ Database credentials are secure (not in code)
4. ✅ HTTPS is enabled (automatic on both platforms)

## Troubleshooting

### Backend Issues

**Problem**: Service won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `package.json` has correct start script

**Problem**: Database connection fails
- Verify DATABASE_URL is correct
- Check if database is running in Render
- Ensure migrations have been run

**Problem**: CORS errors
- Verify CORS_ORIGIN matches your Netlify URL exactly
- Check backend logs for CORS warnings

### Frontend Issues

**Problem**: API calls fail
- Check browser console for errors
- Verify `API_BASE_URL` in Netlify environment variables
- Check `runtime-config.js` file in deployed site

**Problem**: Build fails
- Check Netlify build logs
- Verify Node version is 18
- Ensure all dependencies are in package.json

## Quick Reference

### Backend URLs
- **Service**: `https://student-card-management-api.onrender.com`
- **API Base**: `https://student-card-management-api.onrender.com/api`
- **Health Check**: `https://student-card-management-api.onrender.com/api/health`

### Frontend URLs
- **Site**: `https://your-site-name.netlify.app`
- **Landing**: `https://your-site-name.netlify.app/public/landingpage.html`
- **Admin Login**: `https://your-site-name.netlify.app/public/index.html`

### Default Admin Credentials
- **Email**: `admin@hechlink.edu`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials after first login in production!

## Support

If you encounter issues:
1. Check Render service logs
2. Check Netlify build logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

