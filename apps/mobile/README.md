# Luffa Go — Mobile (Expo)

Expo app for **Luffa Go**. UI parity targets the **web consumer** screens inside the 375×812 phone frame (`src/components/luffa/PhoneFrame.tsx`), not ad‑hoc mobile-only layouts.

## Run locally

From the repo root:

```powershell
npm install
npm install @babel/runtime@7.26.10 invariant@2.2.4 -w mobile --install-strategy=nested
cd apps/mobile
npx expo start --port 8083 -c
```

Scan the QR code with Expo Go on the same Wi‑Fi network.

## UI source of truth (web → mobile)

| Mobile screen | Web reference |
|---------------|---------------|
| `src/screens/luffa/CustomerHomeScreen.tsx` | `src/components/luffa/CustomerHomeScreen.tsx` |
| `src/screens/luffa/CaptainHomeScreen.tsx` | `src/pages/app/CaptainHomePage.tsx` |
| `src/screens/BookingScreen.tsx` | `src/pages/app/BookingPage.tsx` |
| `src/screens/CheckoutScreen.tsx` | `src/pages/app/CheckoutPage.tsx` |
| `src/screens/SearchCaptainScreen.tsx` | `src/pages/app/SearchCaptainPage.tsx` |
| `src/screens/AuthScreen.tsx` | `src/components/luffa/AuthScreen.tsx` |
| `src/screens/OrdersScreen.tsx` | `src/pages/app/OrdersPage.tsx` |
| `src/screens/OrderDetailsScreen.tsx` | `src/pages/app/OrderDetailsPage.tsx` |
| `src/screens/WalletScreen.tsx` | `src/pages/app/WalletPage.tsx` |
| `src/screens/WalletTopUpScreen.tsx` | `src/pages/app/WalletTopUpPage.tsx` |
| `src/screens/ProfileScreen.tsx` | `src/pages/app/ProfilePage.tsx` |
| `src/screens/SettingsScreen.tsx` | `src/components/luffa/SettingsScreen.tsx` |
| `src/screens/NotificationsScreen.tsx` | `src/pages/app/NotificationsPage.tsx` |
| `src/screens/ChatScreen.tsx` | `src/components/luffa/ChatScreen.tsx` |
| `src/screens/ReferralScreen.tsx` | `src/pages/app/ReferralPage.tsx` |
| `src/screens/AddressesScreen.tsx` | `src/pages/app/AddressesPage.tsx` |
| `src/screens/CargoRequestScreen.tsx` | `src/pages/app/CargoRequestPage.tsx` |
| `src/screens/PublicLandingScreen.tsx` | Role picker (web uses `AppShell` toggle + landing) |

## Shared mobile primitives

- **Tokens:** `src/theme/tokens.ts` (hex colors, gradients)
- **Typography:** `src/theme/textStyles.ts` — **Tajawal** (Arabic) + Inter (mono/numbers), RTL presets
- **Layout:** `src/components/layout/` — `Screen`, `AppHeader`, `BottomSheet`, `PrimaryButton`, **`StackScreenLayout`**
- **Home menu:** `src/components/HomeNavMenu.tsx` — compact dropdown under the hamburger (anchored, web-style rows)
- **Role switch:** `src/components/RoleToggle.tsx` (Profile; web toggle is outside the frame)

### Home hamburger menu

Opens a **compact card** below the menu button (`measureInWindow` with `right: screenWidth - x - width`). Simple text rows like web — not a full-screen modal. Routes: home, orders, chat, profile, notifications, wallet, referral, settings.

### Checkout → captain search

Matches web: checkout navigates to `SearchCaptain` with payment method only; order is created after ~9s on the search screen, then `OrderDetails`.

### Stack screens (Booking, Profile, Wallet, …)

Use **`StackScreenLayout`** with explicit `flex: 1`. Home stays full-bleed map + `BottomSheet` (no bottom tab bar).

## RTL policy

`index.ts` enables `I18nManager.forceRTL(true)`. Use **`flexDirection: 'row'`** in components (not `flex-row-reverse`). After font or RTL changes, **fully quit Expo Go and reopen**.

## Arabic map labels (iOS)

Map street names follow the **app language**, not only RTL layout. The project declares Arabic via `expo-localization`, `locales/ar.json`, and `CFBundleDevelopmentRegion: ar`.

- **Development / production build:** iPhone → **Settings → Luffa Go → Language → العربية**, then restart the app. Labels should appear in Arabic on Apple Maps.
- **Expo Go:** Apple Maps may stay English until you set **Expo Go’s** language to Arabic, or use a dev build of this app with the steps above. A native rebuild (`npx expo prebuild` + run) applies the `withArabicAppLocale` plugin for stronger Arabic preference.

## Visual QA checklist

- [ ] **Tajawal** loaded for Arabic text
- [ ] Home menu dropdown under hamburger; all items navigate
- [ ] No bottom tab bar on home
- [ ] Checkout → search captain ~9s → order details
- [ ] Referral: program description, stats, no crash
- [ ] RTL on home header, menu, checkout summary

## Troubleshooting

```powershell
cd c:\path\to\laffa-go-main
npm install
node apps/mobile/scripts/prune-nativewind-rn.mjs
cd apps/mobile
npx expo start --port 8083 -c
```

Ensure `npm ls react-native -w mobile` shows only **0.81.5**.
