// TOTP 登录验证 API — 登录第二步校验
import { createClient } from '@supabase/supabase-js';
import { verify as verifyToken } from 'otplib';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg5NDcxNywiZXhwIjoyMDkxNDcwNzE3fQ.gDsdXU_FBdxrEiYSAx4pI03prLg_sSHPctQrGjFK4rM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(req) {
  try {
    const { user_id, token } = await req.json();
    if (!user_id || !token) return Response.json({ ok: false, error: 'Missing params' }, { status: 400 });

    // 查询用户的 TOTP secret
    const { data, error } = await supabase
      .from('authenticator_secrets')
      .select('secret, backup_codes, enabled')
      .eq('user_id', user_id)
      .single();

    if (error || !data) return Response.json({ ok: false, error: '2FA not configured' }, { status: 400 });
    if (!data.enabled) return Response.json({ ok: false, error: '2FA not enabled' }, { status: 400 });

    // 检查 backup code
    if (data.backup_codes && data.backup_codes.includes(token)) {
      // 消费 backup code（移除）
      const newCodes = data.backup_codes.filter(c => c !== token);
      await supabase.from('authenticator_secrets').update({ backup_codes: newCodes }).eq('user_id', user_id);
      return Response.json({ ok: true, backup_code_used: true });
    }

    // 验证 TOTP
    const isValid = verifyToken({ token, secret: data.secret });
    if (!isValid) return Response.json({ ok: false, error: 'Invalid verification code' });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
