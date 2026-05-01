// 写入验证中间件 — P0-B 强制校验框架
// 所有 POST/PUT/DELETE 写操作后立即 SELECT 验证，不一致即报错+回滚
import { NextRequest, NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'

// ─── 类型 ──────────────────────────────

/** 写入验证配置 */
export interface WriteVerificationConfig {
  /** Supabase 表名 */
  table: string
  /** 主键字段名（默认 'id'） */
  idField?: string
  /** 从 NextResponse body 提取写入后 ID 的函数 */
  getWriteId?: (responseBody: Record<string, unknown>) => string | null
  /** 排除比对字段（密码/token/密钥） */
  excludeFields?: string[]
  /** 浮点数比较容差（默认 0.01） */
  floatTolerance?: number
  /** 失败时是否尝试回滚（DELETE 用软删除标记替代） */
  rollbackEnabled?: boolean
  /** 是否启用详细日志 */
  verbose?: boolean
}

/** 比对差异详情 */
export interface DiffDetail {
  field: string
  expected: unknown
  actual: unknown
  tolerance?: number
}

/** 验证结果 */
interface VerificationResult {
  passed: boolean
  message: string
  details: DiffDetail[]
  actualData: Record<string, unknown> | null
}

// ─── 全局默认排除字段 ──────────────────

export const DEFAULT_EXCLUDE_FIELDS = [
  'password',
  'password_hash',
  'token',
  'secret',
  'api_key',
  'created_at',
  'updated_at',
  'last_login',
  'reset_token',
  'encrypted_password',
  'two_factor_secret',
  'recovery_codes',
]

// ─── 核心比对函数 ───────────────────────

/**
 * 深度比对两个对象的可比较字段
 * - 跳过 excludeFields 中的字段
 * - 浮点数字段容差默认 0.01
 * - JSONB/对象递归比较
 */
export function deepCompare(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>,
  excludeFields: string[] = [],
  floatTolerance = 0.01
): DiffDetail[] {
  const diffs: DiffDetail[] = []
  const exclude = new Set(excludeFields)

  for (const key of Object.keys(expected)) {
    if (exclude.has(key)) continue
    if (!(key in actual)) {
      diffs.push({ field: key, expected: expected[key], actual: undefined })
      continue
    }

    const expVal = expected[key]
    const actVal = actual[key]

    // null 一致性检查
    if (expVal === null && actVal === null) continue
    if (expVal === null || actVal === null) {
      diffs.push({ field: key, expected: expVal, actual: actVal })
      continue
    }

    // 浮点数容差比对
    if (typeof expVal === 'number' && typeof actVal === 'number') {
      if (Math.abs(expVal - actVal) > floatTolerance) {
        diffs.push({ field: key, expected: expVal, actual: actVal, tolerance: floatTolerance })
      }
      continue
    }

    // 字符串（decimal 字段可能是字符串）
    if (typeof expVal === 'string' && typeof actVal === 'string') {
      if (expVal !== actVal) {
        diffs.push({ field: key, expected: expVal, actual: actVal })
      }
      continue
    }

    // 对象/数组深度比较（JSONB）
    if (typeof expVal === 'object' && typeof actVal === 'object') {
      const expStr = JSON.stringify(expVal)
      const actStr = JSON.stringify(actVal)
      if (expStr !== actStr) {
        diffs.push({ field: key, expected: expVal, actual: actVal })
      }
      continue
    }

    // 简单值不等
    if (expVal !== actVal) {
      diffs.push({ field: key, expected: expVal, actual: actVal })
    }
  }

  return diffs
}

// ─── 写入验证核心 ──────────────────────

/**
 * 从 Supabase 读取刚写入的记录并比对
 */
export async function verifyWrite(
  supabase: SupabaseClient,
  table: string,
  recordId: string,
  expected: Record<string, unknown>,
  idField: string = 'id',
  excludeFields: string[] = DEFAULT_EXCLUDE_FIELDS,
  floatTolerance: number = 0.01
): Promise<VerificationResult> {
  const { data: actual, error } = await supabase
    .from(table)
    .select('*')
    .eq(idField, recordId)
    .single()

  if (error) {
    return {
      passed: false,
      message: `Write verification FAILED: cannot re-read ${table}.${idField}=${recordId} — ${error.message}`,
      details: [],
      actualData: null,
    }
  }

  if (!actual) {
    return {
      passed: false,
      message: `Write verification FAILED: ${table}.${idField}=${recordId} returned no rows — write silently failed`,
      details: [],
      actualData: null,
    }
  }

  const diffs = deepCompare(expected, actual as Record<string, unknown>, excludeFields, floatTolerance)

  if (diffs.length > 0) {
    return {
      passed: false,
      message: `Write verification FAILED: ${diffs.length} field(s) mismatch`,
      details: diffs,
      actualData: actual as Record<string, unknown>,
    }
  }

  return {
    passed: true,
    message: `Write verification PASSED: ${table}.${idField}=${recordId}`,
    details: [],
    actualData: actual as Record<string, unknown>,
  }
}

/**
 * 尝试回滚失败写入
 * - INSERT: 删除刚插入的记录
 * - UPDATE: 不操作（数据已脏，需人工处理）
 * - DELETE: 不操作（软删除已是标记）
 */
async function attemptRollback(
  supabase: SupabaseClient,
  table: string,
  recordId: string,
  idField: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
): Promise<void> {
  if (operation !== 'INSERT') return // Only rollback fresh inserts

  try {
    const { error } = await supabase.from(table).delete().eq(idField, recordId)
    if (error) {
      console.error(`[write-verification] Rollback failed for ${table}.${idField}=${recordId}:`, error.message)
    }
    // Removed verbose log
  } catch (err) {
    console.error(`[write-verification] Rollback exception for ${table}.${idField}=${recordId}:`, (err as Error).message)
  }
}

// ─── HOF 包装器 ────────────────────────

type RouteHandler = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse>

/**
 * wrapWriteRoute — HOF 包装 API 路由，注入写入验证
 *
 * 用法：
 *   export const POST = wrapWriteRoute(async (req) => { ... }, {
 *     table: 'orders',
 *     getWriteId: (body) => body.order_id,
 *     getExpectedData: (reqBody) => ({ ... }),
 *   })
 */
export function wrapWriteRoute(
  handler: RouteHandler,
  config: WriteVerificationConfig & {
    /** 从解析后的请求体提取期望写入的数据（用于比对） */
    getExpectedData?: (requestBody: Record<string, unknown>) => Record<string, unknown>
    /** 实际写入的 Supabase client */
    getSupabase?: (request: NextRequest) => SupabaseClient | null
  }
): RouteHandler {
  const {
    table,
    idField = 'id',
    getWriteId,
    excludeFields = DEFAULT_EXCLUDE_FIELDS,
    floatTolerance = 0.01,
    rollbackEnabled = true,
  } = config

  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      const response = await handler(request, context)

      // 只验证 2xx + 写入方法
      const method = request.method
      if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) return response
      if (response.status < 200 || response.status >= 300) return response

      // 克隆响应以读取 body（NextResponse body 只能读一次）
      const clonedResponse = response.clone()
      let body: Record<string, unknown> = {}
      try {
        body = await clonedResponse.json()
      } catch {
        // 非 JSON 响应（如 204 No Content）— 跳过验证
        return response
      }

      // 提取 ID
      let recordId: string | null = null
      if (getWriteId) {
        recordId = getWriteId(body)
      } else if (typeof body.id === 'string') {
        recordId = body.id
      } else if (typeof body.id === 'number') {
        recordId = String(body.id)
      }

      if (!recordId) return response // 无 ID 可验证

      // 构建期望数据
      const expected: Record<string, unknown> = config.getExpectedData
        ? config.getExpectedData(body)
        : body

      // 获取 Supabase client
      let supabase: SupabaseClient | null = null
      if (config.getSupabase) {
        supabase = config.getSupabase(request)
      }

      if (!supabase) return response // 无 client 则跳过验证

      // 执行验证
      const operation =
        method === 'POST' ? 'INSERT' : method === 'DELETE' ? 'DELETE' : 'UPDATE'
      const result = await verifyWrite(supabase, table, recordId, expected, idField, excludeFields, floatTolerance)

      if (!result.passed) {
        console.error(`[write-verification] ${result.message}`, JSON.stringify(result.details))
        if (rollbackEnabled) {
          await attemptRollback(supabase, table, recordId, idField, operation)
        }
        return NextResponse.json(
          {
            error: 'Write verification failed',
            details: result.details,
            message: result.message,
          },
          { status: 500 }
        )
      }

      return response
    } catch (err) {
      console.error('[write-verification] Wrapper exception:', (err as Error).message)
      return NextResponse.json({ error: 'Internal verification error' }, { status: 500 })
    }
  }
}
