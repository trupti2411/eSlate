# Deploy `trupti-dev` → `dev.eslate.com.au` via GoDaddy cPanel

**Target:** Laravel API + React static, both on your existing GoDaddy cPanel hosting.
**Cost:** $0 additional — uses hosting you already pay for.
**Prerequisite:** GoDaddy hosting plan with cPanel access (you have this — confirmed June 2026).

Production `eslate.com.au` (legacy Express on Google App Engine) is **untouched** by this entire flow. We only add subdomains.

---

## Architecture — two subdomains, one cPanel

```
dev.eslate.com.au          → /home/<USER>/dev.eslate.com.au/        ← React static (built locally, uploaded)
api.dev.eslate.com.au      → /home/<USER>/api.dev.eslate.com.au/    ← Laravel API (docroot: .../public)
                                                                       ↓
                                                                  MySQL DB on cPanel
```

The frontend talks to `https://api.dev.eslate.com.au/api/*`. CORS is already configured for that origin.

---

## Step 1 — In cPanel, create the two subdomains (5 min)

1. Log in to GoDaddy → My Products → next to your hosting plan click **Manage** → cPanel opens.
2. In cPanel search bar type **"Subdomains"** → click the icon.
3. Create subdomain #1:
   - **Subdomain:** `api.dev`
   - **Domain:** `eslate.com.au` (dropdown)
   - **Document Root:** `/home/<USER>/api.dev.eslate.com.au/public`  *(note the `/public` suffix — Laravel needs it)*
   - Click **Create**
4. Create subdomain #2:
   - **Subdomain:** `dev`
   - **Domain:** `eslate.com.au`
   - **Document Root:** `/home/<USER>/dev.eslate.com.au`  *(no /public — React static lives directly here)*
   - Click **Create**

cPanel auto-creates the directories and adds the matching DNS records.

**Verify:** wait 2 minutes, then visit `https://api.dev.eslate.com.au` — you should see a default "Index of /" or 403 page. That's success — it means the subdomain is alive.

---

## Step 2 — Create the MySQL database (3 min)

1. In cPanel search bar → **"MySQL Databases"**.
2. Under **Create New Database**: name it `eslate_dev` → **Create Database**.
   - cPanel will actually create it as `<cpaneluser>_eslate_dev` (prefixed). Note the full name.
3. Under **Add New User**: username `eslate_app`, set a strong password — **save the password somewhere**.
4. Under **Add User to Database**: pick `<cpaneluser>_eslate_app` + `<cpaneluser>_eslate_dev` → **Add** → grant **ALL PRIVILEGES** → **Make Changes**.

---

## Step 3 — Upload Laravel to `api.dev.eslate.com.au/` (10 min)

You have **three options** depending on what your plan offers. Easiest first.

### Option A — Git Version Control (cPanel "Deluxe" plans and up)

1. In cPanel → **"Git Version Control"** → **Create**.
2. **Clone URL:** `https://github.com/trupti2411/eSlate.git`
3. **Repository Path:** `/home/<USER>/repos/eslate`  *(creates a working copy here)*
4. **Repository Name:** `eslate-dev`
5. Click **Create**.
6. After it clones, click **Manage** next to the new repo → **Pull or Deploy** tab → **Update from Remote** → **Deploy HEAD**.
   - cPanel runs `.cpanel.yml` automatically. The first run may fail because `<USER>` is a placeholder — edit `.cpanel.yml` in this repo to replace `<USER>` with your real cPanel username, commit, push.

**Auto-deploy on push?** cPanel doesn't do webhooks. But you can set a cron job to `git pull && /usr/local/cpanel/bin/git-deploy ~/repos/eslate` every 5 minutes — gives you near-CD.

### Option B — SSH (Deluxe plans and up)

```bash
# From your Windows machine, get the SSH info from cPanel → "SSH Access".
ssh <USER>@<SERVER>.secureserver.net

# Inside the server:
cd ~
git clone https://github.com/trupti2411/eSlate.git
mkdir -p api.dev.eslate.com.au
cp -R eslate/api/* api.dev.eslate.com.au/
cd api.dev.eslate.com.au
/opt/cpanel/ea-php83/root/usr/bin/php composer.phar install --no-dev --optimize-autoloader
```

