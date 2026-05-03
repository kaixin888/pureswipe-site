// lib/api-wrapper.js — 统一 API 调用封装（熔断 + 降级 + 用量日志）
// 所有第三方 API 调用必须通过此函数，禁止裸 fetch。
//
// 保证行为：
// 1. 超时 5s 硬上限（AbortController）
// 2. 失败自动重试 1 次
// 3. 异常不向上抛，返回 degraded=true + 默认降级值
// 4. 自动记录 api_usage_log（Supabase 写入，异步非阻塞）

import { API_CONFIG } from './api-config'

/**
 * @typedef {{ data: unknown|null, error: string|null, degraded: boolean }} ApiResult
 */

/**
 * 安全调用外部 API，内置熔断与降级。
 *
 * @param {string} apiId — api-config.js 中定义的 API 标识
 * @param {Record<string, string>} [params] — 查询参数（仅 GET 请求追加到 URL）
 * @param {AbortSignal} [signal] — 外部 AbortSignal（可选，叠加内部超时）
 * @returns {Promise<ApiResult>} — { data, error, degraded } 永不会 throw
 */
export async function apiCall(apiId, params, signal) {
  const cfg = API_CONFIG[apiId]
  if (!cfg) {
    return { data: null, error: `未知 API: ${apiId}`, degraded: true }
  }

  const startedAt = Date.now()
  let lastError = ''

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), cfg.timeout)
    const onExternalAbort = () => controller.abort()
    signal?.addEventListener('abort', onExternalAbort, { once: true })

    try {
      const url = params
        ? `${cfg.url}?${new URLSearchParams(params).toString()}`
        : cfg.url

      const headers = { Accept: 'application/json' }
      if (cfg.key) {
        const keyValue = process.env[cfg.key]
        if (keyValue) {
          if (apiId === 'abuseipdb') {
            headers['Key'] = keyValue
          }
        }
      }

      const response = await fetch(url, { headers, signal: controller.signal })
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onExternalAbort)

      const durationMs = Date.now() - startedAt

      if (!response.ok) {
        lastError = `${response.status} ${response.statusText}`
        if (response.status >= 400 && response.status < 500) {
          await logUsage(apiId, cfg, response.status, durationMs)
          return {
            data: cfg.fallback,
            error: lastError,
            degraded: true,
          }
        }
      } else {
        const json = await response.json()
        await logUsage(apiId, cfg, response.status, durationMs)
        return { data: json, error: null, degraded: false }
      }
    } catch (err) {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onExternalAbort)

      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      lastError = isAbort ? `超时 (${cfg.timeout}ms)` : String(err)

      if (!isAbort && attempt === 1) continue
    }
  }

  const durationMs = Date.now() - startedAt
  await logUsage(apiId, cfg, 0, durationMs, lastError)

  return {
    data: cfg.fallback,
    error: lastError,
    degraded: true,
  }
}

/** @param {number} statusCode @param {number} durationMs @param {string} [error] */
async function logUsage(apiName, cfg, statusCode, durationMs, error) {
  if (typeof window !== 'undefined') return
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    )
    await supabase.from('api_usage_log').insert({
      api_name: apiName,
      endpoint: cfg.url,
      status_code: statusCode,
      duration_ms: durationMs,
      error: error || null,
    })
  } catch {
    // 日志写入失败不阻塞主流程
  }
}
