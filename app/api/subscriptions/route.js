// 订阅管理 API
// GET  /api/subscriptions?userId=<uuid>        - 获取用户所有订阅
// POST /api/subscriptions                       - 创建新订阅
// PATCH /api/subscriptions/:id                  - 更新订阅(pause/resume/cancel)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
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
    return Response.json({ error: 'userId is required' }, { status: 400 });
  }

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ subscriptions });
}

// POST - 创建新订阅
export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, product_id, frequency, price, shipping_address } = body;

    if (!user_id || !product_id || !price) {
      return Response.json({ error: 'user_id, product_id, and price are required' }, { status: 400 });
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ subscription: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - 更新订阅（暂停/恢复/取消/改频率）
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return Response.json({ error: 'Subscription id is required' }, { status: 400 });
    }

    const updateData = {};

    // 允许更新的字段
    if (body.status) {
      if (!['active', 'paused', 'cancelled'].includes(body.status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = body.status;
    }
    if (body.frequency) {
      if (!['every_1_month', 'every_2_months', 'every_3_months', 'every_6_months'].includes(body.frequency)) {
        return Response.json({ error: 'Invalid frequency' }, { status: 400 });
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ subscription: data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
