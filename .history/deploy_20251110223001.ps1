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

# Copy dist to root
$Dist = Join-Path $Project "dist"
$SourceIndex = ".\index.html"
$SourceBackup = Join-Path $env:TEMP "index.html.backup"

if (Test-Path $SourceIndex) {
  Copy-Item $SourceIndex $SourceBackup -Force
}

Remove-Item .\assets -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\index.html -Force -ErrorAction SilentlyContinue
Remove-Item .\404.html -Force -ErrorAction SilentlyContinue

Copy-Item "$Dist\*" . -Recurse -Force

if (Test-Path $SourceBackup) {
  Copy-Item $SourceBackup $SourceIndex -Force
  Remove-Item $SourceBackup -Force
}

Copy-Item .\index.html .\404.html -Force
Write-Host "Files copied to root." -ForegroundColor Green

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
