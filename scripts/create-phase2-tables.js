// Phase 2 DB 建表脚本
const { Pool } = require('pg');

const DIRECT_URL = 'postgresql://postgres:vP8%23m2L%21k9%2AR4q%24T1z%26W7xY9b2@db.olgfqcygqzuevaftmdja.supabase.co:5432/postgres';

const SQL = `
-- 用户配置文件（扩展 auth.users）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('super_admin', 'admin', 'operator', 'support')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  totp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 登录锁定表
CREATE TABLE IF NOT EXISTS public.login_lockouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 1,
  locked_until TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2FA TOTP 密钥表
CREATE TABLE IF NOT EXISTS public.authenticator_secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会话表
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT,
  device_info TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_login_lockouts_ip ON public.login_lockouts(ip_address);
CREATE INDEX IF NOT EXISTS idx_authenticator_secrets_user ON public.authenticator_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authenticator_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 管理员可读所有用户
CREATE POLICY "admin_read_user_profiles" ON public.user_profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'aud' = 'authenticated');

CREATE POLICY "admin_write_user_profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_update_user_profiles" ON public.user_profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'aud' = 'authenticated');

-- lockouts: anyone can insert (login check), only admin/service_role can read
CREATE POLICY "insert_login_lockouts" ON public.login_lockouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "update_login_lockouts" ON public.login_lockouts
  FOR UPDATE USING (true);

CREATE POLICY "admin_read_login_lockouts" ON public.login_lockouts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- authenticator: only user can read their own
CREATE POLICY "user_read_own_authenticator" ON public.authenticator_secrets
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "user_insert_own_authenticator" ON public.authenticator_secrets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "user_update_own_authenticator" ON public.authenticator_secrets
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- sessions: user can see own, admin sees all
CREATE POLICY "user_read_own_sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "user_insert_own_sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

-- 自动创建管理员 profile 的触发器（注册时）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, role, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'operator', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

async function run() {
  const pool = new Pool({ connectionString: DIRECT_URL });
  try {
    console.log('Creating Phase 2 tables...');
    await pool.query(SQL);
    console.log('Phase 2 tables created successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
