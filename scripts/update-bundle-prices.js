// 更新 Bundle 产品价格/描述（按设计改版方案）
const { Pool } = require('pg');
const pool = new Pool({
  connectionString:
    'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres',
});

(async () => {
  try {
    // 1. Starter Kit — $24.99, 24 Refills, 取消折扣
    await pool.query(
      `UPDATE products SET price=24.99, sale_price=24.99,
       name='Starter Kit \u2014 Wand + Caddy + 24 Refills',
       description='Wand + Caddy + 24 Refills. Everything you need.',
       tag='Start Here', popular=false
       WHERE id='29d845e2-3908-41c6-8e0a-7ebdbed159bc'`
    );
    console.log('[OK] Starter Kit updated');

    // 2. Auto-Lid Bundle — $34.99, ★ BEST VALUE
    await pool.query(
      `UPDATE products SET price=34.99, sale_price=34.99,
       name='Auto-Lid Bundle \u2014 Wand + Caddy + 48 Refills',
       description='Wand + Caddy + Auto-Lid + 48 Refills. Automatically opens when you lift.',
       tag='', popular=true
       WHERE id='d00dbb8b-c1fe-4996-9a69-736b1b6cfe5b'`
    );
    console.log('[OK] Auto-Lid Kit updated');

    // 3. Eco Refill Box — $19.99, 纯耗材
    await pool.query(
      `UPDATE products SET price=19.99, sale_price=19.99,
       name='Eco Refill Box \u2014 48 Refills Only',
       description='48 Refills only. Compatible with all clowand wands.',
       tag='Eco Friendly', popular=false
       WHERE id='1abbad5f-60b7-4e33-bcd0-f27f8887e830'`
    );
    console.log('[OK] Eco Refill updated');

    // 验证
    const { rows } = await pool.query(
      'SELECT id, name, price, sale_price, popular FROM products ORDER BY price'
    );
    console.log('\nVerified:');
    rows.forEach((r) => console.log(`  ${r.name} | $${r.price} | popular=${r.popular}`));

    await pool.end();
    console.log('\n[DONE]');
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
})();
