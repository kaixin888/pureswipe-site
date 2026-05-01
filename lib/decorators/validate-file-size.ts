// 15. validateFileSize — 413 文件大小校验
// 校验请求体大小（从 Content-Length header 读取）
import { DecoratorFn, errorResponse } from './types'

export function validateFileSize(maxBytes: number): DecoratorFn {
  return (handler) => async (request, context) => {
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10)

    if (contentLength > maxBytes) {
      const maxMB = (maxBytes / (1024 * 1024)).toFixed(1)
      return errorResponse(
        413,
        `Request body too large. Maximum allowed size is ${maxMB}MB`
      )
    }

    return handler(request, context)
  }
}
