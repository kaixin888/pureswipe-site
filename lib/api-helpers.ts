// lib/api-helpers.ts — 共享常量与工具，确保所有 API 路由统一风格

/** 禁止 CDN/Edge 缓存 API 响应。心跳/巡检/web_fetch 依赖此头避免误报 404 */
export const API_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
}
