# API 契约校验中间件 (Contract Validator)

> P0-D 强制校验框架 — 第三道防线
> 版本: v1.0 | clowand 永久质量保障体系

## 功能

所有 API 响应在发送前被 JSON Schema 校验：
- 字段类型错误 → `500 CONTRACT_VIOLATION`
- 缺少必填字段 → 500
- 多出未声明字段 → 500（`additionalProperties: false`）
- 数组元素类型错误 → 500
- `const` 值不匹配 → 500

生产环境不暴露 schema 细节，只报 500 + 内部日志。

## 核心文件

| 文件 | 用途 |
|------|------|
| `lib/contract-validator.ts` | Ajv 实例 + wrapContractRoute HOF |
| `schemas/api-schemas.ts` | 所有 API 的 JSON Schema 注册表 |
| `__tests__/contract-validator.test.mjs` | 6 场景 17 测试 |

## 快速开始

### 方式 1：注册表路由（推荐）

```typescript
// schemas/api-schemas.ts 中注册
SCHEMA_REGISTRY['cart/abandon:POST'] = {
  success: { type: 'object', required: ['success', 'id'], ... },
  error: { type: 'object', required: ['error'], ... },
}

// route.js 中包装
import { wrapContractRoute } from '@/lib/contract-validator'

export const POST = wrapContractRoute(async (req) => {
  return NextResponse.json({ success: true, id: '...' })
}, 'cart/abandon:POST')
```

### 方式 2：内联 schema

```typescript
export const POST = wrapContractRoute(async (req) => {
  return NextResponse.json({ data: result })
}, null, {
  success: { type: 'object', required: ['data'], ... },
})
```

## 已集成路由

| 路由 | Schema Key | 状态 |
|------|-----------|------|
| `/api/cart/abandon` | `cart/abandon:POST` | ✅ |
| `/api/orders` | `orders:POST` | ✅ |
| `/api/auth` | `auth:POST` | ✅ |
| `/api/apply-discount` | `apply-discount:POST` | 已注册，待集成 |
| `/api/create-payment-intent` | `create-payment-intent:POST` | 已注册，待集成 |
| `/api/send-email` | `send-email:POST` | 已注册，待集成 |

## Schema 编写规范

```typescript
{
  success: {
    type: 'object',
    required: ['field1', 'field2'],    // 必填字段
    additionalProperties: false,        // 禁止多余字段
    properties: {
      field1: { type: 'string' },
      field2: { const: true },           // 精确常量
      field3: { type: 'number', minimum: 0 },
      field4: { type: 'string', format: 'uuid-v4' },  // 自定义格式
    },
  },
  error: { /* 4xx/5xx 响应 schema */ },
}
```

## 自定义格式

| 格式 | 正则 | 用途 |
|------|------|------|
| `uuid-v4` | UUID v4 标准格式 | 数据库 ID |
| `order-id` | `ORD-` 前缀时间戳 | 订单号 |

## 测试

```bash
node __tests__/contract-validator.test.mjs
```

6 个场景 17 个断言，覆盖正常/类型错误/缺字段/多余字段/数组元素/const 约束。

## 告警

契约违例日志格式：
```
[CONTRACT-VIOLATION] orders:POST status=200 errors=[{"path":"/(root)","message":"must have required property 'order'","keyword":"required"}]
```

连接到 Ops-Sentinel 后可自动触发 P1 告警。
