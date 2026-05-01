// 12. requireOrigin — 403 Origin 白名单校验
import { DecoratorFn, errorResponse } from './types'

export function requireOrigin(...allowedOrigins: string[]): DecoratorFn {
  // 标准化 origin：去除尾部斜杠
  const normalized = allowedOrigins.map((o) => o.replace(/\/+$/, '').toLowerCase())

  return (handler) => async (request, context) => {
    const origin = request.headers.get('origin')
    if (!origin) {
      // 同源请求可能不带 origin header，允许通过
      return handler(request, context)
    }

    const normalizedOrigin = origin.replace(/\/+$/, '')
    if (!normalized.some((allowed) => normalizedOrigin === allowed)) {
      return errorResponse(403, `Origin ${origin} not allowed`)
    }

    return handler(request, context)
  }
}
