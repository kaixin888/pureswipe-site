-- ============================================================
-- P0-E 数据库完整性约束补全迁移
-- clowand v6.6.7 → v6.7.0
-- 时间: 2026-05-02
-- 
-- 新增约束统计:
--   FOREIGN KEY: 3
--   UNIQUE:      5
--   NOT NULL:    10
--   CHECK:       6
--   ─────────────────
--   TOTAL:       24
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 阶段 0：前置诊断（可选，确认无脏数据）
-- ═══════════════════════════════════════════════════════════════

-- DO $$
-- DECLARE
--   dirty_count integer;
-- BEGIN
--   SELECT COUNT(*) INTO dirty_count FROM subscriptions WHERE user_id IS NULL;
--   IF dirty_count > 0 THEN
--     RAISE EXCEPTION 'subscriptions has % rows with NULL user_id — clean before FK', dirty_count;
--   END IF;
-- END $$;

-- ═══════════════════════════════════════════════════════════════
-- 阶段 1: FOREIGN KEY 约束（零锁 NOT VALID → VALIDATE）
-- ═══════════════════════════════════════════════════════════════

-- 1.1 subscriptions.user_id → auth.users(id)
-- 回滚: ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE
  NOT VALID;
ALTER TABLE subscriptions VALIDATE CONSTRAINT subscriptions_user_id_fkey;

-- 1.2 discount_codes.user_id → user_profiles(user_id)
-- 先清理可能存在的孤儿引用
-- DELETE FROM discount_codes WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT user_id FROM user_profiles);
-- 回滚: ALTER TABLE discount_codes DROP CONSTRAINT IF EXISTS discount_codes_user_id_fkey;
ALTER TABLE discount_codes
  ADD CONSTRAINT discount_codes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
  ON DELETE SET NULL
  NOT VALID;
ALTER TABLE discount_codes VALIDATE CONSTRAINT discount_codes_user_id_fkey;

-- 1.3 referrals.referrer_id → auth.users(id)
-- 回滚: ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE referrals
  ADD CONSTRAINT referrals_referrer_id_fkey
  FOREIGN KEY (referrer_id) REFERENCES auth.users(id)
  ON DELETE CASCADE
  NOT VALID;
ALTER TABLE referrals VALIDATE CONSTRAINT referrals_referrer_id_fkey;

-- ═══════════════════════════════════════════════════════════════
-- 阶段 2: UNIQUE 约束（先建索引确保无重复，再添加约束）
-- ═══════════════════════════════════════════════════════════════

-- 2.1 产品名唯一（避免同款差异微调污染）
-- 回滚: ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_key;
-- 先检查重复: SELECT name, COUNT(*) FROM products GROUP BY name HAVING COUNT(*) > 1;
ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);

-- 2.2 每日统计去重（防止 cron 重复插入导致数据失真）
-- 回滚: ALTER TABLE site_stats DROP CONSTRAINT IF EXISTS site_stats_date_key;
-- 先清理重复: DELETE FROM site_stats WHERE id NOT IN (SELECT MIN(id) FROM site_stats GROUP BY date);
ALTER TABLE site_stats ADD CONSTRAINT site_stats_date_key UNIQUE (date);

-- 2.3 库存 (product_id, warehouse) 联合唯一
-- 回滚: ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_product_warehouse_key;
-- 先检查重复: SELECT product_id, warehouse, COUNT(*) FROM inventory GROUP BY product_id, warehouse HAVING COUNT(*) > 1;
ALTER TABLE inventory ADD CONSTRAINT inventory_product_warehouse_key UNIQUE (product_id, warehouse);

-- 2.4 IP 封锁记录去重
-- 回滚: ALTER TABLE login_lockouts DROP CONSTRAINT IF EXISTS login_lockouts_ip_address_key;
-- 先清理重复: DELETE FROM login_lockouts WHERE id NOT IN (SELECT MIN(id) FROM login_lockouts GROUP BY ip_address);
ALTER TABLE login_lockouts ADD CONSTRAINT login_lockouts_ip_address_key UNIQUE (ip_address);

