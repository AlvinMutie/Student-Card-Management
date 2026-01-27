# Quick Deployment Script for Admin Dashboard + SuperAdmin Module
# Run this in PowerShell from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Script - Admin Dashboard  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check git status
Write-Host "[1/5] Checking git status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "Files to be committed:" -ForegroundColor Green
Write-Host "  - Admin Dashboard (Pelio theme)" -ForegroundColor White
Write-Host "  - SuperAdmin Module (NEW)" -ForegroundColor White
Write-Host "  - Trial site updates" -ForegroundColor White
Write-Host ""

# Step 2: Confirm deployment
$confirm = Read-Host "Do you want to proceed with deployment? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Red
    exit
}

# Step 3: Stage files
Write-Host ""
Write-Host "[2/5] Staging files..." -ForegroundColor Yellow
git add web/admin/
git add web/superadmin/
git add web/trial_*.html
git add DEPLOYMENT_GUIDE.md
git add deploy.ps1

Write-Host "✓ Files staged successfully" -ForegroundColor Green

# Step 4: Commit
Write-Host ""
Write-Host "[3/5] Creating commit..." -ForegroundColor Yellow
git commit -m "feat: Add SuperAdmin module and update Admin dashboard with Pelio theme

- Implemented enterprise SuperAdmin portal with tenant management
- Redesigned admin dashboard with modern Pelio green theme
- Added school onboarding, user management, and audit logs
- Updated all admin pages with consistent styling
- Improved sidebar navigation and layout system"

Write-Host "✓ Commit created successfully" -ForegroundColor Green

# Step 5: Push to GitHub
Write-Host ""
Write-Host "[4/5] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "✗ Push failed. Please check your connection and try again." -ForegroundColor Red
    exit 1
}

# Step 6: Display VPS instructions
Write-Host ""
Write-Host "[5/5] Deployment to GitHub complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps: Deploy to VPS            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run these commands on your VPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. SSH into VPS:" -ForegroundColor White
Write-Host "     ssh your-username@your-vps-ip" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Navigate to project:" -ForegroundColor White
Write-Host "     cd /path/to/Student-Card-Management" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Pull latest changes:" -ForegroundColor White
Write-Host "     git pull origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Set permissions:" -ForegroundColor White
Write-Host "     sudo chown -R www-data:www-data web/" -ForegroundColor Gray
Write-Host "     sudo chmod -R 755 web/" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. Restart web server:" -ForegroundColor White
Write-Host "     sudo systemctl restart apache2" -ForegroundColor Gray
Write-Host "     # OR" -ForegroundColor Gray
Write-Host "     sudo systemctl restart nginx" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
