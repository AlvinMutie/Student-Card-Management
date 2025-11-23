# Quick Fix: Backend Connection Error

## The Problem
Your frontend is trying to connect to:
```
https://student-card-management-api.onrender.com/api
```

But this backend **doesn't exist yet** or **isn't accessible**.

## Two Solutions

### Option 1: Deploy Backend First (Recommended)

**Step 1**: Deploy your backend to Render
- Follow `DEPLOYMENT_READY.md` Part 1
- This will create your backend at a URL like: `https://student-card-management-api-xxxx.onrender.com`

**Step 2**: Get your actual backend URL
- Go to [Render Dashboard](https://dashboard.render.com)
- Find your web service
- Copy the URL (e.g., `https://student-card-management-api-abc123.onrender.com`)

**Step 3**: Update Netlify
- Go to Netlify Dashboard → Your site → **Site settings** → **Environment variables**
- Find `API_BASE_URL`
- Set it to: `https://YOUR-ACTUAL-URL.onrender.com/api`
- Click **Save**

**Step 4**: Redeploy Netlify
- **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Option 2: Use Diagnostic Tool (Temporary Testing)

I've created a diagnostic page to help you:

1. **Visit**: `https://hechl1nk.netlify.app/public/api-test.html`
2. This page will:
   - Show your current API configuration
   - Let you test different backend URLs
   - Allow you to temporarily set a new API URL

## Verify Your Backend is Working

Test if your backend is accessible:

```bash
curl https://student-card-management-api.onrender.com/api/health
```

**If you get:**
- ✅ `{"status":"ok",...}` → Backend is working!
- ❌ `404 Not Found` → Backend not deployed
- ❌ `Connection refused` → Backend not running
- ❌ `Timeout` → Backend might be sleeping (free tier)

## Important Notes

1. **The URL in `netlify.toml` is a PLACEHOLDER**
   - It says: `https://student-card-management-api.onrender.com/api`
   - This is just an example - replace it with YOUR actual Render URL

2. **Render URLs are unique**
   - Your actual URL will be something like: `https://student-card-management-api-abc123.onrender.com`
   - The `-abc123` part is unique to your service

3. **Free tier backends sleep**
   - First request after inactivity takes 30-60 seconds
   - This is normal for free tier

## Quick Checklist

- [ ] Backend deployed to Render?
- [ ] Backend health check works: `curl https://YOUR-BACKEND.onrender.com/api/health`
- [ ] `API_BASE_URL` set in Netlify environment variables?
- [ ] `API_BASE_URL` matches your actual Render URL (with `/api`)?
- [ ] Netlify redeployed after setting `API_BASE_URL`?
- [ ] Checked diagnostic page: `/public/api-test.html`?

## Files Created/Updated

- ✅ `web/public/api-test.html` - Diagnostic tool for testing API connections
- ✅ `web/shared/api-client.js` - Improved error messages
- ✅ `scripts/generate-runtime-config.js` - Fixed default URL

## Next Steps

1. **If backend not deployed**: Deploy it first (see `DEPLOYMENT_READY.md`)
2. **If backend deployed**: Update `API_BASE_URL` in Netlify with your actual URL
3. **Test**: Use the diagnostic page at `/public/api-test.html`

---

**The error will persist until your backend is deployed and the URL is correctly configured in Netlify.**

