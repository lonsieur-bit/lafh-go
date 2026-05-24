# One-time: download AuthKey_25Y7P24A3Y.p8 from App Store Connect (Keys → production → Download).
# Place it next to this script or pass -KeyPath "C:\path\to\AuthKey_25Y7P24A3Y.p8"

param(
  [string]$KeyPath = (Join-Path $PSScriptRoot "AuthKey_25Y7P24A3Y.p8"),
  [ValidateSet("preview", "preview-simulator", "production")]
  [string]$Profile = "preview"
)

if (-not (Test-Path $KeyPath)) {
  Write-Error @"
Apple API key file not found: $KeyPath

In App Store Connect → Users and Access → Integrations → App Store Connect API:
  Issuer ID: 2584f3ee-166a-4360-b8f1-a303c84cd238
  Key ID:    25Y7P24A3Y
Download the .p8 once, save as AuthKey_25Y7P24A3Y.p8, then re-run this script.
"@
  exit 1
}

$env:EXPO_APPLE_APP_STORE_CONNECT_ISSUER_ID = "2584f3ee-166a-4360-b8f1-a303c84cd238"
$env:EXPO_APPLE_APP_STORE_CONNECT_KEY_ID = "25Y7P24A3Y"
$env:EXPO_APPLE_APP_STORE_CONNECT_PRIVATE_KEY = Get-Content -Raw -Path $KeyPath

Set-Location (Join-Path $PSScriptRoot "..")
npx eas-cli build -p ios --profile $Profile --non-interactive
