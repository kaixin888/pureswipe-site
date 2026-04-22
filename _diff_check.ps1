$ErrorActionPreference = 'Stop'
$bl = (Get-Content -LiteralPath '_baseline.txt' | Measure-Object -Line).Lines
$cur = (Get-Content -LiteralPath 'app\page.js' | Measure-Object -Line).Lines
Write-Host ('c4a4e97 baseline: ' + $bl + ' lines')
Write-Host ('current 424b4c4 : ' + $cur + ' lines')
Write-Host ''
Write-Host '=== Critical feature token presence (baseline vs current) ==='
$base = Get-Content '_baseline.txt' -Raw
$cur2 = Get-Content 'app\page.js' -Raw
$tokens = @(
  'gtag(',
  'GlobalCheckout',
  'add_to_cart',
  'begin_checkout',
  '/api/orders',
  '/api/discount',
  '/api/track',
  '/api/subscribe',
  'getEffectivePrice',
  'isOnSale',
  'effectivePrice',
  'Subscribe & Save',
  'window.dataLayer',
  'fbq(',
  'TrackingPanel',
  'tracking_number',
  'discount_code',
  'finalPrice',
  'strikethroughPrice'
)
foreach ($tok in $tokens) {
  $b = ([regex]::Matches($base, [regex]::Escape($tok))).Count
  $c = ([regex]::Matches($cur2, [regex]::Escape($tok))).Count
  $tag = if ($b -gt 0 -and $c -eq 0) { ' [REGRESSION - removed]' } elseif ($b -ne $c) { ' [DIFF]' } else { '' }
  Write-Host ('  ' + $tok.PadRight(28) + ' baseline=' + $b + ' current=' + $c + $tag)
}
