// 用户管理 API — 列表/创建/更新 user_profiles
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// 管理员 key（有 service_role 权限）
const adminSupabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (userId) {
      const { data, error } = await adminSupabase.from('user_profiles').select('*').eq('user_id', userId).single();
      if (error) throw error;
      return Response.json(data);
    }

    const { data, error } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, display_name, role } = body;

    // 1. 用 service_role 创建 auth user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: display_name || email },
    });
    if (authError) throw new Error(`Auth create failed: ${authError.message}`);

    // 2. user_profiles 由触发器自动创建，但我们需要覆写 role
    const { error: profileError } = await adminSupabase
      .from('user_profiles')
      .update({ display_name: display_name || email, role: role || 'operator', status: 'active' })
      .eq('user_id', authData.user.id);

    if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);

    return Response.json({ ok: true, user_id: authData.user.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { user_id, ...updates } = body;

    // 限制可更新字段
    const allowed = {};
    if (updates.display_name !== undefined) allowed.display_name = updates.display_name;
    if (updates.role !== undefined) allowed.role = updates.role;
    if (updates.status !== undefined) allowed.status = updates.status;
    allowed.updated_at = new Date().toISOString();

    const { error } = await adminSupabase.from('user_profiles').update(allowed).eq('user_id', user_id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
