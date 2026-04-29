// 审计日志 API — 记录管理后台写操作
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
// ⚠️ 必须使用 service_role key 才能写入 audit_logs（RLS 禁止 anon 写入）
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg5NDcxNywiZXhwIjoyMDkxNDcwNzE3fQ.RDr_UBLAR1bjxRa1pbq7SIeFeUUbMtSu_FwJ6tkIaJY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, action, target_type, target_id, old_values, new_values } = body;

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';

    const { error } = await supabase.from('audit_logs').insert({
      user_id,
      action,
      target_type,
      target_id,
      old_values: old_values || null,
      new_values: new_values || null,
      ip_address: ip,
    });

    if (error) {
      console.error('audit-log insert error:', error);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('audit-log error:', err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
