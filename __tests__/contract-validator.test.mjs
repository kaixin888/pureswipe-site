// P0-D 契约校验测试 — 5 个场景
// 用法: node __tests__/contract-validator.test.mjs
import { describe, it } from 'node:test'
import assert from 'node:assert'

// 直接测试 JSON Schema（Ajv 编译 + 校验），不依赖 Next.js runtime
import Ajv from 'ajv'

const ajv = new Ajv({
  allErrors: true,
  strict: true,
  coerceTypes: false,
  removeAdditional: false,
})
ajv.addFormat('uuid-v4', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
ajv.addFormat('order-id', /^ORD-\d+(-\d+)?$/)

// ─── Schema 定义（从 schemas/api-schemas.ts 复制，确保测试独立） ───

const cartAbandonSuccess = {
  type: 'object',
  required: ['success', 'session_id', 'id'],
  additionalProperties: false,
  properties: {
    success: { const: true },
    session_id: { type: 'string', minLength: 8 },
    id: { type: 'string', format: 'uuid-v4' },
  },
}

const cartAbandonError = {
  type: 'object',
  required: ['error'],
  additionalProperties: false,
  properties: { error: { type: 'string' } },
}

const authSuccess = {
  type: 'object',
  required: ['success'],
  additionalProperties: false,
  properties: { success: { const: true } },
}

const authError = {
  type: 'object',
  required: ['success'],
  additionalProperties: false,
  properties: { success: { const: false } },
}

const ordersSuccess = {
  type: 'object',
  required: ['success', 'order'],
  additionalProperties: false,
  properties: {
    success: { const: true },
    order: { type: 'object' },
  },
}

const ordersError = {
  type: 'object',
  required: ['success', 'error'],
  additionalProperties: false,
  properties: {
    success: { const: false },
    error: { type: 'string' },
  },
}

// ─── 测试场景 ───

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`  ❌ ${name} — ${err.message}`)
    failed++
  }
}

// ═══ Scenario 1: 正常响应通过 ═══
console.log('\n场景 1：正常响应通过 schema 校验')
{
  const validate = ajv.compile(cartAbandonSuccess)
  test('cart/abandon success 响应', () => {
    assert.ok(validate({
      success: true,
      session_id: 'abandon_test12345',
      id: '550e8400-e29b-41d4-a716-446655440000',
    }))
  })

  test('auth success 响应', () => {
    const v = ajv.compile(authSuccess)
    assert.ok(v({ success: true }))
  })

  test('orders success 响应', () => {
    const v = ajv.compile(ordersSuccess)
    assert.ok(v({ success: true, order: { id: 1, total: 34.99 } }))
  })
}

