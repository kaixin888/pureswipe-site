// 批量查询产品名称 — 供库存管理页面使用
// 用法: GET /api/products-batch?ids=id1,id2,id3
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return Response.json({ products: [] });
  }

  const idList = ids.split(',').filter(Boolean);

  if (idList.length === 0) {
    return Response.json({ products: [] });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .in('id', idList);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ products: data || [] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
