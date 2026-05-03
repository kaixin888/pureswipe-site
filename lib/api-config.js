// lib/api-config.js — 外部 API 统一配置中心
// 所有第三方 API 调用的端点、超时、降级策略在此集中管理。

/** @typedef {{ url: string, serverUrl?: string, key?: string, timeout: number, fallback: 'allow' | 'block' | Record<string, unknown>, cors?: boolean }} ApiEndpoint */

/** @type {Record<string, ApiEndpoint>} */
export const API_CONFIG: Record<string, ApiEndpoint> = {
  // 防欺诈 IP 检查 — AbuseIPDB v2 API
  // 免费额度: 1000次/天, AbuseConfidenceScore ≥ 25 标记可疑
  abuseipdb: {
    url: 'https://api.abuseipdb.com/api/v2/check',
    key: 'ABUSEIPDB_KEY',
    timeout: 3000,
    fallback: 'allow',
  },

  // 邮箱格式/有效性检查 — disify.com 免费 API（无需 key）
  disify: {
    url: 'https://www.disify.com/api/email',
    timeout: 2000,
    fallback: 'allow',
    cors: true,
  },

  // IP 地理定位 — ip-api.com 免费 API
  // 用于检测国家/地区异常（非美国订单标记高危）
  'ip-api': {
    url: 'http://ip-api.com/json',
    timeout: 2000,
    fallback: { countryCode: 'US' },
  },

  // Google Safe Browsing v4 — 外链安全检查
  // 免费额度: 10000次/天
  safebrowsing: {
    url: 'https://safebrowsing.googleapis.com/v4/threatMatches:find',
    key: 'GOOGLE_SAFE_BROWSING_KEY',
    timeout: 3000,
    fallback: 'allow',
  },

  // Link Preview — 链接预览抓取
  linkpreview: {
    url: 'https://api.linkpreview.net',
    key: 'LINKPREVIEW_KEY',
    timeout: 3000,
    fallback: 'allow',
  },
}
