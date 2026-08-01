<#
Genera las versiones binarias del favicon a partir de los mismos colores y
proporciones del símbolo vectorial de SpeakFlowAI. No necesita dependencias.
#>

Add-Type -AssemblyName System.Drawing

function New-RoundedRectanglePath {
  param(
    [System.Drawing.RectangleF]$Rectangle,
    [float]$Radius
  )

  $diameter = $Radius * 2
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddArc($Rectangle.X, $Rectangle.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rectangle.X, $Rectangle.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-BrandBitmap {
  param(
    [int]$Size,
    [float]$OuterPadding
  )

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $rectangle = [System.Drawing.RectangleF]::new(
    $OuterPadding,
    $OuterPadding,
    $Size - (2 * $OuterPadding),
    $Size - (2 * $OuterPadding)
  )
  $path = New-RoundedRectanglePath -Rectangle $rectangle -Radius ($Size * 0.265)
  $brandBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#176b87"))
  $graphics.FillPath($brandBrush, $path)

  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, [Math]::Max(2, $Size * 0.063))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  foreach ($ratio in @(0.33, 0.5, 0.67)) {
    $y = $Size * $ratio
    $graphics.DrawBezier(
      $pen,
      [System.Drawing.PointF]::new($Size * 0.22, $y),
      [System.Drawing.PointF]::new($Size * 0.31, $y - ($Size * 0.09)),
      [System.Drawing.PointF]::new($Size * 0.35, $y + ($Size * 0.09)),
      [System.Drawing.PointF]::new($Size * 0.44, $y)
    )
    $graphics.DrawBezier(
      $pen,
      [System.Drawing.PointF]::new($Size * 0.44, $y),
      [System.Drawing.PointF]::new($Size * 0.53, $y - ($Size * 0.09)),
      [System.Drawing.PointF]::new($Size * 0.57, $y + ($Size * 0.09)),
      [System.Drawing.PointF]::new($Size * 0.66, $y)
    )
    $graphics.DrawBezier(
      $pen,
      [System.Drawing.PointF]::new($Size * 0.66, $y),
      [System.Drawing.PointF]::new($Size * 0.71, $y - ($Size * 0.04)),
      [System.Drawing.PointF]::new($Size * 0.74, $y + ($Size * 0.02)),
      [System.Drawing.PointF]::new($Size * 0.78, $y)
    )
  }

  $pen.Dispose()
  $brandBrush.Dispose()
  $path.Dispose()
  $graphics.Dispose()
  return $bitmap
}

$publicDirectory = Join-Path $PSScriptRoot "..\apps\web\public"
$faviconBitmap = New-BrandBitmap -Size 32 -OuterPadding 1
$faviconBitmap.Save(
  (Join-Path $publicDirectory "favicon-32x32.png"),
  [System.Drawing.Imaging.ImageFormat]::Png
)
$icon = [System.Drawing.Icon]::FromHandle($faviconBitmap.GetHicon())
$iconStream = [System.IO.File]::Create((Join-Path $publicDirectory "favicon.ico"))
$icon.Save($iconStream)
$iconStream.Dispose()
$icon.Dispose()
$faviconBitmap.Dispose()

$appleBitmap = New-BrandBitmap -Size 180 -OuterPadding 0
$appleBitmap.Save(
  (Join-Path $publicDirectory "apple-touch-icon.png"),
  [System.Drawing.Imaging.ImageFormat]::Png
)
$appleBitmap.Dispose()
