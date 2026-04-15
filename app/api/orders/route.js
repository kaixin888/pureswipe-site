import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Server-side insertion into orders table
    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          order_id: data.order_id,
          customer_name: data.customer_name,
          email: data.email,
          phone: data.phone,
          amount: data.amount,
          bundle_id: data.bundle_id,
          product_name: data.product_name,
          status: 'Paid',
          shipping_address: data.shipping_address,
          shipping_city: data.shipping_city,
          shipping_state: data.shipping_state,
          shipping_zip: data.shipping_zip,
          shipping_country: data.shipping_country,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Duplicate order' }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Increment usage_count for the discount code used in this order (if any)
    if (data.discount_code) {
      await supabase.rpc('increment_discount_usage', { p_code: data.discount_code.toUpperCase().trim() });
    }

    return NextResponse.json({ success: true, order: order[0] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
