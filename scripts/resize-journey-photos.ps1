# Downscales the full-resolution "My Journey" photos from <root>\Photos\<Section>\
# into web/print-sized JPEGs at <root>\public\journey\<id>\, applying EXIF rotation
# and stripping metadata. Originals in \Photos are the untouched source of truth.
#
# Each section may also have a "Circles" (or "Circle") subfolder — those images are the
# BUBBLE overlays (logos / speaker close-ups) shown as small circles on top of the wave
# mosaic. They are resized into <root>\public\journey\<id>\circles\.
#
# Rerun after adding photos, then run: node scripts/gen-journey-photos.mjs
#   pwsh -File scripts/resize-journey-photos.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root 'Photos'
$dst  = Join-Path $root 'public\journey'
$MAXEDGE = 1600
$QUALITY = 85

# Sections to PRESERVE (never re-resize): their source is WhatsApp-named, so re-running
# would renumber the outputs and break the URL-keyed per-photo tuning (FOCUS/ZOOM/
# FOCUS_X/SPLIT_RATIOS in CurvedCollage.tsx). Leave public/journey/rotary as-is.
$SKIP = @('rotary')

# Folder name (== section title) -> section id in src/data/dgJourney.ts
$map = @{
  "DG's Family"          = 'family'
  'Family'               = 'family'
  'Professional Journey' = 'professional'
  'Rotary Journey'       = 'rotary'
  'Navyug - Sept. 2025'  = 'navyug'
  'Natrutva - May 2026'  = 'natrutva'
  'Navoday - June 2026'  = 'navoday'
  'Navodipt - July 2026' = 'navodipt'
}

$jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encQ = [System.Drawing.Imaging.Encoder]::Quality

if (-not (Test-Path $src)) { Write-Error "No Photos folder at $src"; exit 1 }

# Resize every image in $srcDir (top level only, non-recursive) into $outDir, renumbered
# 1..N in a stable order. Returns the count written.
function Resize-Folder([string]$srcDir, [string]$outDir) {
  New-Item -ItemType Directory -Force $outDir | Out-Null
  Get-ChildItem $outDir -File -ErrorAction SilentlyContinue | Remove-Item -Force

  $files = Get-ChildItem $srcDir -File | Where-Object { $_.Extension -match '(?i)\.(jpe?g|png|jfif|heic)$' }
  if (-not $files) { return 0 }
  # Numeric order when every name is a number, else by name (WhatsApp timestamps sort
  # chronologically). Output renumbered 1..N so downstream order is stable.
  if (($files | Where-Object { $_.BaseName -notmatch '^\d+$' }).Count -eq 0) {
    $files = $files | Sort-Object { [int]$_.BaseName }
  } else {
    $files = $files | Sort-Object Name
  }
  # Drop duplicates saved under the same base name (e.g. "photo.jpeg" + "photo.jpg").
  $seen = @{}
  $files = $files | Where-Object { $k = $_.BaseName.ToLower(); if ($seen[$k]) { $false } else { $seen[$k] = $true; $true } }

  $n = 0
  foreach ($f in $files) {
    try { $img = [System.Drawing.Image]::FromFile($f.FullName) }
    catch { Write-Warning "Cannot read $($f.Name) (unsupported format?)"; continue }

    # Apply EXIF orientation (System.Drawing does not do it automatically).
    try {
      $p = $img.GetPropertyItem(274)
      switch ([int]$p.Value[0]) {
        2 { $img.RotateFlip('RotateNoneFlipX') }
        3 { $img.RotateFlip('Rotate180FlipNone') }
        4 { $img.RotateFlip('RotateNoneFlipY') }
        5 { $img.RotateFlip('Rotate90FlipX') }
        6 { $img.RotateFlip('Rotate90FlipNone') }
        7 { $img.RotateFlip('Rotate270FlipX') }
        8 { $img.RotateFlip('Rotate270FlipNone') }
      }
    } catch { }

    $w = $img.Width; $h = $img.Height
    $scale = [Math]::Min(1.0, $MAXEDGE / [Math]::Max($w, $h))
    $nw = [int][Math]::Round($w * $scale)
    $nh = [int][Math]::Round($h * $scale)

    $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $nw, $nh)
    $g.Dispose()

    $ps = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encQ, [long]$QUALITY)

    $n++
    $bmp.Save((Join-Path $outDir "$n.jpg"), $jpgCodec, $ps)
    $bmp.Dispose(); $img.Dispose()
  }
  return (Get-ChildItem $outDir -File).Count
}

foreach ($folder in Get-ChildItem -Directory $src) {
  $id = $map[$folder.Name]
  if (-not $id) { Write-Warning "Skipping unmapped folder '$($folder.Name)'"; continue }
  if ($SKIP -contains $id) { Write-Output "Preserving journey/$id (not re-resized)"; continue }

  $out = Join-Path $dst $id
  $count = Resize-Folder $folder.FullName $out
  Write-Output "$($folder.Name) -> journey/$id : $count images"

  # Circles subfolder (named "Circle" or "Circles") -> journey/<id>/circles
  $circleDir = Get-ChildItem -Directory $folder.FullName -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '(?i)^circles?$' } | Select-Object -First 1
  $cout = Join-Path $out 'circles'
  if ($circleDir) {
    $ccount = Resize-Folder $circleDir.FullName $cout
    Write-Output "   circles -> journey/$id/circles : $ccount images"
  } elseif (Test-Path $cout) {
    Remove-Item -Recurse -Force $cout   # drop a stale circles folder if the source went away
  }
}
Write-Output "Done."
