# Build admin and pack for cloud.lafhride.info (Node.js site, port 3094)
# Usage:
#   .\scripts\deploy-cloud.ps1
#   .\scripts\deploy-cloud.ps1 -SkipUpload
#   .\scripts\deploy-cloud.ps1 -VpsHost lafhride-cloud@72.61.197.153

param(
    [string]$VpsHost = "lafhride-cloud@72.61.197.153",
    [string]$RemotePath = "/home/lafhride-cloud/htdocs/cloud.lafhride.info",
    [switch]$SkipUpload
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Admin = Join-Path $Root "apps\admin"
$Bundle = Join-Path $Admin "deploy-bundle"

Set-Location $Root
Write-Host "Building admin for https://cloud.lafhride.info" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Warning ".env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in laffa-go-main\.env"
    exit 1
}

$env:VITE_ADMIN_URL = "https://cloud.lafhride.info"
npm run build:admin
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$Dist = Join-Path $Admin "dist"
if (-not (Test-Path $Dist)) { throw "Build output not found: $Dist" }

if (Test-Path $Bundle) { Remove-Item $Bundle -Recurse -Force }
New-Item -ItemType Directory -Path $Bundle | Out-Null
Copy-Item -Recurse $Dist (Join-Path $Bundle "dist")
Copy-Item (Join-Path $Admin "server.mjs") $Bundle
Copy-Item (Join-Path $Admin "package.deploy.json") (Join-Path $Bundle "package.json")
Copy-Item (Join-Path $Admin "ecosystem.config.cjs") $Bundle -ErrorAction SilentlyContinue

Write-Host "Bundle ready: $Bundle" -ForegroundColor Green
Get-ChildItem $Bundle -Recurse | Select-Object FullName

if ($SkipUpload) {
    Write-Host ""
    Write-Host "Upload (enter password when prompted):" -ForegroundColor Yellow
    Write-Host "  scp -r `"$Bundle\*`" ${VpsHost}:${RemotePath}/"
    Write-Host "Then in the panel: restart the Node.js app for cloud.lafhride.info"
    exit 0
}

if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "Install OpenSSH client, then run the scp command above." -ForegroundColor Yellow
    exit 0
}

Write-Host "Uploading to ${VpsHost}:${RemotePath} ..." -ForegroundColor Cyan
scp -r "$Bundle\*" "${VpsHost}:${RemotePath}/"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Restart Node.js in the panel, then open https://cloud.lafhride.info" -ForegroundColor Green
