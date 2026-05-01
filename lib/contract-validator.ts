// lib/contract-validator.ts — P0-D 接口契约校验中间件
// 所有 API 响应必须符合 JSON Schema。字段缺失/类型错误 → 500 + 日志。
import { NextResponse } from 'next/server'
import Ajv, { type JSONSchemaType } from 'ajv'
import { SCHEMA_REGISTRY, type ApiSchemas } from '../schemas/api-schemas'

// ─── Ajv 单例（编译型，适合 serverless 冷启动） ───
const ajv = new Ajv({
  allErrors: true,       // 收集所有错误（不遇到第一个就停止）
  strict: true,          // 严格模式：禁止 unknown keywords
  coerceTypes: false,    // 不自动类型转换（"1" !== 1）
  removeAdditional: false, // 不自动剔除多余字段
})

// 自定义格式：Supabase UUID
ajv.addFormat('uuid-v4', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

// 自定义格式：订单 ID ORD- 前缀
ajv.addFormat('order-id', /^ORD-\d+(-\d+)?$/)

// 编译缓存：避免每次请求重新编译相同 schema
const compileCache = new Map<string, ReturnType<typeof ajv.compile>>()
function getCompiled(schema: object) {
  const key = JSON.stringify(schema)
  if (!compileCache.has(key)) {
    compileCache.set(key, ajv.compile(schema))
  }
  return compileCache.get(key)!
}

// ─── 路由级别的 schema 注册 ───
const routeSchemas = new Map<string, ApiSchemas>()

// 从全局注册表预载
for (const [key, schemas] of Object.entries(SCHEMA_REGISTRY)) {
  routeSchemas.set(key, schemas as ApiSchemas)
}

export function registerRouteSchema(key: string, schemas: ApiSchemas) {
  routeSchemas.set(key, schemas)
}

// ─── 核心：wrapContractRoute HOF ───
// 用法: wrapContractRoute(handler, 'cart/abandon:POST')
//       wrapContractRoute(handler, null, { inline: successSchema })
export function wrapContractRoute(
  handler: (request: Request, context?: any) => Promise<Response>,
  routeKeyOrSchemas?: string | ApiSchemas | null,
  inlineSchemas?: ApiSchemas
) {
  let schemas: ApiSchemas | undefined

  if (typeof routeKeyOrSchemas === 'string') {
    schemas = routeSchemas.get(routeKeyOrSchemas)
  } else if (routeKeyOrSchemas && typeof routeKeyOrSchemas === 'object') {
    schemas = routeKeyOrSchemas
  } else if (inlineSchemas) {
    schemas = inlineSchemas
  }

  // 没有注册 schema 时直接透传（允许分阶段迁移）
  if (!schemas) {
    return handler
  }

  return async (request: Request, context?: any): Promise<Response> => {
    let response: Response

    try {
      response = await handler(request, context)
    } catch (err: any) {
      // handler 抛出异常时，当作 500 处理
      console.error(`[CONTRACT] ${routeKeyOrSchemas || 'unknown'} handler threw:`, err.message)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // 选择要校验的 schema
    const statusCode = response.status
    let targetSchema: object | undefined

    if (statusCode >= 200 && statusCode < 300) {
      targetSchema = schemas.success
    } else if (statusCode >= 400) {
      targetSchema = schemas.error || schemas.success
    }

    // 没有适用 schema 或 3xx 重定向 → 跳过校验
    if (!targetSchema) {
      return response
    }

    // Clone 读取 body（NextResponse body 是单次读取流）
    let body: any
    try {
      const cloned = response.clone()
      body = await cloned.json()
    } catch {
      // 非 JSON 响应（如 302 redirect）直接跳过
      return response
    }

    // 校验
    const validate = getCompiled(targetSchema)
    const valid = validate(body)

    if (!valid) {
      const errors = validate.errors?.map((e) => ({
        path: e.instancePath || '(root)',
        message: e.message,
        keyword: e.keyword,
        params: e.params,
      }))

      console.error(
        `[CONTRACT-VIOLATION] ${routeKeyOrSchemas || 'unknown'} ` +
        `status=${statusCode} ` +
        `errors=${JSON.stringify(errors?.slice(0, 5))}`
      )

      // 生产环境不暴露 schema 细节，只报 500
      return NextResponse.json(
        {
          error: 'Internal server error',
          code: 'CONTRACT_VIOLATION',
        },
        { status: 500 }
      )
    }

    return response
  }
}

// ─── 便捷：直接校验 object（用于单元测试/手动校验） ───
export function validateContract(
  body: unknown,
  schema: object
): { valid: boolean; errors?: any[] } {
  const validate = getCompiled(schema)
  const valid = validate(body)
  return { valid, errors: valid ? undefined : validate.errors }
}

export { ajv }
