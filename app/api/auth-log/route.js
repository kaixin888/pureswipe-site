// 登录日志 API — 记录登录成功/失败到 login_logs 表
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export async function POST(req) {
  try {
    const { email, status, failed_reason } = await req.json();

    // 获取客户端 IP（Vercel 或 Cloudflare 代理头）
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    const { error } = await supabase.from('login_logs').insert({
      email,
      status,
      failed_reason: failed_reason || null,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (error) {
      console.error('auth-log insert error:', error);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('auth-log error:', err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
