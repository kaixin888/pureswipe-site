// 11. requireApiKey — 401 API Key 校验
import { DecoratorFn, errorResponse } from './types'

export function requireApiKey(
  options?: {
    headerName?: string    // 默认 'x-api-key'
    validKeys?: string[]   // 允许的 key 列表
    envKey?: string        // 从环境变量取值（单一 key）
  }
): DecoratorFn {
  const header = options?.headerName || 'x-api-key'

  // 解析有效 key 列表
  const validKeys: string[] = options?.validKeys || []
  if (options?.envKey && process.env[options.envKey]) {
    validKeys.push(process.env[options.envKey]!)
  }

  return (handler) => async (request, context) => {
    const apiKey = request.headers.get(header)

    if (!apiKey) {
      return errorResponse(401, 'API key required')
    }

    if (validKeys.length > 0 && !validKeys.includes(apiKey)) {
      return errorResponse(401, 'Invalid API key')
    }

    return handler(request, context)
  }
}
