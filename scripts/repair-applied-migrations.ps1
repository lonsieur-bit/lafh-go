# Mark migrations 1–10 as applied on a partial Supabase project, then push 11–13.
# Requires: npx supabase login (once)
# Run from repo root: .\scripts\repair-applied-migrations.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$versions = @(
  "20250515000001",
  "20250515000002",
  "20250515000003",
  "20250516000001",
  "20250516000002",
  "20250523000001",
  "20250523000002",
  "20250523000003",
  "20250523000004",
  "20250523000005"
)

Write-Host "Linking project vyozqojqivumthiztxkg..."
npx supabase link --project-ref vyozqojqivumthiztxkg

foreach ($v in $versions) {
  Write-Host "Repair applied: $v"
  npx supabase migration repair --status applied $v
}

Write-Host "Pushing pending migrations (captain, freight, realtime)..."
npx supabase db push

Write-Host "Verifying schema..."
node scripts/verify-supabase-schema.mjs
