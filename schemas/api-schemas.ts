// schemas/api-schemas.ts — 所有 API 的 JSON Schema 注册表
// 每个 entry: { success: <2xx schema>, error: <4xx/5xx schema> }

export interface ApiSchemas {
  success: object
  error?: object
}

export const SCHEMA_REGISTRY: Record<string, ApiSchemas> = {
  // ─── 购物车/弃单 ───
  'cart/abandon:POST': {
    success: {
      type: 'object',
      required: ['success', 'session_id', 'id'],
      additionalProperties: false,
      properties: {
        success: { const: true },
        session_id: { type: 'string', minLength: 8 },
        id: { type: 'string', format: 'uuid-v4' },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 订单 ───
  'orders:POST': {
    success: {
      type: 'object',
      required: ['success', 'order'],
      additionalProperties: false,
      properties: {
        success: { const: true },
        order: { type: 'object' },
      },
    },
    error: {
      type: 'object',
      required: ['success', 'error'],
      additionalProperties: false,
      properties: {
        success: { const: false },
        error: { type: 'string' },
      },
    },
  },

  // ─── Auth ───
  'auth:POST': {
    success: {
      type: 'object',
      required: ['success'],
      additionalProperties: false,
      properties: {
        success: { const: true },
      },
    },
    error: {
      type: 'object',
      required: ['success'],
      additionalProperties: false,
      properties: {
        success: { const: false },
      },
    },
  },

  // ─── 折扣 ───
  'apply-discount:POST': {
    success: {
      type: 'object',
      required: ['valid', 'code', 'discountPercent', 'discount', 'finalTotal'],
      additionalProperties: false,
      properties: {
        valid: { const: true },
        code: { type: 'string' },
        discountPercent: { type: 'number', minimum: 0, maximum: 100 },
        discount: { type: 'string' },
        finalTotal: { type: 'string' },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 支付意图 ───
  'create-payment-intent:POST': {
    success: {
      type: 'object',
      required: ['clientSecret'],
      additionalProperties: false,
      properties: {
        clientSecret: { type: 'string', minLength: 20 },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 邮件 ───
  'send-email:POST': {
    success: {
      type: 'object',
      required: ['success'],
      additionalProperties: false,
      properties: {
        success: { const: true },
        data: { type: 'object' },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── Webhook ───
  'webhooks:POST': {
    success: {
      type: 'object',
      required: ['received'],
      additionalProperties: false,
      properties: {
        received: { const: true },
      },
    },
  },

  // ─── 图片上传（产品图） ───
  'upload-image:POST': {
    success: {
      type: 'object',
      required: ['url', 'originalSize', 'compressedSize', 'savings'],
      additionalProperties: false,
      properties: {
        url: { type: 'string', minLength: 10 },
        originalSize: { type: 'number', minimum: 0 },
        compressedSize: { type: 'number', minimum: 0 },
        savings: { type: 'number' },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 图片上传（站点图） ───
  'upload-site-image:POST': {
    success: {
      type: 'object',
      required: ['url', 'slot_key', 'originalSize', 'compressedSize', 'savings', 'dimensions'],
      additionalProperties: false,
      properties: {
        url: { type: 'string', minLength: 10 },
        slot_key: { type: 'string', minLength: 1 },
        originalSize: { type: 'number', minimum: 0 },
        compressedSize: { type: 'number', minimum: 0 },
        savings: { type: 'number' },
        dimensions: { type: 'string', pattern: '^\\d+x\\d+$' },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 产品批量查询 ───
  'products-batch:GET': {
    success: {
      type: 'object',
      required: ['products'],
      additionalProperties: false,
      properties: {
        products: { type: 'array', items: { type: 'object' } },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 订单追加 ───
  'orders/append:POST': {
    success: {
      type: 'object',
      required: ['success', 'newAmount'],
      additionalProperties: false,
      properties: {
        success: { const: true },
        newAmount: { type: 'string' },
        addedItem: { type: 'object' },
      },
    },
    error: {
      type: 'object',
      required: ['success', 'error'],
      additionalProperties: false,
      properties: {
        success: { const: false },
        error: { type: 'string' },
      },
    },
  },

  // ─── 巡检（健康检查） ───
  'health:GET': {
    success: {
      type: 'object',
      required: ['status', 'checks', 'timestamp'],
      additionalProperties: false,
      properties: {
        status: { enum: ['ok', 'degraded', 'down'] },
        checks: { type: 'object' },
        timestamp: { type: 'string' },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 巡检（全量页面） ───
  'patrol/full:GET': {
    success: {
      type: 'object',
      required: ['summary', 'results', 'timestamp'],
      additionalProperties: false,
      properties: {
        summary: {
          type: 'object',
          required: ['passed', 'failed', 'total'],
          properties: {
            passed: { type: 'integer', minimum: 0 },
            failed: { type: 'integer', minimum: 0 },
            total: { type: 'integer', minimum: 0 },
            totalTimeMs: { type: 'integer', minimum: 0 },
          },
        },
        results: { type: 'array' },
        timestamp: { type: 'string' },
      },
    },
    error: {
      type: 'object',
      required: ['error'],
      additionalProperties: false,
      properties: {
        error: { type: 'string' },
      },
    },
  },

  // ─── 健康检查 ───
  'cron:GET': {
    success: {
      type: 'object',
      required: ['status'],
      additionalProperties: false,
      properties: {
        status: { enum: ['ok', 'degraded', 'error'] },
        timestamp: { type: 'string' },
      },
    },
  },
}
