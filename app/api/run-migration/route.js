// 一键数据库迁移端点
// 发送 POST 请求到 /api/run-migration?secret=clowand888
// 即可在 Supabase 上创建/更新表结构（使用 SERVICE_ROLE_KEY）
import { createClient } from '@supabase/supabase-js';

// Supabase 管理员客户端（使用 service_role_key 可以执行 DDL）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  // 简单鉴权，防止任意调用
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'clowand888') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = [];

  try {
    // 执行 SQL 迁移：创建 inventory 表（如果不存在）
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
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

        -- 给 inventory 表加上 updated_at 自动更新触发器
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
      `
    });
    results.push({ step: 'create_inventory', error: createError?.message || null });

    // 如果没有 exec_sql 函数，尝试用 raw SQL 方式
    if (createError && createError.message?.includes('function "exec_sql"')) {
      // 通过 REST API 直接执行 SQL — 如果 service_role_key 可用的话
      // 先检查表是否存在
      const { data: tables } = await supabaseAdmin
        .from('inventory')
        .select('id')
        .limit(1);
      
      if (tables === null) {
        // 表不存在 — 无法创建（需要 Supabase dashboard 或者 DB URL）
        results.push({ step: 'note', message: '表不存在且无法通过 REST API 创建。需要 Supabase Dashboard 手动执行 SQL，或者添加 supabase DB URL 到环境变量。' });
      } else {
        results.push({ step: 'check', message: '表已存在，跳过创建' });
      }
    }

    // 插入初始数据（从 products.stock 同步）
    const { data: existing } = await supabaseAdmin
      .from('inventory')
      .select('product_id');
    const existingIds = new Set((existing || []).map(r => r.product_id));

    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, stock');
    
    if (products) {
      const toInsert = products
        .filter(p => !existingIds.has(p.id))
        .map(p => ({
          product_id: p.id,
          quantity: p.stock || 0,
          low_stock_threshold: 10,
        }));
      
      if (toInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('inventory')
          .insert(toInsert);
        results.push({ step: 'seed_inventory', inserted: toInsert.length, error: insertError?.message || null });
      } else {
        results.push({ step: 'seed_inventory', message: '无需插入（已有数据）' });
      }
    }

    return Response.json({ success: true, results });
  } catch (err) {
    return Response.json({ success: false, error: err.message, results }, { status: 500 });
  }
}
