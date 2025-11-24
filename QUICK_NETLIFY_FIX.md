# Quick Fix for New Netlify Account

## Immediate Steps (5 minutes)

### 1. Update Netlify Environment Variable

1. Go to: https://app.netlify.com
2. Select your site
3. **Site settings** → **Environment variables** → **Add variable**
4. Set:
   - **Key**: `API_BASE_URL`
   - **Value**: `https://student-card-management-api.onrender.com/api`
5. **Save**

### 2. Update Render Backend CORS (if needed)

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Add/Update:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://your-new-netlify-site.netlify.app`
   - (Replace with your actual Netlify URL)
5. **Save Changes** (this will restart the service)

### 3. Redeploy Frontend

1. In Netlify, go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

### 4. Test Connection

Visit: `https://your-netlify-site.netlify.app/public/api-test.html`

This page will:
- Show your current API configuration
- Test backend connectivity
- Help diagnose any issues

## Alternative: Manual Runtime Config Update

If environment variables don't work immediately, manually update:

**File**: `web/runtime-config.js`

Change line 10 to:
```javascript
win.StudentCardConfig.apiBaseUrl = 'https://student-card-management-api.onrender.com/api';
```

Then commit and push to trigger a new deploy.

## Backend Might Be Sleeping

If you get connection errors:

1. First, wake up the backend by visiting:
   - https://student-card-management-api.onrender.com/api/health
2. Wait 30-60 seconds (Render free tier cold start)
3. Then try your frontend again

## Current Status

✅ **Backend URL**: `https://student-card-management-api.onrender.com/api`  
✅ **CORS**: Updated to allow any Netlify domain  
✅ **Runtime Config**: Defaults to Render API for production  

## Still Not Working?

1. Check browser console for specific error messages
2. Visit `/public/api-test.html` for diagnostics
3. Verify backend is running: https://student-card-management-api.onrender.com/api/health
4. Check Netlify build logs for environment variable issues

