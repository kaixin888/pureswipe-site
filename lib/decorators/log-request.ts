// 14. logRequest — 审计日志装饰器
// 记录请求方法、路径、IP、耗时
import { DecoratorFn } from './types'

export function logRequest(): DecoratorFn {
  return (handler) => async (request, context) => {
    const start = Date.now()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    try {
      const response = await handler(request, context)
      const duration = Date.now() - start

      console.log(
        `[REQ] ${request.method} ${new URL(request.url).pathname}` +
        ` | ${response.status} | ${duration}ms | ${ip}`
      )

      return response
    } catch (err: any) {
      const duration = Date.now() - start
      console.error(
        `[REQ-ERR] ${request.method} ${new URL(request.url).pathname}` +
        ` | ${duration}ms | ${ip} | ${err.message}`
      )
      throw err
    }
  }
}
