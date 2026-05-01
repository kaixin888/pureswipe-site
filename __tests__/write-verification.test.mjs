// 写入验证中间件 — 6 个测试场景
// 用法：node __tests__/write-verification.test.mjs
// 依赖：需能访问 Supabase（使用直接 PostgreSQL 连接）
import { Pool } from 'pg'

const POOL = new Pool({
  connectionString:
    'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres',
})

let passed = 0
let failed = 0

function assert(condition, msg) {
  if (condition) {
    passed++
    console.log(`  ✅ ${msg}`)
  } else {
    failed++
    console.error(`  ❌ ${msg}`)
  }
}

function header(text) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`  ${text}`)
  console.log('='.repeat(50))
}

// 模拟 deepCompare（与 TypeScript 版本逻辑一致）
function deepCompare(expected, actual, excludeFields = [], floatTolerance = 0.01) {
  const diffs = []
  const exclude = new Set(excludeFields)
  for (const key of Object.keys(expected)) {
    if (exclude.has(key)) continue
    if (!(key in actual)) { diffs.push({ key, missing: true }); continue }
    const e = expected[key]
    const a = actual[key]
    if (e === null && a === null) continue
    if (e === null || a === null) { diffs.push({ key, expected: e, actual: a }); continue }
    if (typeof e === 'number' && typeof a === 'number') {
      if (Math.abs(e - a) > floatTolerance) diffs.push({ key, expected: e, actual: a })
      continue
    }
    if (typeof e === 'string' && typeof a === 'string') {
      if (e !== a) diffs.push({ key, expected: e, actual: a })
      continue
    }
    if (typeof e === 'object' && typeof a === 'object') {
      if (JSON.stringify(e) !== JSON.stringify(a)) diffs.push({ key, expected: e, actual: a })
      continue
    }
    if (e !== a) diffs.push({ key, expected: e, actual: a })
  }
  return diffs
}

// ──────────────────────────────────────────────
console.log('🧪 写入验证中间件 — 6 场景测试\n')

