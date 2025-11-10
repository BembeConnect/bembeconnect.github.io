# ============================================
# Build & Publish → USER SITE (dist → Root)
# Projekt: bembeconnect.github.io (User/Org Pages)
# Repo:    https://github.com/BembeConnect/bembeconnect.github.io
# Pages:   Branch=main, Folder=/ (root)
# ============================================

$Project = "D:\Bembe\bembeconnect.github.io"
$Backup  = "D:\Bembe\_backups_bembe"
$Remote  = "origin"
$Branch  = "main"

function Fail($m){ throw $m }
function EnsureDir($p){ if(-not(Test-Path $p)){ New-Item -Type Directory -Path $p -Force | Out-Null } }

# SSH-Key for this repo
$env:GIT_SSH_COMMAND = "ssh -i .ssh/id_ed25519_bembe"

# 0) Checks and Backup (nur src, dist, public - schneller!)
if (-not (Test-Path $Project)) { Fail "Project folder not found: $Project" }
Set-Location $Project
EnsureDir $Backup
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zip   = Join-Path $Backup ("bembe-user_$stamp.zip")
if (Test-Path $zip) { Remove-Item $zip -Force }

# Backup nur wichtige Ordner (nicht node_modules!)
$ItemsToBackup = @(
  (Join-Path $Project "src"),
  (Join-Path $Project "public"),
  (Join-Path $Project "dist"),
  (Join-Path $Project "node_modules"),
  (Join-Path $Project "*.html"),
  (Join-Path $Project "*.json"),
  (Join-Path $Project "*.ts"),
  (Join-Path $Project "*.js")
)
Compress-Archive -Path $ItemsToBackup -DestinationPath $zip -Force
Write-Host "Quick backup created: $zip" -ForegroundColor Green

# 1) Dependencies (idempotent)
if (-not (Test-Path (Join-Path $Project "node_modules"))) {
  if (Test-Path "package-lock.json") { npm ci } else { npm install }
}

# 2) Build
Write-Host "Baue Vite..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Fail "Build fehlgeschlagen." }

# 3) Copy dist to root (keep source index.html, use built version for deployment)
$Dist = Join-Path $Project "dist"

# Save source index.html temporarily
$SourceIndex = ".\index.html"
$SourceBackup = Join-Path $env:TEMP "index.html.backup"
if (Test-Path $SourceIndex) {
  Copy-Item $SourceIndex $SourceBackup -Force
}

# Clean old artifacts (will copy fresh dist files)
Remove-Item .\assets -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\*.js -Filter "*.js" -Force -ErrorAction SilentlyContinue -Exclude registerSW.js,sw.js,workbox-*.js
Remove-Item .\*.css -Force -ErrorAction SilentlyContinue
Remove-Item .\index.html -Force -ErrorAction SilentlyContinue
Remove-Item .\404.html   -Force -ErrorAction SilentlyContinue

# Copy new build
Copy-Item "$Dist\*" . -Recurse -Force

# Restore source index.html for next build
if (Test-Path $SourceBackup) {
  Copy-Item $SourceBackup $SourceIndex -Force
  Remove-Item $SourceBackup -Force
}

# SPA fallback for deployment
Copy-Item .\index.html .\404.html -Force
Write-Host "dist copied to root, 404.html created." -ForegroundColor Cyan

# 4) Commit and Push
if (-not (Test-Path ".git")) { Fail "No Git repo found." }
git checkout -B $Branch | Out-Null

git add -A
$diff = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($diff)) {
  Write-Host "No changes to commit." -ForegroundColor Yellow
} else {
  git commit -m "publish(user-site): dist to root ($stamp)" | Out-Null
  Write-Host "Changes committed." -ForegroundColor Green
}

git push -u $Remote $Branch
if ($LASTEXITCODE -ne 0) { Fail "Push failed." }

Write-Host "Deploy complete!" -ForegroundColor Green
