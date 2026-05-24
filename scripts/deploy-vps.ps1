# Build admin panel and upload to VPS (lafhride.info)
# Usage:
#   .\scripts\deploy-vps.ps1
#   .\scripts\deploy-vps.ps1 -SkipUpload
#   .\scripts\deploy-vps.ps1 -VpsHost lafhride@72.61.197.153

param(
    [string]$VpsHost = "lafhride@72.61.197.153",
    [string]$RemotePath = "/home/lafhride/htdocs/lafhride.info",
    [switch]$SkipUpload
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path (Join-Path $Root "package.json"))) {
    $Root = Split-Path $PSScriptRoot -Parent
}

Set-Location $Root
Write-Host "Building admin from: $Root" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Warning ".env missing. Copy .env.example and set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY first."
    exit 1
}

$env:VITE_ADMIN_URL = "https://lafhride.info"
npm run build:admin
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$Dist = Join-Path $Root "apps\admin\dist"
if (-not (Test-Path $Dist)) {
    Write-Error "Build output not found: $Dist"
}

if ($SkipUpload) {
    Write-Host "Build OK. Upload manually:" -ForegroundColor Green
    Write-Host "  scp -r `"$Dist\*`" ${VpsHost}:${RemotePath}/"
    exit 0
}

if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "Build OK. Install OpenSSH client, then run:" -ForegroundColor Yellow
    Write-Host "  scp -r `"$Dist\*`" ${VpsHost}:${RemotePath}/"
    exit 0
}

Write-Host "Uploading to $VpsHost:$RemotePath ..." -ForegroundColor Cyan
scp -r "$Dist\*" "${VpsHost}:${RemotePath}/"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Open https://lafhride.info" -ForegroundColor Green
