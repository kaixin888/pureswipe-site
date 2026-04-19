$configPath = "C:\Users\Administrator\.zclaw\config.json"
$key = (Get-Content $configPath | ConvertFrom-Json).ZCLAW_API_KEY
$headers = @{"X-ZClaw-Api-Key"=$key; "Content-Type"="application/json"}
$base = "http://127.0.0.1:9481/zclaw/tools/invoke"
$storeId = "27505100021816"

$urls = @(
  @{name="库存管理"; url="https://sellercentral.amazon.com/inventory"},
  @{name="订单管理"; url="https://sellercentral.amazon.com/orders-v3"},
  @{name="广告"; url="https://sellercentral.amazon.com/gp/advertising/console"},
  @{name="买家评价"; url="https://sellercentral.amazon.com/product-reviews"},
  @{name="A+内容"; url="https://sellercentral.amazon.com/enhanced-content/list"},
  @{name="品牌旗舰店"; url="https://sellercentral.amazon.com/stores/ref=xx_storemgr_dnav_xx"},
  @{name="业务报告"; url="https://sellercentral.amazon.com/business-reports/ref=xx_sitereport_dnav_xx"},
  @{name="客户服务绩效"; url="https://sellercentral.amazon.com/gp/customer-experience/perf-notifications.html"},
  @{name="配送费率"; url="https://sellercentral.amazon.com/sbr#ref=xx_fbrates_dnav_xx"}
)

$results = @()
foreach ($item in $urls) {
  Write-Host "Processing $($item.name)..."
  
  # 1. Visit
  $visitBody = @{
      tool = "visit_page"
      args = @{ storeId = $storeId; url = $item.url; waitUntil = "domcontentloaded"; timeoutMs = 20000 }
  } | ConvertTo-Json -Compress
  
  try {
      $vResp = Invoke-RestMethod -Uri $base -Method POST -Headers $headers -Body $visitBody -TimeoutSec 40
  } catch {
      Write-Warning "Visit Exception: $($_.Exception.Message)"
  }
  
  Start-Sleep -Seconds 5
  
  # 2. Get Content
  $contentBody = @{
      tool = "get_page_content"
      args = @{ storeId = $storeId; format = "text"; timeoutMs = 15000 }
  } | ConvertTo-Json -Compress
  
  try {
      $cResp = Invoke-RestMethod -Uri $base -Method POST -Headers $headers -Body $contentBody -TimeoutSec 20
      if ($cResp.ret -eq 0 -and $cResp.data.data.content) {
          $title = $cResp.data.data.title
          $text = $cResp.data.data.content -replace '\s+', ' '
          $snippet = $text.Substring(0, [Math]::Min(800, $text.Length))
          $results += "=== $($item.name) ===`n标题: $title`n内容摘要: $snippet`n`n"
          Write-Host "Success: $($item.name)"
      } else {
          $results += "=== $($item.name) ===`n[Content Error or Empty]`n`n"
          Write-Host "Failed: $($item.name)"
      }
  } catch {
      $results += "=== $($item.name) ===`n[Content Exception: $($_.Exception.Message)]`n`n"
      Write-Host "Exception: $($item.name)"
  }
}

$outputPath = "C:\Users\Administrator\Downloads\amazon_pages.txt"
$results | Out-File $outputPath -Encoding UTF8
Write-Output "Complete."
