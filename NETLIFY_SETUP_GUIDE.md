# Netlify Setup Guide - New Account Configuration

Since you've changed to a new Netlify free tier account, follow these steps to get your frontend connected to the backend:

## Step 1: Set Environment Variable in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (or create a new one if needed)
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable**
5. Add the following:
   - **Key**: `API_BASE_URL`
   - **Value**: `https://student-card-management-api.onrender.com/api`
6. Click **Save**

## Step 2: Trigger a New Build

After setting the environment variable:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete (this will regenerate `runtime-config.js` with the correct API URL)

## Step 3: Verify Backend is Running

Before deploying, test if your backend is accessible:

1. Open: https://student-card-management-api.onrender.com/api/health
2. Or use the diagnostic page: Your Netlify URL + `/public/api-test.html`

## Step 4: Alternative - Manual Configuration

If environment variables don't work, you can manually update the runtime config:

1. Edit `web/runtime-config.js`
2. Change the API URL to: `https://student-card-management-api.onrender.com/api`

## Step 5: Check Your New Netlify Site URL

If your Netlify site URL changed, update any hardcoded references:

- Check `netlify.toml` for any site-specific URLs
- Update any documentation with the new URL

## Troubleshooting

### Backend Connection Issues

1. **Backend might be sleeping** (Render free tier):
   - First request after inactivity takes 30-60 seconds
   - Visit the health endpoint to wake it up
   - Then try your frontend again

2. **CORS Issues**:
   - Make sure your Render backend has CORS configured for your new Netlify URL
   - Check `backend/server.js` CORS settings

3. **Environment Variable Not Working**:
   - Make sure variable name is exactly `API_BASE_URL` (case-sensitive)
   - Redeploy after adding the variable
   - Check build logs to see if the variable is being read

### Quick Test

Visit: `https://your-netlify-site.netlify.app/public/api-test.html`

This page will:
- Test backend connectivity
- Show current API configuration
- Allow you to run database migrations
- Load test data

## Current Configuration

- **Backend URL**: `https://student-card-management-api.onrender.com/api`
- **Frontend**: Your Netlify site
- **Config File**: `web/runtime-config.js` (auto-generated during build)

