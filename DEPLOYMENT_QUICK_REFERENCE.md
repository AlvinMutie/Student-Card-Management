# 🚀 Quick Deployment Reference

## Backend (Render) - 5 Steps

1. **Create PostgreSQL Database**
   - Render Dashboard → New + → PostgreSQL
   - Save **Internal Database URL**

2. **Run Migrations**
   ```bash
   psql "[External Database URL]" -f backend/migrations/schema.sql
   ```

3. **Create Web Service**
   - Render Dashboard → New + → Web Service
   - Connect GitHub repo
   - **⚠️ Root Directory**: `backend` ⚠️ **CRITICAL!**
   - **Build**: `npm install`
   - **Start**: `npm start`

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=[Internal Database URL]
   JWT_SECRET=[Generate: openssl rand -base64 32]
   CORS_ORIGIN=https://your-netlify-site.netlify.app
   ```

5. **Deploy & Save Backend URL**
   - Wait for deployment
   - Save URL: `https://your-backend.onrender.com`

---

## Frontend (Netlify) - 4 Steps

1. **Create Site**
   - Netlify Dashboard → Add new site → Import from GitHub
   - Select your repository

2. **Configure Build**
   - **Build command**: `node scripts/generate-runtime-config.js`
   - **Publish directory**: `web`

3. **Set Environment Variable**
   ```
   API_BASE_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy & Update CORS**
   - Deploy site
   - Go back to Render → Update `CORS_ORIGIN` with Netlify URL
   - Render will auto-redeploy

---

## Environment Variables Cheat Sheet

### Render (Backend)
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal URL from Render DB |
| `JWT_SECRET` | Random string (32+ chars) |
| `CORS_ORIGIN` | Your Netlify URL |

### Netlify (Frontend)
| Variable | Value |
|----------|-------|
| `API_BASE_URL` | `https://your-backend.onrender.com/api` |

---

## Quick Test

```bash
# Test backend
curl https://your-backend.onrender.com/api/health

# Should return: {"status":"ok"}
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `npm error enoent Could not read package.json` | Set **Root Directory** to `backend` in Render service settings |
| CORS errors | Update `CORS_ORIGIN` in Render with Netlify URL |
| API calls to localhost | Check `API_BASE_URL` in Netlify env vars |
| Database connection fails | Use **Internal** Database URL (not External) |
| Build fails | Check logs, verify `scripts/generate-runtime-config.js` exists |

---

📖 **Full Guide**: See `DEPLOYMENT_GUIDE.md` for detailed instructions.

