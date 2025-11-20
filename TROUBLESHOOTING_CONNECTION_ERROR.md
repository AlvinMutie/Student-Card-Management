# 🔧 Troubleshooting: "Cannot connect to backend server"

**Error**: `Cannot connect to backend server. Make sure the API is reachable at https://student-card-management.onrender.com/api.`

This means your frontend (Netlify) cannot reach your backend (Render). Follow these steps:

---

## Step 1: Verify Backend is Running

1. **Check Render Dashboard**
   - Go to your backend service in Render
   - Check the status - it should show **"Live"** (green)
   - If it shows **"Sleeping"** or **"Stopped"**, the service is down

2. **Check Backend Logs**
   - Click on **"Logs"** tab
   - Look for any errors or crashes
   - You should see: `Server is running on http://localhost:10000`

3. **If Service is Sleeping (Free Tier)**
   - Render free tier services spin down after 15 minutes of inactivity
   - **First request will take 30-60 seconds** to wake up
   - Try refreshing/login again and wait
   - Consider upgrading to paid tier for production

---

## Step 2: Test Backend Directly

Test if your backend is accessible from outside:

1. **Test Health Endpoint**
   ```bash
   curl https://student-card-management.onrender.com/api/health
   ```
   
   **Expected Response:**
   ```json
   {"status":"ok","message":"Student Card Management API is running"}
   ```

2. **If curl fails:**
   - Backend might be down or URL is wrong
   - Check the exact service name in Render dashboard
   - The URL should match: `https://YOUR-SERVICE-NAME.onrender.com`

3. **If curl works but browser doesn't:**
   - Likely a CORS issue (see Step 3)

---

## Step 3: Verify Backend URL

1. **Check Your Render Service Name**
   - In Render dashboard, your backend service has a name
   - The URL format is: `https://SERVICE-NAME.onrender.com`
   - Make sure this matches what's in Netlify

2. **Check Netlify Environment Variable**
   - Go to Netlify Dashboard → Your site → **Site settings** → **Environment variables**
   - Find `API_BASE_URL`
   - It should be: `https://student-card-management.onrender.com/api`
   - **Important**: Must include `/api` at the end
   - **Important**: Must use `https://` (not `http://`)
   - **Important**: No trailing slash after `/api`

3. **Update if Wrong**
   - Edit `API_BASE_URL` to match your actual Render service URL
   - Click **"Save"**
   - Go to **Deploys** tab → **Trigger deploy** → **Deploy site**

---

## Step 4: Check CORS Configuration

If the backend is accessible but browser requests are blocked:

1. **Check Render Environment Variables**
   - Go to Render backend service → **Environment** tab
   - Look for `CORS_ORIGIN`
   - It should be set to your Netlify URL:
     ```
     https://your-netlify-site.netlify.app
     ```
   - Or use wildcard (less secure):
     ```
     https://*.netlify.app
     ```

2. **Update CORS_ORIGIN**
   - If missing or wrong, add/update it
   - Click **"Save Changes"**
   - Render will automatically redeploy

3. **Check Browser Console**
   - Open your Netlify site
   - Press F12 → **Console** tab
   - Try to login
   - Look for CORS errors like:
     ```
     Access to fetch at '...' from origin '...' has been blocked by CORS policy
     ```

---

## Step 5: Check Browser Network Tab

1. **Open Developer Tools**
   - Press F12 on your Netlify site
   - Go to **Network** tab
   - Clear the network log (trash icon)

2. **Try to Login**
   - Enter credentials and click login
   - Look for the login request in Network tab

3. **Check the Request**
   - Find the request to `/api/auth/login`
   - Click on it
   - Check:
     - **Status**: Should be 200 (success) or 401 (wrong credentials)
     - **Status**: If it's `(failed)` or `CORS error`, it's a connection/CORS issue
     - **Request URL**: Should match your Render backend URL
     - **Response**: Check what error message is returned

---

## Step 6: Verify Runtime Config

The frontend uses `runtime-config.js` to get the API URL. Check if it's correct:

1. **In Browser**
   - Open your Netlify site
   - Press F12 → **Console** tab
   - Type: `window.StudentCardConfig`
   - Press Enter
   - Check `apiBaseUrl` - should match your Render backend URL

2. **If Wrong**
   - The build script might not have run correctly
   - Check Netlify build logs
   - Make sure `API_BASE_URL` is set in Netlify environment variables
   - Redeploy Netlify site

---

## Step 7: Common Issues & Solutions

### Issue: Backend URL is Wrong

**Symptom**: Error shows different URL than your actual Render service

**Solution**:
1. Get correct URL from Render dashboard
2. Update `API_BASE_URL` in Netlify
3. Redeploy Netlify

### Issue: Backend is Sleeping (Free Tier)

**Symptom**: First request times out, subsequent requests work

**Solution**:
- Wait 30-60 seconds for first request
- Or upgrade to paid tier
- Or use a service like UptimeRobot to ping your backend every 5 minutes

### Issue: CORS Blocking Requests

**Symptom**: Network tab shows CORS error, curl works fine

**Solution**:
1. Set `CORS_ORIGIN` in Render to your Netlify URL
2. Make sure it matches exactly (including `https://`)
3. Redeploy backend

### Issue: SSL/HTTPS Mismatch

**Symptom**: Mixed content warnings in console

**Solution**:
- Make sure both frontend and backend use HTTPS
- Don't mix HTTP and HTTPS

### Issue: Build Script Didn't Run

**Symptom**: `runtime-config.js` shows localhost URL

**Solution**:
1. Check Netlify build logs
2. Verify build command: `node scripts/generate-runtime-config.js`
3. Check that `API_BASE_URL` is set in Netlify environment variables
4. Redeploy

---

## Quick Checklist

- [ ] Backend service shows "Live" status in Render
- [ ] Backend health endpoint works: `curl https://your-backend.onrender.com/api/health`
- [ ] `API_BASE_URL` in Netlify matches your Render backend URL (with `/api`)
- [ ] `CORS_ORIGIN` in Render matches your Netlify URL
- [ ] Both use HTTPS (not HTTP)
- [ ] Netlify has been redeployed after setting `API_BASE_URL`
- [ ] Render has been redeployed after setting `CORS_ORIGIN`
- [ ] Browser console shows correct API URL in `window.StudentCardConfig`

---

## Test Commands

**Test Backend Health:**
```bash
curl https://student-card-management.onrender.com/api/health
```

**Test Backend Login:**
```bash
curl -X POST https://student-card-management.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hechlink.edu","password":"admin123"}'
```

**Check CORS (from browser console on Netlify site):**
```javascript
fetch('https://student-card-management.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## Still Not Working?

1. **Check Render Logs** - Look for startup errors or crashes
2. **Check Netlify Build Logs** - Verify build completed successfully
3. **Check Browser Console** - Look for specific error messages
4. **Check Network Tab** - See the exact request/response
5. **Verify URLs Match** - Double-check all URLs are correct

---

**Most Common Fix**: Update `API_BASE_URL` in Netlify to match your exact Render service URL, then redeploy Netlify.