### Option C — FTP (any plan, manual but works)

1. Build Laravel locally:
   ```powershell
   cd C:\NT\eSlate\api
   "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" composer.phar install --no-dev --optimize-autoloader
   ```
2. Connect with FileZilla (FTP credentials in cPanel → "FTP Accounts").
3. Upload the entire `C:\NT\eSlate\api\` folder contents into `/home/<USER>/api.dev.eslate.com.au/`.

---

## Step 4 — Configure `.env` on the server (3 min)

1. cPanel → **File Manager** → navigate to `/home/<USER>/api.dev.eslate.com.au/`.
2. Find `.env.production.template` (we shipped it in step 3). Right-click → **Rename** to `.env`.
3. Right-click `.env` → **Edit** (cPanel may warn about "show hidden files" — enable it).
4. Replace every `<FILL>` value:
   - `APP_KEY` — on your local machine run:
     ```powershell
     cd C:\NT\eSlate\api
     "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan key:generate --show
     ```
     Paste the `base64:...` string into the file.
   - `DB_DATABASE` — full prefixed name from step 2 (e.g. `eslateadm_eslate_dev`).
   - `DB_USERNAME` — same prefix (e.g. `eslateadm_eslate_app`).
   - `DB_PASSWORD` — the password you saved in step 2.
5. **Save**.

---

## Step 5 — Run migrations + seed (2 min)

If you have SSH:
```bash
ssh <USER>@<SERVER>.secureserver.net
cd ~/api.dev.eslate.com.au
/opt/cpanel/ea-php83/root/usr/bin/php artisan migrate --force --seed
/opt/cpanel/ea-php83/root/usr/bin/php artisan storage:link
/opt/cpanel/ea-php83/root/usr/bin/php artisan config:cache
```

If no SSH, you can run artisan via cPanel's **Cron Jobs** as a one-off, or via **Terminal** if your plan includes it. Last resort: I can write a tiny PHP script you upload + visit in a browser that runs `Artisan::call('migrate', ['--force' => true])`.

After this, hit `https://api.dev.eslate.com.au/api/login` from your browser — if you see a Laravel JSON error (not a server error page), the API is live.

Login should work with `admin@eslate.com / password` (seeded by step 5).

---

## Step 6 — Build and upload the React frontend (5 min)

```powershell
cd C:\NT\eSlate
$env:VITE_API_BASE = "https://api.dev.eslate.com.au"
npx vite build
# Output appears in C:\NT\eSlate\dist\public\
```

Upload the contents of `dist\public\` into `/home/<USER>/dev.eslate.com.au/` via FTP or cPanel File Manager.

Also create `/home/<USER>/dev.eslate.com.au/.htaccess` with this content for SPA routing:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

Visit `https://dev.eslate.com.au` — you should see the eSlate login page.

---

## Verify end-to-end

```powershell
curl https://api.dev.eslate.com.au/api/login `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@eslate.com","password":"password"}'
```

Should return `{"token":"...","user":{"email":"admin@eslate.com",...}}`. If yes → you're live.

---

## What "production" plans typically support

| Plan | SSH | Git VC | Node | Cron | PHP 8.3 |
|---|---|---|---|---|---|
| Web Hosting Economy | ✗ | ✗ | ✗ | ✓ | ✓ |
| Web Hosting Deluxe | ✓ | ✓ | ✗ | ✓ | ✓ |
| Web Hosting Ultimate | ✓ | ✓ | ✗ | ✓ | ✓ |
| Business Hosting (any tier) | ✓ | ✓ | ✓ (Node Selector) | ✓ | ✓ |

If you're on **Economy**, you'll do everything via File Manager + FTP (Option C in step 3). If you're on **Deluxe** or above, Option A (Git VC) is fastest.

---

## When to call me back

After each step, ping me and paste any error you see. I'll diagnose and fix.

After step 5 (migrations run) I'll `curl` the API endpoint and confirm.
After step 6 (frontend uploaded) I'll `curl` the frontend and confirm.