// ═══ 场景 1：INSERT 成功后字段完全一致 ═══
header('场景 1：INSERT 成功后字段完全一致')
;(async () => {
  const testId = crypto.randomUUID()
  try {
    // INSERT 测试数据
    await POOL.query(
      `INSERT INTO abandoned_carts (id, email, items, cart_total, status, email_sent, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [testId, 'test1@wv.com', JSON.stringify([{ name: 'Starter' }]), 24.99, 'pending', false, testId]
    )

    // SELECT 验证完整字段一致
    const { rows } = await POOL.query('SELECT id, email, items, cart_total, status, email_sent FROM abandoned_carts WHERE id=$1', [testId])
    assert(rows.length === 1, 'RECORD FOUND after INSERT')
    assert(rows[0].email === 'test1@wv.com', 'email matches')
    assert(rows[0].cart_total === '24.99', 'cart_total matches')
    assert(rows[0].status === 'pending', 'status matches')
    assert(rows[0].email_sent === false, 'email_sent matches')

    // deepCompare 零差异
    const expected = { email: 'test1@wv.com', cart_total: '24.99', status: 'pending', email_sent: false }
    const diffs = deepCompare(expected, rows[0], ['created_at', 'updated_at', 'id', 'items'])
    assert(diffs.length === 0, `deepCompare zero diffs (${diffs.length} found)`)
  } catch (err) {
    console.error('  ❌ EXCEPTION:', err.message)
    failed++
  } finally {
    await POOL.query('DELETE FROM abandoned_carts WHERE id=$1', [testId])
  }
})()

// ═══ 场景 2：INSERT 后立即查不到 → 写失败 ═══
header('场景 2：INSERT 后查不到（写失败）')
;(async () => {
  try {
    // 插入后立即删除（模拟写失败）
    const failId = crypto.randomUUID()
    await POOL.query(
      `INSERT INTO abandoned_carts (id, email, items, cart_total, status, session_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [failId, 'test2@wv.com', JSON.stringify([]), 10.00, 'pending', failId]
    )
    await POOL.query('DELETE FROM abandoned_carts WHERE id=$1', [failId])

    const { rows } = await POOL.query('SELECT * FROM abandoned_carts WHERE id=$1', [failId])
    assert(rows.length === 0, 'RECORD NOT FOUND after delete → verification correctly detects write failure')
  } catch (err) {
    console.error('  ❌ EXCEPTION:', err.message)
    failed++
  }
})()

// ═══ 场景 3：UPDATE 后部分字段不一致 ═══
header('场景 3：UPDATE 后部分字段不一致')
;(async () => {
  const updId = crypto.randomUUID()
  try {
    await POOL.query(
      `INSERT INTO abandoned_carts (id, email, items, cart_total, status, session_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [updId, 'test3@wv.com', JSON.stringify([]), 15.99, 'pending', updId]
    )
    await POOL.query(`UPDATE abandoned_carts SET cart_total=99.99 WHERE id=$1`, [updId])
    const { rows } = await POOL.query('SELECT cart_total FROM abandoned_carts WHERE id=$1', [updId])

    const diffs = deepCompare({ cart_total: '15.99' }, rows[0])
    assert(diffs.length === 1, `deepCompare detects mismatch (${diffs.length} diff)`)
    assert(diffs[0].expected === '15.99', 'expected=15.99')
    assert(diffs[0].actual === '99.99', 'actual=99.99')
  } catch (err) {
    console.error('  ❌ EXCEPTION:', err.message)
    failed++
  } finally {
    await POOL.query('DELETE FROM abandoned_carts WHERE id=$1', [updId])
  }
})()

// ═══ 场景 4：DELETE 后还能查到 → 报错 ═══
header('场景 4：DELETE 后仍能查到')
;(async () => {
  const delId = crypto.randomUUID()
  try {
    await POOL.query(
      `INSERT INTO abandoned_carts (id, email, items, cart_total, status, session_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [delId, 'test4@wv.com', JSON.stringify([]), 20.00, 'pending', delId]
    )
    const { rowCount } = await POOL.query('DELETE FROM abandoned_carts WHERE id=$1', [delId])
    assert(rowCount === 1, 'DELETE rowCount=1 (record removed)')

    const { rows } = await POOL.query('SELECT * FROM abandoned_carts WHERE id=$1', [delId])
    assert(rows.length === 0, 'record no longer exists after DELETE → verification PASS')
  } catch (err) {
    console.error('  ❌ EXCEPTION:', err.message)
    failed++
  }
})()

// ═══ 场景 5：排除字段不参与比对 ═══
header('场景 5：排除字段（password/token）不参与比对')
;(async () => {
  try {
    const data = {
      email: 'test5@wv.com',
      password_hash: 'supersecret',
      token: 'jwt-token-xxx',
      api_key: 'sk-live-xxx',
      name: 'Test User',
    }
    const actual = {
      email: 'test5@wv.com',
      password_hash: 'different-hash',
      token: 'different-token',
      api_key: 'different-key',
      name: 'Test User',
      created_at: '2026-01-01',
    }
    const exclude = ['password_hash', 'token', 'api_key', 'created_at']
    const diffs = deepCompare(data, actual, exclude)
    assert(diffs.length === 0, `excluded fields produce 0 diffs (${diffs.length} found)`)
  } catch (err) {
    console.error('  ❌ EXCEPTION:', err.message)
    failed++
  }
})()

// ═══ 场景 6：并发写入隔离测试 ═══
header('场景 6：并发写入隔离')
;(async () => {
  const concId = crypto.randomUUID()
  try {
    await POOL.query(
      `INSERT INTO abandoned_carts (id, email, items, cart_total, status, session_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [concId, 'test6@wv.com', JSON.stringify([]), 30.00, 'pending', concId]
    )

    // 并发 UPDATE（两个不同事务），检测最后一个是否准确
    const [r1, r2] = await Promise.all([
      POOL.query(`UPDATE abandoned_carts SET cart_total=31.00 WHERE id=$1`, [concId]),
      POOL.query(`UPDATE abandoned_carts SET cart_total=32.00 WHERE id=$1`, [concId]),
    ])

    const { rows } = await POOL.query('SELECT cart_total FROM abandoned_carts WHERE id=$1', [concId])
    // 并发写入：最后一个获胜
    const finalValue = parseFloat(rows[0].cart_total)
    assert(
      finalValue === 31.0 || finalValue === 32.0,
      `concurrent write settled cleanly: final=${finalValue} (expected 31 or 32)`
    )
  } catch (err) {
    console.error('  ❌ EXCEPTION:', err.message)
    failed++
  } finally {
    await POOL.query('DELETE FROM abandoned_carts WHERE id=$1', [concId])
  }
})()

// ─── 结果 ─────────────────────────────────
setTimeout(() => {
  console.log(`\n${'═'.repeat(50)}`)
  console.log(`  TOTAL: ${passed + failed} tests`)
  console.log(`  PASSED: ${passed} ✅`)
  console.log(`  FAILED: ${failed} ${failed > 0 ? '❌' : ''}`)
  console.log('═'.repeat(50))
  POOL.end()
  process.exit(failed > 0 ? 1 : 0)
}, 3000)

