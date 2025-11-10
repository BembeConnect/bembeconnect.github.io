# Quick Deploy Script (no backup)
$Project = "D:\Bembe\bembeconnect.github.io"
$Remote  = "origin"
$Branch  = "main"

# SSH-Key
$env:GIT_SSH_COMMAND = "ssh -i .ssh/id_ed25519_bembe"

Set-Location $Project

# Build
Write-Host "Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

# IMPORTANT: Delete old artifacts FIRST, then copy new ones
$Dist = Join-Path $Project "dist"

Remove-Item .\assets -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\index.html -Force -ErrorAction SilentlyContinue
Remove-Item .\404.html -Force -ErrorAction SilentlyContinue

# Copy fresh build
Copy-Item "$Dist\*" . -Recurse -Force

# SPA fallback
Copy-Item .\index.html .\404.html -Force
Write-Host "Old artifacts removed, fresh build deployed." -ForegroundColor Green

# Commit and Push
git add -A
$diff = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($diff)) {
  Write-Host "No changes." -ForegroundColor Yellow
} else {
  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  git commit -m "publish: $stamp" | Out-Null
  Write-Host "Committed." -ForegroundColor Green
}

git push -u $Remote $Branch
if ($LASTEXITCODE -ne 0) { throw "Push failed" }

Write-Host "Deploy complete!" -ForegroundColor Green
