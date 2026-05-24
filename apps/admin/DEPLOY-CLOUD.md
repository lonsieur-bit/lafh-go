# Deploy to cloud.lafhride.info (Node.js)

| Setting | Value |
|---------|--------|
| URL | `https://cloud.lafhride.info` |
| SSH user | `lafhride-cloud` |
| Web root | `/home/lafhride-cloud/htdocs/cloud.lafhride.info` |
| Node | 22 LTS |
| App port | `3094` (set by panel via `PORT`) |

## 1. Supabase

In `laffa-go-main/.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_URL=https://cloud.lafhride.info
```

Supabase → **Authentication** → URL configuration:

- Site URL: `https://cloud.lafhride.info`
- Redirect URLs: `https://cloud.lafhride.info/**`

## 2. Build + bundle (Windows)

```powershell
cd "C:\Users\Sydrr\Desktop\Projects\laffa-go-main"
.\scripts\deploy-cloud.ps1 -SkipUpload
```

Creates `apps\admin\deploy-bundle\`:

- `dist/` — built React app
- `server.mjs` — serves SPA on `PORT`
- `package.json` — `"start": "node server.mjs"`

## 3. Upload

### File Manager

Upload **contents** of `deploy-bundle` into  
`/home/lafhride-cloud/htdocs/cloud.lafhride.info/`:

```
cloud.lafhride.info/
  package.json
  server.mjs
  dist/
    index.html
    assets/
```

### SCP

```powershell
scp -r "C:\Users\Sydrr\Desktop\Projects\laffa-go-main\apps\admin\deploy-bundle\*" lafhride-cloud@72.61.197.153:/home/lafhride-cloud/htdocs/cloud.lafhride.info/
```

## 4. CloudPanel Node.js settings

1. **Node.js** → App port: `3094` (already set).
2. **Start command:** `node server.mjs` or `npm start`
3. **Application root** = `/home/lafhride-cloud/htdocs/cloud.lafhride.info` (same folder as `package.json`)
4. Click **Restart** after each upload.

### Fix 502 Bad Gateway

502 means nginx cannot reach Node. Check in order:

1. **File layout** — at site root (not inside a subfolder):
   ```
   package.json
   server.mjs
   dist/index.html
   dist/assets/
   ```
2. **Logs** — panel → **Logs** for `cloud.lafhride.info` (Node crash often says "Missing dist folder").
3. **Restart Node** — Node.js → Restart.
4. **Port** — must be `3094` in panel and match nginx upstream.
5. **Test health** (SSH): `curl http://127.0.0.1:3094/health` → should print `ok`.

The panel sets `PORT=3094`; `server.mjs` binds to that port on `127.0.0.1`; Nginx proxies HTTPS to it.

## 5. SSL

Enable Let's Encrypt for `cloud.lafhride.info` in **SSL/TLS**.

## 6. Verify

Open `https://cloud.lafhride.info` → login page.

If blank or 502: check **Logs**, confirm `dist/index.html` exists, restart Node.

## Updates

```powershell
.\scripts\deploy-cloud.ps1
# restart Node in panel
```

**Security:** Never commit SSH passwords. Rotate the site password if it was shared in chat.
