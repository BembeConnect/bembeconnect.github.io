# Usage: pwsh ./scripts/generate-icons.ps1
# Generates multiple PNG icon sizes from src/assets/bembelogo.png into public/icons.

param(
  [string]$Source = "src/assets/bembelogo.png",
  [string]$OutDir = "public/icons"
)

function Ensure-Dir($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Save-ResizedPng {
  param(
    [System.Drawing.Image]$Image,
    [int]$Size,
    [string]$OutPath
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $bmp.SetResolution($Image.HorizontalResolution, $Image.VerticalResolution)

  $g = [System.Drawing.Graphics]::FromImage($bmp)
  try {
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # letterbox to square while preserving aspect ratio
    $scale = [Math]::Min($Size / $Image.Width, $Size / $Image.Height)
    $newW = [int]([Math]::Round($Image.Width * $scale))
    $newH = [int]([Math]::Round($Image.Height * $scale))
    $x = [int](($Size - $newW) / 2)
    $y = [int](($Size - $newH) / 2)

    $g.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))
    $g.DrawImage($Image, $x, $y, $newW, $newH)
  }
  finally {
    $g.Dispose()
  }

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/png' }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $param  = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 100
  $params.Param[0] = $param

  $bmp.Save($OutPath, $codec, $params)
  $bmp.Dispose()
}

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $Source)) {
  Write-Error "Source image not found: $Source"
  exit 1
}

Ensure-Dir (Split-Path -Parent $OutDir)
Ensure-Dir $OutDir

$sizes = @(16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512)

$img = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
try {
  foreach ($s in $sizes) {
    $out = Join-Path $OutDir ("icon-${s}.png")
    Save-ResizedPng -Image $img -Size $s -OutPath $out
    Write-Host "Generated $out"
  }
}
finally {
  $img.Dispose()
}

Write-Host "Done. Icons written to $OutDir"

