// 1. requireAuth — 401 未认证
// 依赖 Supabase session cookie (sb-access-token)
import { DecoratorFn, errorResponse } from './types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export function requireAuth(): DecoratorFn {
  return (handler) => async (request, context) => {
    // 从 cookie 或 Authorization header 获取 token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.cookies.get('sb-access-token')?.value

    if (!token) {
      return errorResponse(401, 'Authentication required')
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return errorResponse(401, 'Invalid or expired token')
    }

    // 将 user 注入 request（通过 header 传递）
    const req = new Request(request.url, {
      ...request,
      headers: {
        ...Object.fromEntries(request.headers),
        'x-user-id': user.id,
        'x-user-email': user.email || '',
      },
    })
    return handler(req as any, context)
  }
}
