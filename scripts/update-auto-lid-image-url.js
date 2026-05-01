// 更新 site_images + products 表的 Auto-Lid 图片 URL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString:
    'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres',
});

const NEW_URL =
  'https://pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev/products/bundle-auto-lid.png';

(async () => {
  try {
    // 1. site_images — home_bundle_2（Auto-Lid）
    await pool.query(
      `UPDATE site_images SET image_url='${NEW_URL}', alt_text='Clowand Auto-Lid Bundle - Automatic opening mechanism' WHERE slot_key='home_bundle_2'`
    );
    console.log('[OK] site_images.home_bundle_2 updated');

    // 2. products — Auto-Lid 产品
    await pool.query(
      `UPDATE products SET image_url='${NEW_URL}' WHERE id='d00dbb8b-c1fe-4996-9a69-736b1b6cfe5b'`
    );
    console.log('[OK] products.d00dbb8b image_url updated');

    // 验证
    const r1 = await pool.query(
      `SELECT slot_key, image_url FROM site_images WHERE slot_key='home_bundle_2'`
    );
    console.log('\nsite_images:', JSON.stringify(r1.rows[0]));

    const r2 = await pool.query(
      `SELECT id, name, image_url FROM products WHERE id='d00dbb8b-c1fe-4996-9a69-736b1b6cfe5b'`
    );
    console.log('products:', JSON.stringify(r2.rows[0]));

    await pool.end();
    console.log('\n[DONE]');
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
})();
