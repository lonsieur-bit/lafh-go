# Deploy admin panel to lafhride.info (VPS)

Your panel is a **static React app** (Vite build). After `npm run build`, upload the `dist/` folder to the web root. You do **not** need the Node.js app on port 3124 unless you prefer serving through Node.

| Setting | Value |
|---------|--------|
| Domain | `lafhride.info` |
| Web root | `/home/lafhride/htdocs/lafhride.info` |
| SSH user | `lafhride` |
| Server IP | `72.61.197.153` |

## 1. Production env (before build)

In the monorepo root (`laffa-go-main/.env`), set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_URL=https://lafhride.info
```

In [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL configuration, add:

- **Site URL:** `https://lafhride.info`
- **Redirect URLs:** `https://lafhride.info/**`

## 2. Build on your PC

From `Desktop\Projects\laffa-go-main`:

```powershell
cd "C:\Users\Sydrr\Desktop\Projects\laffa-go-main"
npm run build:admin
```

Output: `apps\admin\dist\` (`index.html` + `assets/`).

Or use the helper script (build + optional upload):

```powershell
.\scripts\deploy-vps.ps1 -SkipUpload   # build only
.\scripts\deploy-vps.ps1               # build + scp upload
```

## 3. Upload to VPS

### Option A — File Manager (easiest)

1. Open your hosting **File Manager**.
2. Go to `/home/lafhride/htdocs/lafhride.info`.
3. Delete old site files (keep backups if needed).
4. Upload **everything inside** `apps\admin\dist\` (not the `dist` folder itself):
   - `index.html`
   - `assets/` folder

### Option B — SCP (from PowerShell)

```powershell
scp -r "C:\Users\Sydrr\Desktop\Projects\laffa-go-main\apps\admin\dist\*" lafhride@72.61.197.153:/home/lafhride/htdocs/lafhride.info/
```

Use the site user password when prompted.

### Option C — SFTP (WinSCP / FileZilla)

- Host: `72.61.197.153`
- User: `lafhride`
- Remote path: `/home/lafhride/htdocs/lafhride.info`
- Upload contents of `dist/`

## 4. SPA routing (important)

React Router needs every path to serve `index.html`. If `/login` or `/orders` return **404**, add this in your panel’s **Nginx** vhost for `lafhride.info` (or ask support to add it):

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Then reload nginx.

## 5. SSL

In the panel: **SSL/TLS** → enable Let’s Encrypt for `lafhride.info` so the site loads over `https://`.

## 6. Node.js port 3124

You can **ignore** Node.js for this admin app if you deploy static files to `htdocs`. The built app talks to Supabase from the browser only.

If the site was created as a **Node** site, either:

- Switch to a static/PHP site type and use `htdocs` only, **or**
- Stop the Node process and serve files from `htdocs` as above.

## 7. Verify

1. Open `https://lafhride.info`
2. You should see the login page (Arabic RTL).
3. If you see “إعداد Supabase مطلوب”, rebuild with correct `.env` and re-upload.
4. Log in with an admin user (see `supabase/scripts/promote-admin.sql` in the repo).

## Updates

After code changes:

```powershell
npm run build:admin
# upload dist/* again
```

No server restart is required for static deploys.
