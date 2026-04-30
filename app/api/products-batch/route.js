// 批量查询产品名称 — 供库存管理页面使用
// 用法: GET /api/products-batch?ids=id1,id2,id3
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
