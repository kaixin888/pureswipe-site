// 8. cacheControl — 设置 Cache-Control 响应头
import { DecoratorFn } from './types'

export function cacheControl(maxAgeSeconds: number): DecoratorFn {
  return (handler) => async (request, context) => {
    const response = await handler(request, context)
    response.headers.set(
      'Cache-Control',
      `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${Math.floor(maxAgeSeconds / 10)}`
    )
    return response
  }
}
