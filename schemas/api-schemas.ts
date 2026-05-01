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
      required: ['success'],
      additionalProperties: false,
      properties: {
        success: { const: true },
        code: { type: 'string' },
        discount_percent: { type: 'number', minimum: 0, maximum: 100 },
        discounted_amount: { type: 'number', minimum: 0 },
        message: { type: 'string' },
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
