$configPath = "C:\Users\Administrator\.zclaw\config.json"
if (-Not (Test-Path $configPath)) {
    Write-Error "Config file not found: $configPath"
    exit 1
}
$key = (Get-Content $configPath | ConvertFrom-Json).ZCLAW_API_KEY
$headers = @{"X-ZClaw-Api-Key"=$key; "Content-Type"="application/json"}
$base = "http://127.0.0.1:9481/zclaw/tools/invoke"
$storeId = "27505100021816"

$urls = @(
  @{name="库存"; url="https://sellercentral.amazon.com/inventory"},
  @{name="订单"; url="https://sellercentral.amazon.com/orders-v3"},
  @{name="广告"; url="https://sellercentral.amazon.com/gp/advertising/console"},
  @{name="买家评价"; url="https://sellercentral.amazon.com/product-reviews"},
  @{name="A+内容"; url="https://sellercentral.amazon.com/enhanced-content/list"},
  @{name="品牌旗舰店"; url="https://sellercentral.amazon.com/stores/ref=xx_storemgr_dnav_xx"},
  @{name="报告"; url="https://sellercentral.amazon.com/business-reports/ref=xx_sitereport_dnav_xx"},
  @{name="客户绩效"; url="https://sellercentral.amazon.com/gp/customer-experience/perf-notifications.html"},
  @{name="配送费率"; url="https://sellercentral.amazon.com/sbr#ref=xx_fbrates_dnav_xx"}
)

$results = @()
foreach ($item in $urls) {
  Write-Host "Visiting $($item.name)..."
  $visitArgs = @{
      storeId = $storeId
      url = $item.url
      waitUntil = "domcontentloaded"
      timeoutMs = 15000
  }
  $visitBody = @{
      tool = "visit_page"
      args = $visitArgs
  } | ConvertTo-Json -Compress
  
  try {
      $visitResp = Invoke-RestMethod -Uri $base -Method POST -Headers $headers -Body $visitBody -TimeoutSec 25
      if ($visitResp.code -ne 0) {
          Write-Warning "Visit failed for $($item.name): $($visitResp.message)"
          $results += "=== $($item.name) ===`n[Visit Failed: $($visitResp.message)]`n`n"
          continue
      }
  } catch {
      Write-Warning "Failed to visit $($item.name): $($_.Exception.Message)"
      $results += "=== $($item.name) ===`n[Exception during visit: $($_.Exception.Message)]`n`n"
      continue
  }
  
  Start-Sleep -Seconds 3
  
  # get content
  $contentArgs = @{
      storeId = $storeId
      format = "text"
      timeoutMs = 10000
  }
  $contentBody = @{
      tool = "get_page_content"
      args = $contentArgs
  } | ConvertTo-Json -Compress
  
  try {
      $resp = Invoke-RestMethod -Uri $base -Method POST -Headers $headers -Body $contentBody -TimeoutSec 15
      if ($resp.code -eq 0 -and $resp.data.content) {
          $text = $resp.data.content -replace '\s+', ' '
          $snippet = $text.Substring(0, [Math]::Min(1000, $text.Length))
          $results += "=== $($item.name) ===`n$snippet`n`n"
          Write-Host "Success: $($item.name)"
      } else {
          $results += "=== $($item.name) ===`n[Error: No content or error code $($resp.code)]`n`n"
          Write-Host "Failed to get content for $($item.name)"
      }
  } catch {
      $results += "=== $($item.name) ===`n[Exception getting content: $($_.Exception.Message)]`n`n"
      Write-Host "Exception getting content for $($item.name)"
  }
}

$outputPath = "C:\Users\Administrator\Downloads\amazon_pages.txt"
$results | Out-File $outputPath -Encoding UTF8
Write-Output "Done. Results saved to $outputPath"
