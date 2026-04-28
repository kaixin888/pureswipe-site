// 一键数据库迁移端点
// POST /api/run-migration?secret=clowand888
// 在 Supabase 上创建 inventory 表并插入初始数据
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 用 pg 直接连接 Postgres 执行 DDL
async function runSQL(sql) {
  // 优先用 DATABASE_URL（Vercel + Supabase 集成自动注入）
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (dbUrl) {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: dbUrl, max: 1, idleTimeoutMillis: 5000 });
      try {
        await pool.query(sql);
        return { ok: true };
      } finally {
        await pool.end();
      }
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
  return { ok: false, error: 'No DATABASE_URL available — try Supabase Dashboard or add DATABASE_URL env var' };
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'clowand888') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = [];

  try {
    // Step 1: 创建 inventory 表
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
      RETURNS TRIGGER AS $func$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
      CREATE TRIGGER trg_inventory_updated_at
        BEFORE UPDATE ON inventory
        FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();
    `;

    const createResult = await runSQL(createSQL);
    results.push({ step: 'create_inventory', ...createResult });

    if (!createResult.ok) {
      // 如果 pg 方式失败，尝试用 supabase rpc
      const { error: rpcErr } = await supabaseAdmin.rpc('exec_sql', { sql: createSQL });
      if (!rpcErr) {
        results.push({ step: 'create_inventory_retry', ok: true });
      } else {
        // 检查表是否已存在
        const { data: check } = await supabaseAdmin.from('inventory').select('id').limit(1);
        if (check === null) {
          results.push({ step: 'note', message: '表不存在。请先在 Supabase Dashboard → SQL Editor 执行建表 SQL，或设置 DATABASE_URL 环境变量。' });
        } else {
          results.push({ step: 'check', message: '表已存在' });
        }
      }
    }

    // Step 2: 插入初始数据
    const { data: existingInv } = await supabaseAdmin.from('inventory').select('product_id');
    const existingIds = new Set((existingInv || []).map(r => r.product_id));

    const { data: products } = await supabaseAdmin.from('products').select('id, stock');
    
    if (products) {
      const toInsert = products
        .filter(p => !existingIds.has(p.id))
        .map(p => ({
          product_id: p.id,
          quantity: p.stock || 0,
          low_stock_threshold: 10,
        }));
      
      if (toInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin.from('inventory').insert(toInsert);
        results.push({ step: 'seed_inventory', inserted: toInsert.length, error: insertError?.message || null });
      } else {
        const totalInv = existingInv?.length || 0;
        results.push({ step: 'seed_inventory', message: `无需插入 — 已有 ${totalInv} 条库存记录` });
      }
    }

    return Response.json({ success: true, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message, results }, { status: 500 });
  }
}
