# Go-live quickstart (SQL Editor only)

You **do not** need `supabase login` or `db push` if your project already has tables like `profiles`, `orders`, and `wallets`.

## What you already have

Your project (`vyozqojqivumthiztxkg`) was set up earlier with migrations **1–10** (schema, RLS, gift cards, wallet RPCs, platform settings). That is why the mobile app could already sign in and use wallet/gift cards.

You only needed **migrations 11–13** (captain dispatch, freight, Realtime):

| # | What it adds |
|---|----------------|
| 11 | Captain offers, `pickup_lat`, `captain_accept_order`, etc. |
| 12 | Freight bid/confirm (`captain_freight_respond`, `rider_freight_confirm`) |
| 13 | Realtime on `orders` |

**One file covers all three:** [`scripts/apply-pending-captain-freight-realtime.sql`](scripts/apply-pending-captain-freight-realtime.sql)

Paste it in [SQL Editor](https://supabase.com/dashboard/project/vyozqojqivumthiztxkg/sql/new) → **Run**.

## Check it worked

From repo root:

```powershell
npm run db:verify
```

You want **all checks ✓**. If you see `not_authenticated` or Arabic login messages on RPC tests, that still counts as success (the function exists).

## You do NOT need to run migrations 1–10 again

| Situation | What to do |
|-----------|------------|
| Tables `profiles`, `orders`, `wallets` exist | Only run `apply-pending-captain-freight-realtime.sql` (done) |
| Brand-new empty Supabase project | Run every file in `supabase/migrations/` in order, **or** once: `scripts/full-schema-upload.sql` |
| CLI preferred later | `npx supabase login` → `.\scripts\repair-applied-migrations.ps1` (marks 1–10 applied, pushes 11–13) |

## App next steps

1. `.env` at repo root already has URL + anon key.
2. **Restart Expo with cache clear** (required after env / `app.config.js` changes):
   `cd apps/mobile` → `npx expo start -c`
3. You should **not** see “وضع تجريبي بدون Supabase” on login — that means keys loaded.
4. Booking and captain mode **require login** when Supabase is connected.
3. Test with two phones:
   - Rider: `512345678`, OTP `1234`
   - Captain: `598765432`, OTP `1234`

Auth uses email behind the scenes (`rider.512345678@luffa.go`); any 4–6 digit OTP works until real SMS is configured.

## “تعذر إنشاء الحساب” / rate limit

If many test sign-ups were tried, Supabase returns **email rate limit exceeded**. The app cannot create new accounts until the limit resets (often ~1 hour).

**Workarounds:**

1. Use **تسجيل الدخول** (Login) if the account was created on an earlier attempt.
2. Supabase Dashboard → **Authentication** → **Rate Limits** → raise or disable email sign-up limits for development.
3. Dashboard → **Authentication** → **Users** → **Add user**:
   - Email: `rider.546292416@luffa.go` (for phone `546292416` as rider)
   - Password: `luffa-demo-546292416` (same formula the app uses)
   - Then use **Login** in the app with that number.

## Dashboard (one-time)

- **Authentication → Email:** enabled; turn off “Confirm email” for testing.
- **Replication:** migration 13 enables `orders`; if live updates fail, check Database → Replication → `orders` is on.
