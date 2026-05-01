// 7. csrfProtect — 403 CSRF 防护
// 校验 X-CSRF-Token header 与 session cookie 一致性
import { DecoratorFn, errorResponse } from './types'

export function csrfProtect(): DecoratorFn {
  return (handler) => async (request, context) => {
    // 仅校验写操作
    const safeMethods = ['GET', 'HEAD', 'OPTIONS']
    if (safeMethods.includes(request.method)) {
      return handler(request, context)
    }

    const csrfHeader = request.headers.get('x-csrf-token')
    const csrfCookie = request.cookies.get('csrf-token')?.value

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return errorResponse(403, 'CSRF validation failed')
    }

    return handler(request, context)
  }
}
