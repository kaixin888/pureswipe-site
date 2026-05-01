// 13. throttle — 429 IP 级请求节流（排队模式）
// 与 rateLimit 不同：throttle 是排队而非拒绝，超出限制时延迟执行
import { DecoratorFn, errorResponse } from './types'

interface QueueEntry {
  resolve: () => void
  timestamp: number
}

const throttleStore = new Map<string, { queue: QueueEntry[]; lastProcessed: number }>()

// 清理过期队列（每 30 秒）
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of throttleStore) {
    data.queue = data.queue.filter((e) => now - e.timestamp < 30000)
    if (data.queue.length === 0) throttleStore.delete(key)
  }
}, 30000)

export function throttle(maxConcurrent: number, windowMs: number): DecoratorFn {
  return (handler) => async (request, context) => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const now = Date.now()
    let data = throttleStore.get(ip)

    if (!data) {
      data = { queue: [], lastProcessed: now }
      throttleStore.set(ip, data)
    }

    // 清理过期队列
    data.queue = data.queue.filter((e) => now - e.timestamp < windowMs)

    if (data.queue.length >= maxConcurrent) {
      // 超出并发限制：排队等待
      return new Promise((resolve) => {
        const entry: QueueEntry = { resolve: () => {}, timestamp: now }
        entry.resolve = () => {
          data!.queue = data!.queue.filter((e) => e !== entry)
          data!.lastProcessed = Date.now()
          resolve(handler(request, context))
        }
        data!.queue.push(entry)

        // 超时保护：10 秒后强制释放
        setTimeout(() => {
          if (data && data.queue.includes(entry)) {
            data.queue = data.queue.filter((e) => e !== entry)
            resolve(errorResponse(429, 'Request timed out waiting in queue'))
          }
        }, 10000)
      })
    }

    // 允许立即执行
    data.queue.push({ resolve: () => {}, timestamp: now })
    const result = await handler(request, context)
    data.lastProcessed = now

    // 处理队列中的下一个
    const next = data.queue.shift()
    next?.resolve()

    return result
  }
}
