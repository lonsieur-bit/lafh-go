# iOS TestFlight — Luffa Go

Builds run on **Expo EAS** (cloud). You do **not** need a Mac on Windows.

| Item | Value |
|------|--------|
| App name | Luffa Go |
| Bundle ID | `com.lafh.app` |
| App Store Connect Apple ID | `6755081492` |
| Apple Team | `Q5N86V5AL6` |
| EAS project | `8fcb8f31-0eba-4642-bedb-802b5e283674` |

---

## One-time setup

### 1. Install dependencies

```powershell
cd "C:\Users\Sydrr\Desktop\Projects\laffa-go-main"
npm install
```

### 2. Log in to Expo / EAS

```powershell
npx eas-cli login
```

Use the Expo account that owns the EAS project.

### 3. Apple API key (.p8)

1. [App Store Connect](https://appstoreconnect.apple.com/) → **Users and Access** → **Integrations** → **App Store Connect API**
2. Create or use key **25Y7P24A3Y** (Issuer: `2584f3ee-166a-4360-b8f1-a303c84cd238`)
3. Download **`AuthKey_25Y7P24A3Y.p8`** (only once)
4. Save to:

   `apps\mobile\scripts\AuthKey_25Y7P24A3Y.p8`

   (Never commit `.p8` files — already in `.gitignore`.)

### 4. App in App Store Connect

App **Luffa Go** with bundle ID **`com.lafh.app`** (Apple ID `6755081492`) should already exist in App Store Connect.

### 5. EAS secrets (Supabase)

`.env` is **not** uploaded to EAS. Set secrets once:

```powershell
cd apps\mobile
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co" --type string
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key" --type string
```

List secrets: `npx eas-cli secret:list`

### 6. Apple credentials on EAS (required before GitHub builds)

GitHub / CI builds are **non-interactive**. EAS must already have a validated iOS **distribution certificate** and **provisioning profile** on Expo servers.

**Run once** in PowerShell (interactive terminal — not CI):

```powershell
cd apps\mobile
.\scripts\setup-ios-credentials.ps1
```

When prompted, sign in with your **Apple Developer** account and allow EAS to create certificates.

Alternatively: [expo.dev → luffa-go-mobile → Credentials → iOS](https://expo.dev/accounts/feakra/projects/luffa-go-mobile/credentials)

Apple ASC API key env vars are already on the EAS **production** environment (for cert refresh on cloud builds).

After a successful interactive build, **Build from GitHub** works without prompts.

---

## Expo + GitHub (Build from GitHub)

In [expo.dev](https://expo.dev) → **luffa-go-mobile** → **Project settings** → **GitHub**:

- **Base directory:** `apps/mobile` (required)  
  Direct link: https://expo.dev/accounts/feakra/projects/luffa-go-mobile/github

**Important:**

- **Recommended:** `apps/mobile` in GitHub settings and in the build dialog.
- If base is `/` (repo root), the repo includes `app.config.cjs` + `prebuildCommand` so builds can still work — but prefer `apps/mobile`.

When starting a build, you can also set **Base directory** to `apps/mobile` in the build modal for that single build.

Then **Builds** → **Build from GitHub**: branch `main`, profile `production`, environment **Production**.

---

## Build and upload to TestFlight

```powershell
cd "C:\Users\Sydrr\Desktop\Projects\laffa-go-main\apps\mobile"
.\scripts\ios-testflight.ps1
```

This will:

1. Build iOS **production** on EAS (`distribution: store`)
2. Auto-increment build number
3. **Submit** to App Store Connect → TestFlight

### Build only (no upload)

```powershell
.\scripts\ios-testflight.ps1 -BuildOnly
```

Then submit the latest build manually:

```powershell
npx eas-cli submit -p ios --latest --profile production
```

### NPM shortcut

```powershell
cd apps\mobile
npm run testflight
```

---

## After upload

1. Open [App Store Connect](https://appstoreconnect.apple.com/) → **TestFlight**
2. Wait for **Processing** (often 10–30 minutes)
3. Answer **Export Compliance** if asked (app sets `ITSAppUsesNonExemptEncryption: false`)
4. Add **Internal** or **External** testers
5. Testers install via **TestFlight** app on iPhone

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `eas: command not found` | Use `npx eas-cli` |
| Missing `.p8` | Download key, place in `apps\mobile\scripts\` |
| Supabase empty in build | Run `eas secret:create` for both `EXPO_PUBLIC_*` vars |
| No Apple app | Use bundle `com.lafh.app` in App Store Connect |
| Build fails on credentials / `Distribution Certificate is not validated` | Run `.\scripts\setup-ios-credentials.ps1` once interactively, then retry GitHub build |
| GitHub build fails before Xcode | Ensure **Base directory** = `apps/mobile` in Expo GitHub settings |

---

## Version bumps

Edit `apps/mobile/app.json` → `expo.version` (e.g. `1.0.1`) for user-visible version.  
Build number is auto-incremented by EAS (`autoIncrement: true` in `eas.json`).
