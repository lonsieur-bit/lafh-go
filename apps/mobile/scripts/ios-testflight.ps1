# Build iOS on EAS cloud and submit to TestFlight (App Store Connect).
#
# Prerequisites:
#   1. npm install (repo root)
#   2. npx eas-cli login
#   3. AuthKey_25Y7P24A3Y.p8 from App Store Connect (download once)
#   4. EAS secrets for Supabase (see TESTFLIGHT.md)
#
# Usage:
#   .\scripts\ios-testflight.ps1
#   .\scripts\ios-testflight.ps1 -BuildOnly
#   .\scripts\ios-testflight.ps1 -KeyPath "C:\keys\AuthKey_25Y7P24A3Y.p8"

param(
  [string]$KeyPath = (Join-Path $PSScriptRoot "AuthKey_25Y7P24A3Y.p8"),
  [switch]$BuildOnly
)

$ErrorActionPreference = "Stop"
$MobileRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RepoRoot = Resolve-Path (Join-Path $MobileRoot "..\..")

if (-not (Test-Path $KeyPath)) {
  Write-Error @"
Apple API key (.p8) not found: $KeyPath

App Store Connect → Users and Access → Integrations → App Store Connect API
  Issuer ID: 2584f3ee-166a-4360-b8f1-a303c84cd238
  Key ID:    25Y7P24A3Y

Download AuthKey_25Y7P24A3Y.p8 once, save next to this script, then re-run.
"@
  exit 1
}

$env:EXPO_APPLE_APP_STORE_CONNECT_ISSUER_ID = "2584f3ee-166a-4360-b8f1-a303c84cd238"
$env:EXPO_APPLE_APP_STORE_CONNECT_KEY_ID = "25Y7P24A3Y"
$env:EXPO_APPLE_APP_STORE_CONNECT_PRIVATE_KEY = Get-Content -Raw -Path $KeyPath

Set-Location $MobileRoot

Write-Host "Checking EAS login..." -ForegroundColor Cyan
npx eas-cli whoami 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: npx eas-cli login" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Starting iOS production build (EAS cloud)..." -ForegroundColor Cyan
Write-Host "Bundle ID: com.luffa.go | Team: Q5N86V5AL6" -ForegroundColor DarkGray

# First build must be interactive so EAS can create iOS certs (uses API key env vars above).
if ($BuildOnly) {
  npx eas-cli build -p ios --profile production
  exit $LASTEXITCODE
}

npx eas-cli build -p ios --profile production --auto-submit
$code = $LASTEXITCODE
if ($code -ne 0) { exit $code }

Write-Host ""
Write-Host "Build submitted. When processing finishes:" -ForegroundColor Green
Write-Host "  App Store Connect → TestFlight → Luffa Go → add testers"
Write-Host "  https://appstoreconnect.apple.com/"