// ═══ Scenario 2: 字段类型错误 → CONTRACT_VIOLATION ═══
console.log('\n场景 2：字段类型错误 → 校验失败')
{
  test('cart/abandon — session_id 是数字而非字符串', () => {
    const validate = ajv.compile(cartAbandonSuccess)
    const result = validate({
      success: true,
      session_id: 123456,
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    assert.strictEqual(result, false)
    const error = validate.errors?.[0]
    assert.ok(error?.message.includes('string'), `Expected string error, got: ${error?.message}`)
  })

  test('auth — success 是 true 但 schema 要求 false（error case）', () => {
    const validate = ajv.compile(authError)
    const result = validate({ success: true })
    assert.strictEqual(result, false)
  })

  test('orders error — success 是 true 不是 false', () => {
    const validate = ajv.compile(ordersError)
    const result = validate({ success: true, error: 'msg' })
    assert.strictEqual(result, false)
  })
}

// ═══ Scenario 3: 缺少必填字段 → 报错 ═══
console.log('\n场景 3：缺少必填字段 → required 校验失败')
{
  test('cart/abandon — 缺少 session_id', () => {
    const validate = ajv.compile(cartAbandonSuccess)
    const result = validate({
      success: true,
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    assert.strictEqual(result, false)
    const error = validate.errors?.[0]
    assert.ok(error?.keyword === 'required', `Expected required error, got: ${error?.keyword}`)
  })

  test('cart/abandon — 缺少 id', () => {
    const validate = ajv.compile(cartAbandonSuccess)
    const result = validate({
      success: true,
      session_id: 'abandon_test12345',
    })
    assert.strictEqual(result, false)
  })

  test('orders error — 缺少 error 字段', () => {
    const validate = ajv.compile(ordersError)
    const result = validate({ success: false })
    assert.strictEqual(result, false)
  })
}

// ═══ Scenario 4: 多出未声明字段 → 报错（additionalProperties: false） ═══
console.log('\n场景 4：多出未声明字段 → additionalProperties 校验失败')
{
  test('cart/abandon — 多了 extra_field', () => {
    const validate = ajv.compile(cartAbandonSuccess)
    const result = validate({
      success: true,
      session_id: 'abandon_test12345',
      id: '550e8400-e29b-41d4-a716-446655440000',
      extra_field: 'should not be here',
    })
    assert.strictEqual(result, false)
    const error = validate.errors?.[0]
    assert.ok(
      error?.keyword === 'additionalProperties',
      `Expected additionalProperties error, got: ${error?.keyword}`
    )
  })

  test('auth — 多了 debug_info', () => {
    const validate = ajv.compile(authSuccess)
    const result = validate({ success: true, debug_info: 'leaked' })
    assert.strictEqual(result, false)
  })
}

// ═══ Scenario 5: 数组元素校验 → 嵌套 schema ═══
console.log('\n场景 5：数组元素 schema 校验')
{
  const batchSchema = {
    type: 'object',
    required: ['items', 'total'],
    additionalProperties: false,
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'name', 'price'],
          additionalProperties: false,
          properties: {
            id: { type: 'integer', minimum: 1 },
            name: { type: 'string', minLength: 1 },
            price: { type: 'number', minimum: 0 },
          },
        },
      },
      total: { type: 'number' },
    },
  }

  test('正确数组', () => {
    const validate = ajv.compile(batchSchema)
    assert.ok(validate({
      items: [
        { id: 1, name: 'Starter Kit', price: 19.99 },
        { id: 2, name: 'Pro Kit', price: 34.99 },
      ],
      total: 54.98,
    }))
  })

  test('元素缺少必填字段 name', () => {
    const validate = ajv.compile(batchSchema)
    const result = validate({
      items: [{ id: 1, price: 19.99 }],
      total: 19.99,
    })
    assert.strictEqual(result, false)
  })

  test('元素类型错误 — id 是字符串', () => {
    const validate = ajv.compile(batchSchema)
    const result = validate({
      items: [{ id: 'wrong', name: 'Kit', price: 19.99 }],
      total: 19.99,
    })
    assert.strictEqual(result, false)
  })
}

// ═══ Scenario 6: const 约束 ═══
console.log('\n场景 6：const 约束确保精确常量值')
{
  test('auth success: { success: true }', () => {
    const validate = ajv.compile(authSuccess)
    assert.ok(validate({ success: true }))
  })

  test('auth success: { success: false } 被拒绝', () => {
    const validate = ajv.compile(authSuccess)
    assert.strictEqual(validate({ success: false }), false)
  })

  test('cart/abandon success: { success: "true" } 字符串被拒绝', () => {
    const validate = ajv.compile(cartAbandonSuccess)
    assert.strictEqual(validate({
      success: 'true',
      session_id: 'abandon_test12345',
      id: '550e8400-e29b-41d4-a716-446655440000',
    }), false)
  })
}

// ─── 结果 ───
console.log(`\n${'═'.repeat(50)}`)
console.log(`TOTAL: ${passed + failed} tests  PASSED: ${passed} ${passed === (passed + failed) ? '✅' : '❌'}  FAILED: ${failed}`)
process.exit(failed > 0 ? 1 : 0)
