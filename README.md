# Lafh Go (Luffa Go)

Monorepo: **mobile** (Expo / React Native), **admin** dashboard, consumer **web**, and **shared** packages.

## Mobile (TestFlight)

See [apps/mobile/TESTFLIGHT.md](apps/mobile/TESTFLIGHT.md).

- iOS bundle ID: `com.lafh.app`
- EAS project: `luffa-go-mobile`

## Setup

```bash
npm install
cp .env.example .env   # then fill in Supabase keys
```

## Push to GitHub

```powershell
.\scripts\github-push.ps1
```

Or: create an empty repo on GitHub, then:

```powershell
git remote add origin https://github.com/YOUR_USER/lafh-go.git
git push -u origin master
```

**Never commit:** `.env`, `*.p8`, `*.p12` (already in `.gitignore`).
