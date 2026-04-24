import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendAlert } from '../../../lib/monitor';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

async function trackPurchaseGA4(data) {
  const GA_ID = 'G-JFTMBGD8EM';
  const GA_SECRET = process.env.GA_API_SECRET;
  
  if (!GA_SECRET) {
    console.warn('[GA4] GA_API_SECRET not set, skipping backend purchase tracking');
    return;
  }

  try {
    const payload = {
      client_id: data.client_id || 'server.' + Math.random().toString(36).slice(2),
      events: [{
        name: 'purchase',
        params: {
          transaction_id: data.order_id,
          value: data.amount,
          currency: 'USD',
          coupon: data.discount_code || undefined,
          items: (data.items || []).map(item => ({
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        }
      }]
    };

    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}&api_secret=${GA_SECRET}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('[GA4] Tracking failed:', err.message);
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const orderStatus = data.status || 'Paid';
    
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
          status: orderStatus,
          payment_method: data.payment_method || 'paypal',
          shipping_address: data.shipping_address,
          shipping_city: data.shipping_city,
          shipping_state: data.shipping_state,
          shipping_zip: data.shipping_zip,
          shipping_country: data.shipping_country,
          items: data.items,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Duplicate order' }, { status: 409 });
      }
      
      await sendAlert({
        level: 'P1',
        title: 'Database Error (Order Insert)',
        message: error.message,
        evidence: JSON.stringify({ error, order_id: data.order_id }, null, 2)
      });

      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Logic for successful payment
    if (orderStatus === 'Paid') {
      // 1. GA4 Backend Purchase Tracking
      await trackPurchaseGA4(data);

      // 2. Decrement inventory
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.id) {
            await supabase.rpc('decrement_product_stock', { 
              p_id: item.id, 
              p_quantity: item.quantity || 1 
            });
          }
        }
      }

      // 3. Increment usage_count for the discount code
      if (data.discount_code) {
        await supabase.rpc('increment_discount_usage', { p_code: data.discount_code.toUpperCase().trim() });
      }

      // 4. Send order confirmation email
      if (data.email && process.env.RESEND_API_KEY) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clowand.com';
        fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'order_confirmation', email: data.email, orderData: data }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, order: order[0] });
  } catch (err) {
    await sendAlert({
      level: 'P0',
      title: 'Orders API CRASH',
      message: err.message,
      evidence: err.stack
    });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
