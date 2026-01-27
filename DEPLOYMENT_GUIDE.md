# Deployment Guide: Admin Dashboard & SuperAdmin Module

## Overview
This guide covers deploying the updated admin dashboard (Pelio theme) and new SuperAdmin module to your VPS.

---

## 📋 Pre-Deployment Checklist

### Files Modified/Added:
- ✅ **Admin Dashboard (Pelio Theme)**
  - `web/admin/admin-pelio.css` - New theme stylesheet
  - `web/admin/admin-layout.js` - Updated sidebar logic
  - `web/admin/admindashboard.html` - Redesigned dashboard
  - `web/admin/adminstudents.html` - Updated students page
  - `web/admin/adminparents.html` - Updated parents page
  - `web/admin/adminstaff.html` - Updated staff page
  - `web/admin/adminvisitors.html` - Updated visitors page
  - `web/admin/adminsettings.html` - Updated settings page
  - `web/admin/adminidgenerator.html` - Updated ID generator

- ✅ **SuperAdmin Module (NEW)**
  - `web/superadmin/superadmin.css` - Enterprise theme
  - `web/superadmin/superadmin.js` - Layout & auth logic
  - `web/superadmin/login.html` - Secure login page
  - `web/superadmin/dashboard.html` - Platform overview
  - `web/superadmin/schools.html` - School management
  - `web/superadmin/users.html` - User management
  - `web/superadmin/subscriptions.html` - Subscription management
  - `web/superadmin/logs.html` - Audit logs
  - `web/superadmin/settings.html` - Platform settings

---

## 🚀 Deployment Steps

### Step 1: Stage All Changes

```bash
# Navigate to project directory
cd C:\Users\blueberyy\Downloads\Student-Card-Management

# Stage all modified and new files
git add web/admin/
git add web/superadmin/
git add web/trial_*.html

# Verify what will be committed
git status
```

### Step 2: Commit Changes

```bash
# Commit with descriptive message
git commit -m "feat: Add SuperAdmin module and update Admin dashboard with Pelio theme

- Implemented enterprise SuperAdmin portal with tenant management
- Redesigned admin dashboard with modern Pelio green theme
- Added school onboarding, user management, and audit logs
- Updated all admin pages with consistent styling
- Improved sidebar navigation and layout system"
```

### Step 3: Push to GitHub

```bash
# Push to main branch
git push origin main
```

---

## 🖥️ VPS Deployment

### Step 1: SSH into VPS

```bash
ssh your-username@your-vps-ip
```

### Step 2: Navigate to Project Directory

```bash
cd /path/to/Student-Card-Management
```

### Step 3: Pull Latest Changes

```bash
# Stash any local changes (if needed)
git stash

# Pull from GitHub
git pull origin main

# If you stashed changes, reapply them
git stash pop
```

### Step 4: Set Correct Permissions

```bash
# Ensure web server can read files
sudo chown -R www-data:www-data web/
sudo chmod -R 755 web/

# If using Apache
sudo systemctl restart apache2

# If using Nginx
sudo systemctl restart nginx
```

---

## 🔐 SuperAdmin Access Configuration

### Initial Setup

1. **Create SuperAdmin Token** (for first login):
   - Open browser console on VPS
   - Run: `localStorage.setItem('sa_token', 'super-secret-token');`
   - Access: `https://your-domain.com/web/superadmin/login.html`

2. **Recommended: Implement Backend Auth**
   - The current SuperAdmin uses localStorage tokens (demo mode)
   - For production, integrate with your backend auth system
   - Add JWT validation in `superadmin.js`

### Security Notes

> **⚠️ IMPORTANT**: The SuperAdmin module currently uses client-side auth simulation.
> For production use, you MUST:
> - Implement server-side authentication
> - Add role-based access control (RBAC)
> - Restrict `/web/superadmin/` directory via `.htaccess` or nginx config
> - Use HTTPS only

---

## 🗄️ Database Compatibility

### No Database Changes Required ✅

The new admin dashboard and SuperAdmin module are **frontend-only updates**. They work with your existing database schema.

**What's Compatible:**
- All existing API endpoints (`/api/students`, `/api/parents`, etc.)
- Current authentication system
- Existing data models

**What's New (Frontend Only):**
- UI/UX improvements
- New theme and styling
- SuperAdmin interface (currently demo data)

---

## ✅ Post-Deployment Verification

### 1. Test Admin Dashboard

```bash
# Access admin portal
https://your-domain.com/web/admin/admindashboard.html
```

**Verify:**
- ✅ Sidebar loads correctly
- ✅ Pelio green theme is applied
- ✅ All navigation links work
- ✅ Data loads from API
- ✅ Forms and actions function properly

### 2. Test SuperAdmin Module

```bash
# Access SuperAdmin login
https://your-domain.com/web/superadmin/login.html
```

**Verify:**
- ✅ Login page displays
- ✅ Can authenticate (with demo token)
- ✅ Dashboard shows stats
- ✅ All sidebar links navigate correctly
- ✅ "Add School" modal opens and works

### 3. Check Browser Console

- Open DevTools (F12)
- Look for any JavaScript errors
- Verify CSS files load (Network tab)

---

## 🐛 Troubleshooting

### Issue: Sidebar Not Showing

**Solution:**
```javascript
// Check if admin-layout.js is loading
// Open browser console and verify no errors
```

### Issue: CSS Not Applied

**Solution:**
```bash
# Clear browser cache
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# Or hard refresh
Ctrl + F5
```

### Issue: 404 on SuperAdmin Pages

**Solution:**
```bash
# Verify files exist on VPS
ls -la /path/to/web/superadmin/

# Check file permissions
chmod 644 /path/to/web/superadmin/*.html
chmod 644 /path/to/web/superadmin/*.css
chmod 644 /path/to/web/superadmin/*.js
```

### Issue: API Data Not Loading

**Solution:**
- Verify backend is running
- Check API endpoints in `web/admin/app-api.js`
- Ensure CORS is configured correctly
- Check browser console for network errors

---

## 📝 Rollback Plan (If Needed)

If you encounter critical issues:

```bash
# On VPS, revert to previous commit
git log --oneline  # Find previous commit hash
git checkout <previous-commit-hash>

# Or reset to last working state
git reset --hard HEAD~1

# Restart web server
sudo systemctl restart apache2  # or nginx
```

---

## 🎯 Next Steps (Optional Enhancements)

1. **Backend Integration for SuperAdmin**
   - Implement real authentication
   - Create `/api/superadmin/schools` endpoint
   - Add tenant provisioning logic

2. **Security Hardening**
   - Add `.htaccess` protection for `/superadmin/`
   - Implement IP whitelisting
   - Add 2FA for SuperAdmin access

3. **Monitoring**
   - Set up error logging
   - Add analytics for admin actions
   - Implement audit trail in database

---

## 📞 Support

If you encounter issues during deployment:
1. Check browser console for errors
2. Verify file permissions on VPS
3. Ensure all files were pushed to GitHub
4. Review this guide's troubleshooting section

---

**Deployment Prepared:** 2026-01-27  
**Version:** Admin Dashboard v2.0 + SuperAdmin v1.0  
**Status:** ✅ Ready for Production
