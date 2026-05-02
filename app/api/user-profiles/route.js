// 用户管理 API — 列表/创建/更新 user_profiles
import { createClient } from '@supabase/supabase-js';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

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
      return Response.json(data, { headers: API_CACHE_HEADERS });
    }

    const { data, error } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Response.json(data, { headers: API_CACHE_HEADERS });
  } catch (err) {
    return Response.json({ error: err.message }, {status: 500, headers: API_CACHE_HEADERS });
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

    // 2. 直接 INSERT 到 user_profiles（不依赖 trigger，避免时序问题）
    const { error: insertError } = await adminSupabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email,
        display_name: display_name || email,
        role: role || 'operator',
        status: 'active',
      });

    if (insertError) throw new Error(`Profile insert failed: ${insertError.message}`);

    return Response.json({ ok: true, user_id: authData.user.id, email, display_name: display_name || email }, { headers: API_CACHE_HEADERS });
  } catch (err) {
    return Response.json({ error: err.message }, {status: 500, headers: API_CACHE_HEADERS });
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

    return Response.json({ ok: true }, { headers: API_CACHE_HEADERS });
  } catch (err) {
    return Response.json({ error: err.message }, {status: 500, headers: API_CACHE_HEADERS });
  }
}
