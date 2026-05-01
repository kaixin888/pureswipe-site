// 写入验证配置 — 7 个模型映射
// 每个模型定义：表名、主键、ID提取函数、排除字段、回滚策略
import type { WriteVerificationConfig } from '../lib/write-verification'

export const WRITE_VERIFICATION_MODELS: Record<string, WriteVerificationConfig> = {
  // 1. 用户
  users: {
    table: 'users',
    idField: 'id',
    excludeFields: [
      'password',
      'password_hash',
      'token',
      'secret',
      'encrypted_password',
      'two_factor_secret',
      'recovery_codes',
      'created_at',
      'updated_at',
      'last_login',
    ],
    floatTolerance: 0.01,
    rollbackEnabled: false, // 用户写入不回滚（已认证绑定）
  },

  // 2. 产品
  products: {
    table: 'products',
    idField: 'id',
    excludeFields: ['created_at', 'updated_at'],
    floatTolerance: 0.01,
    rollbackEnabled: true,
  },

  // 3. 订单
  orders: {
    table: 'orders',
    idField: 'id',
    excludeFields: ['created_at', 'updated_at'],
    floatTolerance: 0.01,
    rollbackEnabled: false, // 订单不回滚（涉及支付流水）
  },

  // 4. 订单明细
  order_items: {
    table: 'order_items',
    idField: 'id',
    excludeFields: ['created_at', 'updated_at'],
    floatTolerance: 0.01,
    rollbackEnabled: true,
  },

  // 5. 弃单捕获
  abandoned_carts: {
    table: 'abandoned_carts',
    idField: 'id',
    excludeFields: ['created_at', 'updated_at'],
    floatTolerance: 0.01,
    rollbackEnabled: false, // 弃单数据保留供分析
  },

  // 6. 博客文章
  blog_posts: {
    table: 'blog_posts',
    idField: 'id',
    excludeFields: ['created_at', 'updated_at', 'published_at'],
    floatTolerance: 0.01,
    rollbackEnabled: true,
  },

  // 7. 订阅者
  subscribers: {
    table: 'subscribers',
    idField: 'id',
    excludeFields: ['created_at', 'updated_at'],
    floatTolerance: 0.01,
    rollbackEnabled: false, // 用户自行订阅，不回滚
  },
}

/** 全局排除字段 — 所有模型统一跳过 */
export const GLOBAL_EXCLUDE = new Set([
  'created_at',
  'updated_at',
  'last_login',
])

/** 全局敏感字段 — 永远不参与比对 */
export const SENSITIVE_FIELDS = new Set([
  'password',
  'password_hash',
  'token',
  'secret',
  'api_key',
  'encrypted_password',
  'two_factor_secret',
  'recovery_codes',
  'reset_token',
])

/** 数值字段容差（按表） */
export const NUMERIC_TOLERANCE: Record<string, Record<string, number>> = {
  products: { price: 0.01, sale_price: 0.01 },
  orders: { amount: 0.01, tax: 0.01, shipping: 0.01 },
  abandoned_carts: { cart_total: 0.01 },
}
