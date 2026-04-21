-- 1. 为订单表增加项存储 (JSONB) 和 弃单邮件发送标记
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS abandoned_email_sent BOOLEAN DEFAULT FALSE;

-- 2. 确保索引存在以优化弃单扫描
CREATE INDEX IF NOT EXISTS idx_orders_status_abandoned ON orders (status, abandoned_email_sent) WHERE status = 'Pending';
