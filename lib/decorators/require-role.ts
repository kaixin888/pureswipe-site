// 2. requireRole — 403 权限不足
// 需在 requireAuth 之后使用（从 x-user-role header 读取角色）
import { DecoratorFn, errorResponse } from './types'

export function requireRole(...allowedRoles: string[]): DecoratorFn {
  return (handler) => async (request, context) => {
    // 从 Supabase 获取用户角色
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return errorResponse(403, 'Forbidden: user not authenticated')
    }

    // 简陋实现：从 header 读角色（实际项目中应从 DB 查询）
    // 生产环境建议查询 user_roles 表
    const role = request.headers.get('x-user-role') || 'user'

    if (!allowedRoles.includes(role)) {
      return errorResponse(403, `Forbidden: requires role: ${allowedRoles.join(' or ')}`)
    }

    return handler(request, context)
  }
}
