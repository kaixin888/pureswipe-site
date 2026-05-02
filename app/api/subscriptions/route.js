// 订阅管理 API
// GET  /api/subscriptions?userId=<uuid>        - 获取用户所有订阅
// POST /api/subscriptions                       - 创建新订阅
// PATCH /api/subscriptions/:id                  - 更新订阅(pause/resume/cancel)

import { createClient } from '@supabase/supabase-js';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

function parseNextDelivery(frequency) {
  const now = new Date();
  let months;
  switch (frequency) {
    case 'every_1_month': months = 1; break;
    case 'every_2_months': months = 2; break;
    case 'every_3_months': months = 3; break;
    case 'every_6_months': months = 6; break;
    default: months = 3;
  }
  const next = new Date(now.setMonth(now.getMonth() + months));
  return next.toISOString().split('T')[0];
}

// GET - 获取用户订阅列表
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return Response.json({ error: 'userId is required' }, {status: 400, headers: API_CACHE_HEADERS });
  }

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, {status: 500, headers: API_CACHE_HEADERS });
  }

  return Response.json({ subscriptions }, { headers: API_CACHE_HEADERS });
}

// POST - 创建新订阅
export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, product_id, frequency, price, shipping_address } = body;

    if (!user_id || !product_id || !price) {
      return Response.json({ error: 'user_id, product_id, and price are required' }, {status: 400, headers: API_CACHE_HEADERS });
    }

    const nextDelivery = parseNextDelivery(frequency || 'every_3_months');

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id,
        product_id,
        frequency: frequency || 'every_3_months',
        price,
        next_delivery: nextDelivery,
        shipping_address: shipping_address || null,
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, {status: 500, headers: API_CACHE_HEADERS });
    }

    return Response.json({ subscription: data }, {status: 201, headers: API_CACHE_HEADERS });
  } catch (err) {
    return Response.json({ error: err.message }, {status: 500, headers: API_CACHE_HEADERS });
  }
}

// PATCH - 更新订阅（暂停/恢复/取消/改频率）
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return Response.json({ error: 'Subscription id is required' }, {status: 400, headers: API_CACHE_HEADERS });
    }

    const updateData = {};

    // 允许更新的字段
    if (body.status) {
      if (!['active', 'paused', 'cancelled'].includes(body.status)) {
        return Response.json({ error: 'Invalid status' }, {status: 400, headers: API_CACHE_HEADERS });
      }
      updateData.status = body.status;
    }
    if (body.frequency) {
      if (!['every_1_month', 'every_2_months', 'every_3_months', 'every_6_months'].includes(body.frequency)) {
        return Response.json({ error: 'Invalid frequency' }, {status: 400, headers: API_CACHE_HEADERS });
      }
      updateData.frequency = body.frequency;
      updateData.next_delivery = parseNextDelivery(body.frequency);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, {status: 500, headers: API_CACHE_HEADERS });
    }

    return Response.json({ subscription: data }, { headers: API_CACHE_HEADERS });
  } catch (err) {
    return Response.json({ error: err.message }, {status: 500, headers: API_CACHE_HEADERS });
  }
}
