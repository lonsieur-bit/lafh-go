# One-time iOS credential setup for EAS (required before GitHub / CI builds).
#
# GitHub builds run non-interactively. Apple distribution certs must exist on
# Expo servers first — run this script once in an interactive terminal.
#
# Usage:
#   cd apps\mobile
#   .\scripts\setup-ios-credentials.ps1

param(
  [string]$KeyPath = (Join-Path $PSScriptRoot "AuthKey_25Y7P24A3Y.p8")
)

$ErrorActionPreference = "Stop"
$MobileRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $MobileRoot

if (-not (Test-Path $KeyPath)) {
  Write-Error @"
Apple API key (.p8) not found: $KeyPath

Download AuthKey_25Y7P24A3Y.p8 from App Store Connect and save it here, then re-run.
"@
  exit 1
}

$env:EXPO_APPLE_APP_STORE_CONNECT_ISSUER_ID = "2584f3ee-166a-4360-b8f1-a303c84cd238"
$env:EXPO_APPLE_APP_STORE_CONNECT_KEY_ID = "25Y7P24A3Y"
$env:EXPO_APPLE_APP_STORE_CONNECT_PRIVATE_KEY = Get-Content -Raw -Path $KeyPath
$env:EXPO_ASC_API_KEY_PATH = (Resolve-Path $KeyPath).Path
$env:EXPO_ASC_KEY_ID = "25Y7P24A3Y"
$env:EXPO_ASC_ISSUER_ID = "2584f3ee-166a-4360-b8f1-a303c84cd238"
$env:EXPO_APPLE_TEAM_ID = "Q5N86V5AL6"
$env:EXPO_APPLE_TEAM_TYPE = "COMPANY_OR_ORGANIZATION"

Write-Host ""
Write-Host "=== EAS iOS credential setup (one time) ===" -ForegroundColor Cyan
Write-Host "Bundle ID: com.lafh.app | Team: Q5N86V5AL6"
Write-Host ""
Write-Host "When prompted:" -ForegroundColor Yellow
Write-Host "  - Log in to your Apple Developer account (recommended), OR"
Write-Host "  - Choose to use the App Store Connect API key already configured"
Write-Host "  - Allow EAS to generate distribution certificate + provisioning profile"
Write-Host ""

npx eas-cli whoami 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: npx eas-cli login" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Step 1: Configure build credentials..." -ForegroundColor Cyan
npx eas-cli credentials:configure-build -p ios -e production
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Step 2: Connect App Store Connect app (optional, enables ASC integration)..." -ForegroundColor Cyan
npx eas-cli integrations:asc:connect
if ($LASTEXITCODE -ne 0) {
  Write-Host "ASC connect skipped or failed — build may still work." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Step 3: Verify with a production build..." -ForegroundColor Cyan
npx eas-cli build -p ios --profile production
$code = $LASTEXITCODE

Write-Host ""
if ($code -eq 0) {
  Write-Host "Credentials are set up. GitHub builds (Build from GitHub) should work now." -ForegroundColor Green
} else {
  Write-Host "Build did not finish. Check output above or Expo dashboard → Credentials." -ForegroundColor Yellow
  Write-Host "https://expo.dev/accounts/feakra/projects/luffa-go-mobile/credentials"
}

exit $code
