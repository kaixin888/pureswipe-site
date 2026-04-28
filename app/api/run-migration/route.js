// 一键数据库迁移端点
// POST /api/run-migration?secret=clowand888
// 在 Supabase 上创建 inventory 表并插入初始数据
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'clowand888') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 诊断模式（不执行迁移，只上报环境）
  if (searchParams.get('diagnose') === '1') {
    const envKeys = Object.keys(process.env)
      .filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('SUPABASE') || k.includes('PG'))
      .map(k => ({ key: k, val: process.env[k]?.substring(0, 20) || '(empty)' }));

    return Response.json({
      diagnose: true,
      env: envKeys,
      hints: [
        '如果 DATABASE_URL 为空，需要在 Vercel 项目设置中连接 Supabase',
        '如果已有 Supabase 集成，Vercel 会自动注入 DATABASE_URL / POSTGRES_URL',
        '也可以直接在 Supabase Dashboard → SQL Editor 手动执行建表 SQL'
      ]
    });
  }

  const results = [];

  try {
    // Step 1: Try pg Pool with DATABASE_URL (Vercel Supabase integration auto-injects this)
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
    let tableCreated = false;

    if (dbUrl) {
      try {
        const { default: pg } = await import('pg');
        const pool = new pg.Pool({ connectionString: dbUrl, max: 1, idleTimeoutMillis: 10000 });

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
          RETURNS TRIGGER AS $FUNC_BODY$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $FUNC_BODY$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
          CREATE TRIGGER trg_inventory_updated_at
            BEFORE UPDATE ON inventory
            FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();
        `;

        await pool.query(createSQL);
        await pool.end();
        tableCreated = true;
        results.push({ step: 'create_inventory', method: 'pg_pool', ok: true });
      } catch (pgErr) {
        results.push({ step: 'create_inventory', method: 'pg_pool', ok: false, error: pgErr.message });
      }
    } else {
      results.push({ step: 'create_inventory', note: 'DATABASE_URL not set in environment — cannot use pg Pool' });
    }

    // Step 2: Fallback — try supabase rpc
    if (!tableCreated) {
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
      `;
      const { error: rpcErr } = await supabaseAdmin.rpc('exec_sql', { sql: createSQL });
      if (!rpcErr) {
        tableCreated = true;
        results.push({ step: 'create_inventory_retry', method: 'supabase_rpc', ok: true });
      } else {
        results.push({ step: 'create_inventory_retry', method: 'supabase_rpc', ok: false, error: rpcErr.message });
      }
    }

    // Step 3: Check if table exists now
    if (!tableCreated) {
      const { data: check } = await supabaseAdmin.from('inventory').select('id').limit(1);
      if (check !== null) {
        tableCreated = true;
        results.push({ step: 'check', message: '表已存在（可能是之前创建的）' });
      } else {
        results.push({ step: 'check', message: '表仍不存在。请在 Supabase Dashboard → SQL Editor 执行以下 SQL:\n' + [
          'CREATE TABLE IF NOT EXISTS inventory (',
          '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
          '  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,',
          '  warehouse TEXT DEFAULT \'main\',',
          '  quantity INTEGER NOT NULL DEFAULT 0,',
          '  reserved INTEGER NOT NULL DEFAULT 0,',
          '  low_stock_threshold INTEGER NOT NULL DEFAULT 10,',
          '  last_restocked_at TIMESTAMPTZ,',
          '  updated_at TIMESTAMPTZ DEFAULT NOW()',
          ');'
        ].join('\n') });
      }
    }

    // Step 4: Seed data (only if table exists)
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
          results.push({ step: 'seed_inventory', inserted: toInsert.length, error: insertError?.message || null });
        } else {
          results.push({ step: 'seed_inventory', message: `无需插入 — 已有 ${existingInv?.length || 0} 条记录` });
        }
      }
    }

    return Response.json({ success: tableCreated, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message, results }, { status: 500 });
  }
}
