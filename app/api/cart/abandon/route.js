// POST /api/cart/abandon — 前端弃单捕获接口 (P0 写入验证)
// 接收购物车数据写入 abandoned_carts 表，供 cron 发送恢复邮件
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyWrite } from '../../../../lib/write-verification';
import { wrapContractRoute } from '../../../../lib/contract-validator';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

export const POST = wrapContractRoute(async (request) => {
  try {
    const body = await request.json();
    const { items, cart_total, email, coupon_code } = body;

    // 校验：必须有购物车数据
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }

    // 生成 session_id（用于去重）
    const session_id =
      body.session_id ||
      `abandon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const insertData = {
      email: email || null,
      items,
      cart_total: parseFloat(cart_total) || 0,
      coupon_code: coupon_code || null,
      session_id,
    };

    const { data: inserted, error } = await supabase
      .from('abandoned_carts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[abandon] insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // P0 写入验证：INSERT 后重读逐字段比对
    const verifyResult = await verifyWrite(
      supabase,
      'abandoned_carts',
      inserted.id,
      insertData
    );

    if (!verifyResult.passed) {
      console.error('[abandon] WRITE VERIFICATION FAILED:', verifyResult.message, verifyResult.details);
      // 回滚：删除刚写入但验证失败的记录
      await supabase.from('abandoned_carts').delete().eq('id', inserted.id);
      return NextResponse.json(
        { error: 'Write verification failed', debug: verifyResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, session_id, id: inserted.id });
  } catch (err) {
    console.error('[abandon] parse error:', err.message);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}, 'cart/abandon:POST');
