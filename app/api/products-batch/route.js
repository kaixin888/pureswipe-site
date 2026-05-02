// 批量查询产品名称 — 供库存管理页面使用
// 用法: GET /api/products-batch?ids=id1,id2,id3
import { createClient } from '@supabase/supabase-js';
import { composeDecorators, rateLimit } from '../../../lib/decorators/index';
import { wrapContractRoute } from '../../../lib/contract-validator';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const GET = wrapContractRoute(
  composeDecorators(rateLimit(60, 60000))(async (request) => {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return Response.json({ products: [] }, { headers: API_CACHE_HEADERS });
    }

    const idList = ids.split(',').filter(Boolean);

    if (idList.length > 50) {
      return Response.json({ error: 'Maximum 50 IDs allowed' }, {status: 400, headers: API_CACHE_HEADERS });
    }

    if (idList.length === 0) {
      return Response.json({ products: [] }, { headers: API_CACHE_HEADERS });
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .in('id', idList);

      if (error) {
        return Response.json({ error: 'Internal server error' }, {status: 500, headers: API_CACHE_HEADERS });
      }

      return Response.json({ products: data || [] }, { headers: API_CACHE_HEADERS });
    } catch (err) {
      return Response.json({ error: 'Internal server error' }, {status: 500, headers: API_CACHE_HEADERS });
    }
  }),
  'products-batch:GET'
);

