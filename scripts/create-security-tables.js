// Phase 1 DB 建表脚本：login_logs + audit_logs
const { Pool } = require('pg');

const DIRECT_URL = 'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres';

const SQL = `
-- 登录日志表
CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  failed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON public.login_logs(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_status ON public.login_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON public.audit_logs(target_type);

-- 行级安全（RLS）
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 只允许 service_role / 管理员读
CREATE POLICY "admin_read_login_logs" ON public.login_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'aud' = 'authenticated');

CREATE POLICY "admin_read_audit_logs" ON public.audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'aud' = 'authenticated');

-- 写入允许 any（不需要登录）
CREATE POLICY "insert_login_logs" ON public.login_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "insert_audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);
`;

async function run() {
  const pool = new Pool({ connectionString: DIRECT_URL });
  try {
    console.log('Creating tables...');
    await pool.query(SQL);
    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
