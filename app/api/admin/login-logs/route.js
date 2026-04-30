// 登录日志 API (admin) — 用 service_role key 读取 login_logs，绕过 RLS
// GET /api/admin/login-logs?page=1&pageSize=20
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 获取总数
    const { count, error: countErr } = await supabase
      .from('login_logs')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      return Response.json({ data: [], total: 0, error: countErr.message }, { status: 500 });
    }

    // 获取分页数据
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return Response.json({ data: [], total: 0, error: error.message }, { status: 500 });
    }

    return Response.json({ data: data || [], total: count || 0 });
  } catch (err) {
    return Response.json({ data: [], total: 0, error: err.message }, { status: 500 });
  }
}
