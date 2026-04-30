// 推荐返佣 API
// GET  /api/referrals?userId=<uuid>           - 获取推荐列表 + 统计
// POST /api/referrals                         - 生成推荐链接 + 折扣码

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

// 生成随机折扣码
function generateCode(prefix = 'REF') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix;
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET - 获取推荐列表 + 统计
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 });
  }

  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const stats = {
    total: referrals?.length || 0,
    pending: referrals?.filter(r => r.status === 'pending').length || 0,
    converted: referrals?.filter(r => r.status === 'converted').length || 0,
    earnings: (referrals?.filter(r => r.status === 'converted').length || 0) * 5
  };

  return Response.json({ referrals, stats, referralLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clowand.com'}?ref=${userId}` });
}

// POST - 创建推荐（生成折扣码）
export async function POST(request) {
  try {
    const { referrer_id, referred_email } = await request.json();
    if (!referrer_id) {
      return Response.json({ error: 'referrer_id is required' }, { status: 400 });
    }

    // 生成两个折扣码
    const codeReferrer = generateCode('REF');
    const codeReferred = generateCode('WEL');

    // 被推荐人折扣码（5 美元，30 天有效）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: err1 } = await supabase.from('discount_codes').insert([{
      code: codeReferrer,
      user_id: referrer_id,
      discount_type: 'fixed',
      discount_value: 5.00,
      used: false,
      expires_at: expiresAt.toISOString()
    }]);

    const { error: err2 } = await supabase.from('discount_codes').insert([{
      code: codeReferred,
      discount_type: 'fixed',
      discount_value: 5.00,
      used: false,
      expires_at: expiresAt.toISOString()
    }]);

    if (err1 || err2) {
      return Response.json({ error: (err1 || err2).message }, { status: 500 });
    }

    // 创建推荐记录
    const { data: referral, error: err3 } = await supabase
      .from('referrals')
      .insert([{
        referrer_id,
        referred_email: referred_email || null,
        discount_code_referrer: codeReferrer,
        discount_code_referred: codeReferred
      }])
      .select()
      .single();

    if (err3) {
      return Response.json({ error: err3.message }, { status: 500 });
    }

    return Response.json({
      referral,
      referralLink: `https://www.clowand.com?ref=${referrer_id}`,
      codes: { referrer: codeReferrer, referred: codeReferred }
    }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - 标记推荐为已转化（被推荐人完成首单后调用）
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { order_id } = await request.json();

    if (!id) {
      return Response.json({ error: 'Referral id is required' }, { status: 400 });
    }

    // 获取推荐记录
    const { data: referral, error: fetchErr } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !referral) {
      return Response.json({ error: 'Referral not found' }, { status: 404 });
    }

    // 更新推荐状态
    const { error: updateErr } = await supabase
      .from('referrals')
      .update({ status: 'converted', order_id: order_id || null })
      .eq('id', id);

    if (updateErr) {
      return Response.json({ error: updateErr.message }, { status: 500 });
    }

    return Response.json({ message: 'Referral converted' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
