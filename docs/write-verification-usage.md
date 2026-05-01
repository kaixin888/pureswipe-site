# 写入验证中间件 (Write Verification)

> P0 强制校验框架 — 第一道防线
> 版本: v1.0 | clowand 永久质量保障体系

## 功能

所有 POST/PUT/DELETE 写操作完成后，立即从数据库重读并逐字段比对：
- 字段不匹配 → **500 报错 + 回滚**
- 记录查不到 → **500 "write silently failed"**
- 比对时自动跳过: `password`, `token`, `created_at`, `updated_at` 等敏感/时间字段

## 核心文件

| 文件 | 用途 |
|------|------|
| `lib/write-verification.ts` | verifyWrite() 核心 + wrapWriteRoute() HOF |
| `config/write-verification.config.ts` | 7 个模型配置（users/products/orders/...） |
| `__tests__/write-verification.test.mjs` | 6 个测试场景 |

## 快速开始

### 方式 1：wrapWriteRoute HOF（推荐）

```typescript
// app/api/admin/products/route.ts
import { wrapWriteRoute } from '@/lib/write-verification'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const POST = wrapWriteRoute(
  async (request: NextRequest) => {
    const body = await request.json()
    const { data, error } = await supabase.from('products').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  },
  {
    table: 'products',
    getWriteId: (body) => body.id,
    getSupabase: () => supabase,
  }
)
```

### 方式 2：verifyWrite() 直接调用

```typescript
import { verifyWrite } from '@/lib/write-verification'

const { data, error } = await supabase.from('products').insert(body).select().single()
if (error) return NextResponse.json({ error: error.message }, { status: 500 })

const result = await verifyWrite(supabase, 'products', data.id, body)
if (!result.passed) {
  console.error('[WRITE-VERIFY]', result.message, result.details)
  return NextResponse.json({ error: 'Write verification failed' }, { status: 500 })
}

return NextResponse.json(data)
```

## 配置模型

在 `config/write-verification.config.ts` 中添加新模型：

```typescript
export const WRITE_VERIFICATION_MODELS = {
  new_model: {
    table: 'new_model',
    idField: 'id',
    excludeFields: ['created_at', 'updated_at'],
    floatTolerance: 0.01,
    rollbackEnabled: true,
  },
}
```

## 排除字段规则

| 类型 | 字段 | 原因 |
|------|------|------|
| 密码类 | password, password_hash, encrypted_password | 安全 |
| 令牌类 | token, secret, api_key, reset_token | 安全 |
| 时间类 | created_at, updated_at, last_login | DB 自动生成，毫秒级偏差 |
| 2FA | two_factor_secret, recovery_codes | 安全 |

## 浮点容差

| 表 | 字段 | 容差 |
|----|------|------|
| products | price, sale_price | ±0.01 |
| orders | amount, tax, shipping | ±0.01 |
| abandoned_carts | cart_total | ±0.01 |

## 回滚策略

| 操作 | 回滚策略 |
|------|---------|
| INSERT 失败 | DELETE 刚插入的记录 |
| UPDATE 失败 | 不操作（数据已脏，人工处理） |
| DELETE 失败 | 不操作（软删除已是标记） |
| users 表 | 永不回滚（认证绑定） |
| orders 表 | 永不回滚（支付流水） |

## 测试

```bash
node __tests__/write-verification.test.mjs
```

6 个场景：
1. INSERT 字段一致 ✅
2. INSERT 后查不到 → 报错 ✅
3. UPDATE 字段不一致 → 报错 ✅
4. DELETE 后仍存在 → 报错 ✅
5. 排除字段跳过比对 ✅
6. 并发写入隔离 ✅
