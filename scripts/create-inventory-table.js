// 本地执行：创建 inventory 表 + 播种初始数据
// 密码已 URL 编码，直接传给 pg Pool（它会自动解码）
// 用法: node scripts/create-inventory-table.js

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const DIRECT_URL = 'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres';
const SUPABASE_URL = 'https://olgfqcygqzuevaftmdja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  console.log('=== 创建 inventory 表 ===\n');

  const pool = new Pool({ connectionString: DIRECT_URL, max: 1, idleTimeoutMillis: 15000 });

  try {
    // Step 1: Create table
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

    await pool.query(createSQL);
    console.log('✅ 表创建成功');

    // Step 2: Seed from products.stock
    const { data: existing } = await supabase.from('inventory').select('product_id');
    const existingIds = new Set((existing || []).map(r => r.product_id));

    const { data: products } = await supabase.from('products').select('id, name, stock');
    if (products) {
      console.log(`\n📦 共 ${products.length} 个产品，已有 ${existingIds.size} 条库存记录`);

      const toInsert = products
        .filter(p => !existingIds.has(p.id))
        .map(p => ({ product_id: p.id, quantity: p.stock || 0, low_stock_threshold: 10 }));

      if (toInsert.length > 0) {
        const { error: insErr } = await supabase.from('inventory').insert(toInsert);
        if (insErr) {
          console.error('❌ 播种失败:', insErr.message);
        } else {
          console.log(`✅ 成功插入 ${toInsert.length} 条库存记录`);
        }
      } else {
        console.log('✅ 所有产品已有库存记录');
      }
    }

    // Step 3: Verify
    const { data: all } = await supabase.from('inventory').select('product_id, quantity, reserved, low_stock_threshold');
    if (all) {
      const lowStock = all.filter(r => (r.quantity || 0) <= (r.low_stock_threshold || 10));
      console.log(`\n📊 总计: ${all.length} 条库存记录`);
      console.log(`   低库存预警: ${lowStock.length} 个产品`);
    }

    await pool.end();
    console.log('\n✅ 完成');
  } catch (err) {
    console.error('❌ 失败:', err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
})();
