// 库存初始化脚本 — 从 products.stock 同步到 inventory.quantity
// 用法: node scripts/seed-inventory.js
// 前置条件: inventory 表已在 Supabase 中存在（执行过迁移端点或手动建表）

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  console.log('=== 库存初始化脚本 ===\n');

  // 1. 检查 inventory 表是否存在
  const { data: checkTable, error: tableError } = await supabase
    .from('inventory')
    .select('id')
    .limit(1);

  if (tableError && tableError.message?.includes('relation') && tableError.message?.includes('does not exist')) {
    console.error('❌ inventory 表不存在！');
    console.error('请先执行迁移:');
    console.error('   Option 1: 访问 https://clowand.com/api/run-migration?secret=clowand888');
    console.error('   Option 2: 在 Supabase Dashboard SQL Editor 中执行');
    console.error('     CREATE TABLE IF NOT EXISTS inventory (\n       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n       product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,\n       warehouse TEXT DEFAULT \'main\',\n       quantity INTEGER NOT NULL DEFAULT 0,\n       reserved INTEGER NOT NULL DEFAULT 0,\n       low_stock_threshold INTEGER NOT NULL DEFAULT 10,\n       last_restocked_at TIMESTAMPTZ,\n       updated_at TIMESTAMPTZ DEFAULT NOW()\n     );');
    process.exit(1);
  }

  // 2. 获取已有库存记录
  const { data: existing } = await supabase
    .from('inventory')
    .select('product_id');
  const existingIds = new Set((existing || []).map(r => r.product_id));

  // 3. 获取所有产品
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, stock');

  if (prodError) {
    console.error('❌ 获取产品失败:', prodError.message);
    process.exit(1);
  }

  console.log(`📦 共有 ${products.length} 个产品`);
  console.log(`📋 已有库存记录: ${existingIds.size} 条\n`);

  // 4. 插入缺失的库存记录
  const toInsert = products
    .filter(p => !existingIds.has(p.id))
    .map(p => ({
      product_id: p.id,
      quantity: p.stock || 0,
      low_stock_threshold: 10,
    }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('inventory')
      .insert(toInsert);

    if (insertError) {
      console.error('❌ 插入失败:', insertError.message);
      process.exit(1);
    }
    console.log(`✅ 成功插入 ${toInsert.length} 条库存记录`);
  } else {
    console.log('✅ 所有产品已有库存记录，无需操作');
  }

  // 5. 汇总统计
  const { data: allInventory } = await supabase
    .from('inventory')
    .select('product_id, quantity, reserved, low_stock_threshold');

  if (allInventory) {
    const totalQuantity = allInventory.reduce((s, r) => s + (r.quantity || 0), 0);
    const totalReserved = allInventory.reduce((s, r) => s + (r.reserved || 0), 0);
    const lowStock = allInventory.filter(r => (r.quantity || 0) <= (r.low_stock_threshold || 10));
    console.log(`\n📊 统计:`);
    console.log(`   总库存: ${totalQuantity}`);
    console.log(`   已预留: ${totalReserved}`);
    console.log(`   可用:   ${totalQuantity - totalReserved}`);
    console.log(`   低库存: ${lowStock.length} 个产品 ⚠️`);
  }

  console.log('\n✅ 初始化完成');
})();
