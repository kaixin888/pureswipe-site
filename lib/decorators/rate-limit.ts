// 5. rateLimit — 429 全局速率限制（内存实现，单实例适用）
import { DecoratorFn, errorResponse } from './types'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// 每 60 秒清理过期条目
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 60000)

export function rateLimit(maxRequests: number, windowMs: number): DecoratorFn {
  return (handler) => async (request, context) => {
    // 按 IP 限流
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs })
    } else {
      entry.count++
      if (entry.count > maxRequests) {
        return errorResponse(429, `Rate limit exceeded. Try again later.`)
      }
    }

    return handler(request, context)
  }
}
