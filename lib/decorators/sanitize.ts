// 10. sanitizeInput — XSS 输入净化
// 对请求体中的字符串字段进行 HTML 实体编码
import { DecoratorFn } from './types'

// 基础 HTML 实体编码（不依赖第三方库）
function sanitizeString(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') return sanitizeString(obj)
  if (Array.isArray(obj)) return obj.map(sanitizeObject)
  if (obj && typeof obj === 'object') {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value)
    }
    return cleaned
  }
  return obj
}

export function sanitizeInput(): DecoratorFn {
  return (handler) => async (request, context) => {
    // 仅处理 JSON body
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return handler(request, context)
    }

    try {
      const cloned = request.clone()
      const body = await cloned.json()
      const sanitized = sanitizeObject(body)

      const req = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitized),
      })
      return handler(req as any, context)
    } catch {
      // body 无法解析时跳过（validateBody 会处理）
      return handler(request, context)
    }
  }
}
