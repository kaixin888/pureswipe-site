import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code || !cartTotal) {
      return NextResponse.json({ error: 'Missing code or cartTotal' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired discount code' }, { status: 404 });
    }

    // Check usage limit
    if (data.max_usage !== null && data.usage_count >= data.max_usage) {
      return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 });
    }

    const discount = (cartTotal * data.discount_percent) / 100;
    const finalTotal = Math.max(0, cartTotal - discount).toFixed(2);

    return NextResponse.json({
      valid: true,
      code: data.code,
      discountPercent: data.discount_percent,
      discount: discount.toFixed(2),
      finalTotal,
    });
  } catch (err) {
    console.error('apply-discount error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
