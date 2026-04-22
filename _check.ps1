$ErrorActionPreference = 'Stop'
$resp = Invoke-WebRequest -Uri 'https://clowand.com/' -UseBasicParsing
Write-Host ('Status: ' + $resp.StatusCode)
Write-Host ('Length: ' + $resp.Content.Length)
$html = $resp.Content
$markers = @(
  'VERSION:',
  'Clean Smarter',
  'The End of the Dirty',
  'Starter Kit',
  'Family Value',
  'Eco Refill',
  'Clowand Disposable',
  'Clowand Toilet Wand',
  'Select Your System',
  'Choose Your Bundle',
  'sale_price'
)
foreach ($m in $markers) {
  $hit = $html.Contains($m)
  $tag = if ($hit) { '[YES]' } else { '[--]' }
  Write-Host ($tag + ' ' + $m)
}
