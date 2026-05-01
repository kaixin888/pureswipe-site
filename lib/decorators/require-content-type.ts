// 9. requireContentType — 415 不支持的媒体类型
import { DecoratorFn, errorResponse } from './types'

export function requireContentType(expectedType: string): DecoratorFn {
  return (handler) => async (request, context) => {
    // 仅对有 body 的请求校验
    if (request.method === 'GET' || request.method === 'HEAD') {
      return handler(request, context)
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes(expectedType)) {
      return errorResponse(415, `Content-Type must be ${expectedType}`)
    }

    return handler(request, context)
  }
}
