// 一键数据库迁移端点
// POST /api/run-migration?secret=clowand888
// 在 Supabase 上创建 inventory + subscriptions 表并插入初始数据
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
// 管理员密码全局引用 — 指向 ADMIN_PASSWORD 环境变量
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (secret !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = [];

  try {
    // 直连 Postgres 执行 DDL
    const dbUrl = process.env.SUPABASE_DIRECT_URL;
    let tableCreated = false;

    if (dbUrl) {
      try {
        const pool = new pg.Pool({ connectionString: dbUrl, max: 1, idleTimeoutMillis: 15000 });

        const createSQL = `
          CREATE TABLE IF NOT EXISTS inventory (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            warehouse TEXT DEFAULT 'main',
            quantity INTEGER NOT NULL DEFAULT 0,
            reserved INTEGER NOT NULL DEFAULT 0,
            low_stock_threshold INTEGER NOT NULL DEFAULT 10,
            last_restocked_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE OR REPLACE FUNCTION update_inventory_updated_at()
          RETURNS TRIGGER AS $FUNC$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $FUNC$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
          CREATE TRIGGER trg_inventory_updated_at
            BEFORE UPDATE ON inventory
            FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();

          -- ===== blog posts 分类和标签 =====
          ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cleaning Tips';
          ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

          -- ===== subscriptions 表 =====
          CREATE TABLE IF NOT EXISTS subscriptions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
            frequency TEXT NOT NULL DEFAULT 'every_3_months' CHECK (frequency IN ('every_1_month','every_2_months','every_3_months','every_6_months')),
            next_delivery DATE,
            price DECIMAL(10,2) NOT NULL,
            shipping_address JSONB,
            order_id TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- subscriptions RLS
          ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS "Users view own subscriptions" ON subscriptions;
          DROP POLICY IF EXISTS "Users insert own subscriptions" ON subscriptions;
          DROP POLICY IF EXISTS "Users update own subscriptions" ON subscriptions;
          CREATE POLICY "Users view own subscriptions"
            ON subscriptions FOR SELECT
            USING (user_id = auth.uid());
          CREATE POLICY "Users insert own subscriptions"
            ON subscriptions FOR INSERT
            WITH CHECK (user_id = auth.uid());
          CREATE POLICY "Users update own subscriptions"
            ON subscriptions FOR UPDATE
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());

          DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
          CREATE TRIGGER trg_subscriptions_updated_at
            BEFORE UPDATE ON subscriptions
            FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();
        `;

        await pool.query(createSQL);
        await pool.end();
        tableCreated = true;
        results.push({ step: 'create_inventory', method: 'SUPABASE_DIRECT_URL', ok: true });
      } catch (pgErr) {
        results.push({ step: 'create_inventory', method: 'SUPABASE_DIRECT_URL', ok: false, error: pgErr.message });
      }
    } else {
      results.push({ step: 'create_inventory', error: 'SUPABASE_DIRECT_URL not set' });
    }

    // 播种数据
    if (tableCreated) {
      const { data: existingInv } = await supabaseAdmin.from('inventory').select('product_id');
      const existingIds = new Set((existingInv || []).map(r => r.product_id));

      const { data: products } = await supabaseAdmin.from('products').select('id, stock');
      if (products) {
        const toInsert = products
          .filter(p => !existingIds.has(p.id))
          .map(p => ({ product_id: p.id, quantity: p.stock || 0, low_stock_threshold: 10 }));

        if (toInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin.from('inventory').insert(toInsert);
          results.push({ step: 'seed', inserted: toInsert.length, error: insertError?.message || null });
        } else {
          results.push({ step: 'seed', message: `已有 ${existingInv?.length || 0} 条记录，无需插入` });
        }
      }
    }

    return Response.json({ success: tableCreated, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message, results }, { status: 500 });
  }
}
