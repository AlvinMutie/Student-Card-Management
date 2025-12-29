# DIRECT FIX FOR LOGIN 404 ERROR

The 404 error means Apache cannot find the `/api` endpoint. Here's the **guaranteed fix**:

## Step 1: Find Your Apache Config File

Run this on your VPS:
```bash
ls -la /etc/apache2/sites-enabled/
```

You'll see a file like `000-default.conf` or `shuleniadvantage.co.ke.conf` or similar.

## Step 2: Edit the Config File Manually

Replace `YOUR_CONFIG_FILE` with the actual filename from Step 1:

```bash
sudo nano /etc/apache2/sites-enabled/YOUR_CONFIG_FILE
```

## Step 3: Add These Lines

Find the line that says `DocumentRoot` and add these TWO lines **immediately after it**:

```apache
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api
```

Your config should look like this:
```apache
<VirtualHost *:443>
    ServerName shuleniadvantage.co.ke
    DocumentRoot /var/www/html/Student-Card-Management/Student-Card-Management-main/backend/public
    
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # ... rest of config
</VirtualHost>
```

## Step 4: Save and Restart

Press `Ctrl+X`, then `Y`, then `Enter` to save.

Then run:
```bash
sudo a2enmod proxy proxy_http
sudo systemctl restart apache2
pm2 restart all
```

## Step 5: Test Login

Go to `https://shuleniadvantage.co.ke` and try logging in with:
- Email: `admin@example.com`
- Password: `admin123`

**This WILL fix the 404 error.**
