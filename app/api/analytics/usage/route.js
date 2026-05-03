// GET /api/analytics/usage — API 用量数据查询端点
// 供 Admin 用量面板调用，返回 api_usage_log 表最近 30 天数据

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { API_CACHE_HEADERS } from '../../../../lib/api-helpers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  // 仅管理员可访问（环境变量保护）
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500, headers: API_CACHE_HEADERS });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('api_usage_log')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: API_CACHE_HEADERS });
    }

    return NextResponse.json(data, { headers: API_CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500, headers: API_CACHE_HEADERS },
    );
  }
}
