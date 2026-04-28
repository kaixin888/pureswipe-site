// 手动执行 Supabase SQL 迁移 — 通过 Supabase Management API
// 需要从 Supabase Dashboard 获取 access_token (Settings → API → anon key → service_role key)
// 使用方式: node scripts/create-inventory-table.js

async function main() {
  const SUPABASE_URL = 'https://olgfqcygqzuevaftmdja.supabase.co';
  // 注意：需要 service_role key 来执行 DDL
  // 可以从 Vercel 环境变量中获取，或者从 Supabase Dashboard → Settings → API → service_role key
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!SERVICE_KEY) {
    console.log('需要设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
    console.log('可以从 Supabase Dashboard → Project Settings → API → service_role key 获取');
    process.exit(1);
  }

  const sql = `
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
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
    CREATE TRIGGER trg_inventory_updated_at
      BEFORE UPDATE ON inventory
      FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();
  `;

  try {
    // 通过 pg client 直连 Postgres 执行 DDL
    // 可用连接串（按优先级）: SUPABASE_DIRECT_URL > DATABASE_URL > POSTGRES_URL
    const DB_URL = process.env.SUPABASE_DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    if (DB_URL) {
      console.log('使用直连 Postgres...');
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: DB_URL, max: 1, idleTimeoutMillis: 15000 });
      await pool.query(sql);
      console.log('✅ 表创建成功');
      await pool.end();
    } else {
      console.log('未检测到数据库连接串');
      console.log('请设置以下任一环境变量:');
      console.log('  SUPABASE_DIRECT_URL — Vercel Supabase 集成自动注入');
      console.log('  DATABASE_URL — Vercel Postgres 标准变量');
      console.log('  POSTGRES_URL — 备用');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ 失败:', err.message);
    process.exit(1);
  }
}

main();
