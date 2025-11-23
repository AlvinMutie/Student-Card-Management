# Fix: Cannot Connect to Backend Server

## Error Message
```
Cannot connect to backend server. Make sure the API is reachable at 
https://student-card-management-api.onrender.com/api
```

## Quick Diagnosis

### Step 1: Check if Backend is Deployed

Test the backend health endpoint:

```bash
curl https://student-card-management-api.onrender.com/api/health
```

**Expected Response:**
```json
{"status":"ok","message":"Student Card Management API is running"}
```

**If you get:**
- `404 Not Found` → Backend not deployed or wrong URL
- `Connection refused` → Backend not running
- `Timeout` → Backend might be sleeping (free tier)

### Step 2: Verify Your Render Service URL

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your web service (should be named `student-card-management-api`)
3. Check the **URL** - it should be something like:
   - `https://student-card-management-api.onrender.com`
   - Or `https://student-card-management-api-xxxx.onrender.com`

4. **Copy the exact URL** (without `/api`)

### Step 3: Update Netlify Environment Variable

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: `hechl1nk`
3. Go to **Site settings** → **Environment variables**
4. Find or create `API_BASE_URL`
5. Set it to: `https://YOUR-ACTUAL-RENDER-URL.onrender.com/api`
   - Replace `YOUR-ACTUAL-RENDER-URL` with your actual Render service URL
   - **Important**: Include `/api` at the end
6. Click **Save**

### Step 4: Redeploy Netlify

1. In Netlify dashboard, go to **Deploys**
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete

### Step 5: Verify Runtime Config

After deployment, check the generated config:

1. Visit: `https://hechl1nk.netlify.app/runtime-config.js`
2. It should show:
   ```javascript
   win.StudentCardConfig.apiBaseUrl = 'https://YOUR-ACTUAL-RENDER-URL.onrender.com/api';
   ```
3. If it shows `localhost` or wrong URL, the environment variable wasn't picked up

## Common Issues & Solutions

### Issue 1: Backend Not Deployed Yet

**Solution**: Deploy backend to Render first

1. Follow `DEPLOYMENT_READY.md` Part 1
2. Create PostgreSQL database
3. Deploy web service
4. Set environment variables
5. Run migrations
6. Get the service URL

### Issue 2: Wrong Backend URL

**Symptoms**: 
- Health check returns 404
- URL doesn't match your Render service

**Solution**:
1. Get exact URL from Render dashboard
2. Update `API_BASE_URL` in Netlify
3. Redeploy Netlify

### Issue 3: Backend is Sleeping (Free Tier)

**Symptoms**:
- First request times out
- Subsequent requests work

**Solution**:
- Wait 30-60 seconds for backend to wake up
- Or upgrade to paid tier for always-on service

### Issue 4: CORS Error

**Symptoms**:
- Browser console shows CORS error
- Backend health check works with curl

**Solution**:
1. In Render dashboard, go to your service
2. Environment → Edit `CORS_ORIGIN`
3. Set to: `https://hechl1nk.netlify.app`
4. Save (service will restart)

### Issue 5: Environment Variable Not Set

**Symptoms**:
- `runtime-config.js` shows `localhost` or wrong URL
- Build logs don't show `API_BASE_URL`

**Solution**:
1. Verify `API_BASE_URL` is set in Netlify environment variables
2. Make sure it's in `[build.environment]` section (for build-time)
3. Or set it in Site settings → Environment variables (for runtime)
4. Redeploy

## Testing the Connection

### Test 1: Health Check

```bash
curl https://student-card-management-api.onrender.com/api/health
```

Should return:
```json
{"status":"ok","message":"Student Card Management API is running"}
```

### Test 2: From Browser Console

Open browser console on your Netlify site and run:

```javascript
fetch('https://student-card-management-api.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Test 3: Check Runtime Config

Visit: `https://hechl1nk.netlify.app/runtime-config.js`

Should show your Render backend URL.

## Files Updated

- ✅ `scripts/generate-runtime-config.js` - Fixed default URL to match netlify.toml

## Next Steps

1. **If backend not deployed**: Follow `DEPLOYMENT_READY.md` Part 1
2. **If backend deployed**: 
   - Verify URL in Render dashboard
   - Update `API_BASE_URL` in Netlify
   - Redeploy Netlify
3. **If still not working**: Check Render service logs for errors

## Quick Checklist

- [ ] Backend deployed to Render
- [ ] Backend health endpoint works: `curl https://YOUR-BACKEND.onrender.com/api/health`
- [ ] `API_BASE_URL` set in Netlify environment variables
- [ ] `API_BASE_URL` matches your Render service URL (with `/api`)
- [ ] Netlify redeployed after setting `API_BASE_URL`
- [ ] `runtime-config.js` shows correct URL
- [ ] CORS_ORIGIN set in Render to your Netlify URL

---

**Last Updated**: 2025-01-XX

