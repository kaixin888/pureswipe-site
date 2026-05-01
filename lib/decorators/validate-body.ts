// 3. validateBody — 400 请求体校验 (Zod)
import { z } from 'zod'
import { DecoratorFn, errorResponse } from './types'

export function validateBody(schema: z.ZodSchema): DecoratorFn {
  return (handler) => async (request, context) => {
    try {
      const body = await request.json()
      const result = schema.safeParse(body)

      if (!result.success) {
        return errorResponse(400, 'Invalid request body', {
          errors: result.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        })
      }

      // 用解析后的数据创建新请求（已 strip 多余字段）
      const req = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(result.data),
      })
      return handler(req as any, context)
    } catch {
      return errorResponse(400, 'Invalid JSON body')
    }
  }
}
