// 6. requireMethod — 405 方法不允许
import { DecoratorFn, errorResponse } from './types'

export function requireMethod(...allowed: string[]): DecoratorFn {
  const methods = allowed.map((m) => m.toUpperCase())
  return (handler) => async (request, context) => {
    if (!methods.includes(request.method)) {
      return errorResponse(405, `Method ${request.method} not allowed`, {
        allowed: methods,
      })
    }
    return handler(request, context)
  }
}
