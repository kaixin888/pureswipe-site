// 4. validateQuery — 400 查询参数校验 (Zod)
import { z } from 'zod'
import { DecoratorFn, errorResponse } from './types'

export function validateQuery(schema: z.ZodSchema): DecoratorFn {
  return (handler) => async (request, context) => {
    const url = new URL(request.url)
    const params: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })

    const result = schema.safeParse(params)
    if (!result.success) {
      return errorResponse(400, 'Invalid query parameters', {
        errors: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      })
    }

    return handler(request, context)
  }
}
