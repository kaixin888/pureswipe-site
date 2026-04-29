// 创建 site_images 表 + 播种 15 个预设图片插槽
// 用法: node scripts/create-site-images-table.js

const { Pool } = require('pg');

const DIRECT_URL = 'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres';

(async () => {
  console.log('=== 创建 site_images 表 ===\n');

  const pool = new Pool({ connectionString: DIRECT_URL, max: 1, idleTimeoutMillis: 15000 });

  try {
    // Step 1: Create table
    const createSQL = `
      CREATE TABLE IF NOT EXISTS site_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slot_key TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        page TEXT NOT NULL,
        section TEXT NOT NULL,
        description TEXT,
        image_url TEXT DEFAULT '',
        fallback_color TEXT,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        alt_text TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE OR REPLACE FUNCTION update_site_images_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_site_images_updated_at ON site_images;
      CREATE TRIGGER trg_site_images_updated_at
        BEFORE UPDATE ON site_images
        FOR EACH ROW EXECUTE FUNCTION update_site_images_updated_at();
    `;

    await pool.query(createSQL);
    console.log('✅ 表创建成功');

    // Step 2: Seed 15 preset slots
    const slots = [
      { slot_key: 'home_hero_bg',           label: '首页-Hero-背景图（桌面）',   page: '首页',     section: 'Hero',     w: 1440, h: 810,  desc: '桌面端 Hero 全屏背景' },
      { slot_key: 'home_hero_bg_mobile',     label: '首页-Hero-背景图（移动）',   page: '首页',     section: 'Hero',     w: 390,  h: 844,  desc: '移动端 Hero 背景' },
      { slot_key: 'home_bundle_1',           label: '首页-Bundle-标准套装卡图',   page: '首页',     section: 'Bundle',   w: 400,  h: 400,  desc: '"Starter Kit" 卡片图' },
      { slot_key: 'home_bundle_2',           label: '首页-Bundle-补充装卡图',     page: '首页',     section: 'Bundle',   w: 400,  h: 400,  desc: '"Refill Pack" 卡片图' },
      { slot_key: 'home_bundle_3',           label: '首页-Bundle-套装卡图',       page: '首页',     section: 'Bundle',   w: 400,  h: 400,  desc: '"Ultimate Bundle" 卡片图' },
      { slot_key: 'home_trust_shipping',     label: '首页-信任-Free Shipping',    page: '首页',     section: '信任徽章', w: 80,   h: 80,   desc: '免费配送 icon' },
      { slot_key: 'home_trust_guarantee',    label: '首页-信任-Satisfaction',     page: '首页',     section: '信任徽章', w: 80,   h: 80,   desc: '满意保证 icon' },
      { slot_key: 'home_trust_support',      label: '首页-信任-24/7 Support',     page: '首页',     section: '信任徽章', w: 80,   h: 80,   desc: '客服支持 icon' },
      { slot_key: 'product_default',         label: '产品页-默认主图',            page: '产品页',   section: '主图',     w: 800,  h: 800,  desc: '产品首图' },
      { slot_key: 'blog_default_cover',      label: '博客-默认封面图',            page: '博客',     section: '封面',     w: 1200, h: 600,  desc: '文章封面默认图' },
      { slot_key: 'about_hero',              label: '关于我们-Hero图',            page: '关于我们', section: 'Hero',     w: 1440, h: 600,  desc: 'About 页首图' },
      { slot_key: 'about_team',              label: '关于我们-团队照片',           page: '关于我们', section: '团队',     w: 600,  h: 600,  desc: '创始人/团队照片' },
      { slot_key: 'footer_logo',             label: '全站-Footer-Logo',           page: '全站',     section: 'Footer',   w: 200,  h: 60,   desc: '页脚品牌 Logo' },
      { slot_key: 'cart_empty_illustration', label: '购物车-空车插图',            page: '购物车',   section: '空状态',   w: 300,  h: 300,  desc: '空购物车展示图' },
      { slot_key: 'checkout_trust_badge',    label: '结账-安全支付徽章',          page: '结账',     section: '安全',     w: 120,  h: 40,   desc: '结账页信任标志' },
    ];

    // Upsert: insert if not exists, update description/alt if exists
    for (const s of slots) {
      await pool.query(`
        INSERT INTO site_images (slot_key, label, page, section, description, width, height, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, '')
        ON CONFLICT (slot_key)
        DO UPDATE SET
          label = EXCLUDED.label,
          page = EXCLUDED.page,
          section = EXCLUDED.section,
          description = EXCLUDED.description,
          width = EXCLUDED.width,
          height = EXCLUDED.height
      `, [s.slot_key, s.label, s.page, s.section, s.desc, s.w, s.h]);
    }

    console.log(`✅ 已插入/更新 ${slots.length} 个图片插槽`);

    await pool.end();
    console.log('\n✅ Step 1 完成');
  } catch (err) {
    console.error('❌ 失败:', err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
})();
