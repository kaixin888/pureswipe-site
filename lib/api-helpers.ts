// lib/api-helpers.ts — 共享常量与工具，确保所有 API 路由统一风格

/** 禁止 CDN/Edge 缓存 API 响应。心跳/巡检/web_fetch 依赖此头避免误报 404 */
export const API_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
}

/**
 * API 独立域名 — 绕过 Cloudflare CDN，物理隔离避免缓存误报。
 * DNS 灰云直连 Vercel（不经过 CDN），确保 /api/health /api/ping 等端点零缓存。
 * 所有外部健康检查（ops-sentinel、Uptime Robot 等）应使用此域名。
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clowand.com'
