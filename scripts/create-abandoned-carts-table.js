// 创建 abandoned_carts 表脚本
// 直接连接 Supabase PostgreSQL 执行 DDL
const { Pool } = require('pg');

// URL 编码的密码在 connectionString 中会自动解码
const pool = new Pool({
  connectionString: 'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres'
});

const SQL = `
-- 弃单捕获表
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  cart_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'expired')),
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  recovered_at TIMESTAMPTZ
);

-- 加速 cron 查询：按 status + email_sent 过滤
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status_email
  ON public.abandoned_carts (status, email_sent);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_abandoned_carts_updated_at ON public.abandoned_carts;
CREATE TRIGGER set_abandoned_carts_updated_at
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: 允许匿名用户插入（前端捕获弃单）
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_insert_abandoned ON public.abandoned_carts;
CREATE POLICY anon_insert_abandoned ON public.abandoned_carts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- service_role 可读可更新（cron 查询 + 标记已发送）
DROP POLICY IF EXISTS service_read_abandoned ON public.abandoned_carts;
CREATE POLICY service_read_abandoned ON public.abandoned_carts
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS service_update_abandoned ON public.abandoned_carts;
CREATE POLICY service_update_abandoned ON public.abandoned_carts
  FOR UPDATE
  TO service_role
  USING (true);
`;

(async () => {
  try {
    await pool.query(SQL);
    console.log('[OK] abandoned_carts table created successfully');

    // 验证列结构
    const { rows } = await pool.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'abandoned_carts' ORDER BY ordinal_position"
    );
    console.log('\nColumns:');
    rows.forEach(r => console.log('  ' + r.column_name + ' (' + r.data_type + ') ' + (r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL')));

    // 验证 RLS
    const { rows: policies } = await pool.query(
      "SELECT policyname, permissive, cmd, roles FROM pg_policies WHERE tablename = 'abandoned_carts'"
    );
    console.log('\nRLS Policies:');
    policies.forEach(p => console.log('  ' + p.policyname + ' [' + p.cmd + '] roles=' + JSON.stringify(p.roles)));

    await pool.end();
    console.log('\n[DONE]');
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
})();
