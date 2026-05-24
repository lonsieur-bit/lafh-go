# Supabase setup (vyozqojqivumthiztxkg)

Supabase uses **PostgreSQL** (not MySQL). All schema lives in `supabase/migrations/` as `.sql` files.

## 1. Environment

Copy [.env.example](../.env.example) to `.env` at the **repo root** and set:

| Variable | Used by |
|----------|---------|
| `VITE_SUPABASE_URL` | Web consumer + admin + shared client |
| `VITE_SUPABASE_ANON_KEY` | Web consumer + admin + shared client |
| `EXPO_PUBLIC_SUPABASE_URL` | Mobile (Expo reads these at build time) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile |

Optional (CLI / direct DB apply only — never commit):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_DB_PASSWORD` | Run `npm run db:apply-pending` without `supabase login` |
| `SUPABASE_DB_URL` | Full `postgresql://` URL (overrides password-based URL) |

Never commit the **service_role** key or database password to git.

## 2. Apply database schema

There are **13 migrations** (filename order):

| # | File |
|---|------|
| 1 | `20250515000001_schema.sql` |
| 2 | `20250515000002_rls.sql` |
| 3 | `20250515000003_seed.sql` |
| 4 | `20250516000001_gift_cards_stores.sql` |
| 5 | `20250516000002_gift_cards_rls.sql` |
| 6 | `20250523000001_service_pricing_fields.sql` |
| 7 | `20250523000002_platform_currency.sql` |
| 8 | `20250523000003_referral_program_settings.sql` |
| 9 | `20250523000004_platform_app_enabled.sql` |
| 10 | `20250523000005_production_rider_rpcs.sql` |
| 11 | `20250524000001_captain_dispatch.sql` |
| 12 | `20250525000001_freight_dispatch.sql` |
| 13 | `20250526000001_enable_realtime_orders.sql` |

### Option A — CLI (recommended)

```bash
npx supabase login
cd c:\Users\Sydrr\Desktop\Projects\laffa-go-main
npx supabase link --project-ref vyozqojqivumthiztxkg
npx supabase db push
```

**Partial project already has tables 1–10?** Mark them applied, then push only 11–13:

```powershell
.\scripts\repair-applied-migrations.ps1
```

Or manually:

```bash
npx supabase migration repair --status applied 20250515000001
# … repeat for 20250515000002 through 20250523000005
npx supabase db push
```

### Option B — SQL Editor (no CLI login)

If migrations **1–10** are already on the server, run one file in the dashboard SQL Editor:

[`scripts/apply-pending-captain-freight-realtime.sql`](scripts/apply-pending-captain-freight-realtime.sql)

(combines captain dispatch, freight dispatch, and Realtime on `orders`)

For a **brand-new** empty project, run each file in `supabase/migrations/` in table order above, or use [`scripts/full-schema-upload.sql`](scripts/full-schema-upload.sql) once.

### Option C — Database password (no CLI login)

```powershell
$env:SUPABASE_DB_PASSWORD = "your-db-password"   # Dashboard → Settings → Database
npm run db:apply-pending
```

Applies migrations `20250524000001` and newer, and records them in `supabase_migrations.schema_migrations`.

### Verify schema

```bash
npm run db:verify
```

All checks should pass (RPC errors like `not_authenticated` are OK). Failures like `column orders.pickup_lat does not exist` mean migrations 11–13 are still pending.

### Regenerate TypeScript types

After `db push`:

```bash
npx supabase gen types typescript --project-id vyozqojqivumthiztxkg > packages/shared/src/supabase/database.types.ts
```

(Requires `supabase login`. Types are also maintained manually for captain/freight fields.)

## 3. Dashboard settings

1. **Authentication → Providers → Email:** enabled (mobile uses email/password behind phone UI).
2. **Authentication → Email:** disable “Confirm email” for dev/testing.
3. **Realtime:** migration `20250526000001` adds `orders` to `supabase_realtime`. If needed manually: Database → Replication → enable `orders`.
4. **Settings → API:** confirm URL and anon key match `.env`.

## 4. Create admin user

1. Sign up at http://localhost:8081/login (admin app) or create user in Auth → Users.
2. SQL Editor (edit email in `scripts/promote-admin.sql`):

```sql
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com' LIMIT 1);
```

Generate gift cards from admin → Recharge cards after migrations 4–5.

## 5. Mobile / production smoke test

Restart Metro after `.env` changes: `cd apps/mobile && npx expo start -c`.

Use two test accounts (any 4–6 digit OTP when Supabase is configured):

| Phone | Role |
|-------|------|
| `512345678` | rider |
| `598765432` | captain |

| Step | Rider | Captain | Expected in DB |
|------|-------|---------|----------------|
| 1 | Login | — | `profiles.role = rider` |
| 2 | — | Login | `profiles.role = captain` |
| 3 | Book ride → checkout | — | `orders.status = pending`, coords |
| 4 | Search captain | Online → accept offer | `captain_id` set, `active` |
| 5 | Wallet → gift card | — | `redeem_gift_card`, balance up |
| 6 | Cargo/tow + price | Accept or bid | `captain_quote_sar` |
| 7 | Confirm freight match | — | `rider_confirmed_match`, `active` |

If captain sees no offers: captain role, `captain_set_online(true)`, order `pending`, Realtime on `orders`.

## 6. Restart dev servers

```bash
npm run dev        # http://localhost:8080 — consumer
npm run dev:admin  # http://localhost:8081 — admin
```

## Security

- RLS enforces rider/staff boundaries; wallet changes use `rider_wallet_apply` RPC.
- Platform and referral **writes** require `admin` at the database.
- Rotate keys in Dashboard → Settings → API if the service role was ever exposed.