-- 2.5 FAQ 问题去重
-- 回滚: ALTER TABLE faqs DROP CONSTRAINT IF EXISTS faqs_question_key;
-- 先清理重复: DELETE FROM faqs WHERE id NOT IN (SELECT MIN(id) FROM faqs GROUP BY question);
ALTER TABLE faqs ADD CONSTRAINT faqs_question_key UNIQUE (question);

-- ═══════════════════════════════════════════════════════════════
-- 阶段 3: NOT NULL 约束
-- 策略: 先清理 NULL 值，再 ALTER SET NOT NULL
-- ═══════════════════════════════════════════════════════════════

-- 3.1 orders.status — 订单状态必填
-- 回滚: ALTER TABLE orders ALTER COLUMN status DROP NOT NULL;
UPDATE orders SET status = 'pending' WHERE status IS NULL;
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;

-- 3.2 orders.product_name
UPDATE orders SET product_name = 'Unknown Product' WHERE product_name IS NULL;
ALTER TABLE orders ALTER COLUMN product_name SET NOT NULL;

-- 3.3 orders.amount
UPDATE orders SET amount = 0 WHERE amount IS NULL;
ALTER TABLE orders ALTER COLUMN amount SET NOT NULL;

-- 3.4 posts.is_published — 发布状态必须明确
UPDATE posts SET is_published = false WHERE is_published IS NULL;
ALTER TABLE posts ALTER COLUMN is_published SET NOT NULL;
ALTER TABLE posts ALTER COLUMN is_published SET DEFAULT false;

-- 3.5 posts.content — 文章必须有内容
UPDATE posts SET content = '' WHERE content IS NULL;
ALTER TABLE posts ALTER COLUMN content SET NOT NULL;

-- 3.6 site_stats.date — 统计日期必填
ALTER TABLE site_stats ALTER COLUMN date SET NOT NULL;

-- 3.7 abandoned_carts.session_id — 弃单必须有会话 ID
UPDATE abandoned_carts SET session_id = 'legacy_' || id WHERE session_id IS NULL;
ALTER TABLE abandoned_carts ALTER COLUMN session_id SET NOT NULL;

-- 3.8 abandoned_carts.email_sent
ALTER TABLE abandoned_carts ALTER COLUMN email_sent SET NOT NULL;
ALTER TABLE abandoned_carts ALTER COLUMN email_sent SET DEFAULT false;

-- 3.9 discount_codes.max_usage
UPDATE discount_codes SET max_usage = 0 WHERE max_usage IS NULL;
ALTER TABLE discount_codes ALTER COLUMN max_usage SET NOT NULL;
ALTER TABLE discount_codes ALTER COLUMN max_usage SET DEFAULT 0;

-- 3.10 site_images.description — 为了 UI 一致性
UPDATE site_images SET description = '' WHERE description IS NULL;
ALTER TABLE site_images ALTER COLUMN description SET NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- 阶段 4: CHECK 约束
-- ═══════════════════════════════════════════════════════════════

-- 4.1 产品价格必须为正
-- 回滚: ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_positive;
ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price > 0);

-- 4.2 库存数非负
-- 回滚: ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_quantity_nonnegative;
ALTER TABLE inventory ADD CONSTRAINT inventory_quantity_nonnegative CHECK (quantity >= 0);

-- 4.3 预留库存非负
-- 回滚: ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_reserved_nonnegative;
ALTER TABLE inventory ADD CONSTRAINT inventory_reserved_nonnegative CHECK (reserved >= 0);

-- 4.4 低库存阈值非负
-- 回滚: ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_threshold_nonnegative;
ALTER TABLE inventory ADD CONSTRAINT inventory_threshold_nonnegative CHECK (low_stock_threshold >= 0);

-- 4.5 订阅价格为正
-- 回滚: ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_price_positive;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_price_positive CHECK (price > 0);

-- 4.6 折扣值/金额为正
-- 回滚: ALTER TABLE discount_codes DROP CONSTRAINT IF EXISTS discount_codes_value_positive;
ALTER TABLE discount_codes ADD CONSTRAINT discount_codes_value_positive CHECK (discount_value > 0);
