# One-time GitHub setup, then push the repo.
# Run in PowerShell from repo root: .\scripts\github-push.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
  [System.Environment]::GetEnvironmentVariable("Path", "User")

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Installing GitHub CLI..." -ForegroundColor Cyan
  winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
    [System.Environment]::GetEnvironmentVariable("Path", "User")
}

Write-Host "Log in to GitHub (browser will open)..." -ForegroundColor Cyan
gh auth login -h github.com -p https -w

$repoName = Read-Host "GitHub repo name (default: lafh-go)"
if ([string]::IsNullOrWhiteSpace($repoName)) { $repoName = "lafh-go" }

$visibility = Read-Host "Private or public? [private/public] (default: private)"
if ($visibility -eq "public") {
  gh repo create $repoName --public --source=. --remote=origin --push `
    --description "Lafh Go — mobile (Expo), admin, web monorepo"
} else {
  gh repo create $repoName --private --source=. --remote=origin --push `
    --description "Lafh Go — mobile (Expo), admin, web monorepo"
}

Write-Host ""
Write-Host "Done. Open your repo:" -ForegroundColor Green
gh repo view --web
