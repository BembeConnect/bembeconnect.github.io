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

# SSH-Key für dieses Repo
$env:GIT_SSH_COMMAND = "ssh -i .ssh/id_ed25519_bembe"

# 0) Checks & Backup
if (-not (Test-Path $Project)) { Fail "Projektordner nicht gefunden: $Project" }
Set-Location $Project
EnsureDir $Backup
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zip   = Join-Path $Backup ("bembe-user_$stamp.zip")
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $Project "*") -DestinationPath $zip -Force
Write-Host "Backup erstellt: $zip" -ForegroundColor Green

# 1) Dependencies (idempotent)
if (-not (Test-Path (Join-Path $Project "node_modules"))) {
  if (Test-Path "package-lock.json") { npm ci } else { npm install }
}

# 2) Build
Write-Host "Baue Vite..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Fail "Build fehlgeschlagen." }

# 3) Copy dist to root
$Dist = Join-Path $Project "dist"

# Clean old artifacts
Remove-Item .\assets -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\index.html -Force -ErrorAction SilentlyContinue
Remove-Item .\404.html   -Force -ErrorAction SilentlyContinue

# Copy new build
Copy-Item "$Dist\*" . -Recurse -Force

# SPA fallback
if (Test-Path ".\index.html") {
  Copy-Item ".\index.html" ".\404.html" -Force
}
Write-Host "dist copied to root, 404.html created." -ForegroundColor Cyan

# 4) Commit & Push
if (-not (Test-Path ".git")) { Fail "Kein Git-Repo gefunden." }
git checkout -B $Branch | Out-Null

git add -A
$diff = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($diff)) {
  Write-Host "Keine Änderungen – nichts zu committen." -ForegroundColor Yellow
} else {
  git commit -m "publish(user-site): dist → root ($stamp)" | Out-Null
  Write-Host "Änderungen commitet." -ForegroundColor Green
}

git push -u $Remote $Branch
if ($LASTEXITCODE -ne 0) { Fail "Push fehlgeschlagen - bitte Ausgabe pruefen." }

Write-Host "Deploy fertig. Pages: Settings → Pages → Branch=main, Folder=/ (root)." -ForegroundColor Green
