import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendAlert } from '../../../lib/monitor';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

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
      
      // P1 Alert for DB errors
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
      // 1. Decrement inventory (Hardened Stock logic)
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.id) {
            // Using RPC or raw query to decrement stock safely
            // Note: product id in database might be integer, in cart it might be string
            const productId = item.id;
            if (productId) {
              await supabase.rpc('decrement_product_stock', { 
                p_id: productId, 
                p_quantity: item.quantity || 1 
              });
            }
          }
        }
      } else if (data.bundle_id) {
         // Fallback if full items list not provided
         const productId = data.bundle_id;
         if (productId) {
           await supabase.rpc('decrement_product_stock', { 
             p_id: productId, 
             p_quantity: 1 
           });
         }
      }

      // 2. Increment usage_count for the discount code
      if (data.discount_code) {
        await supabase.rpc('increment_discount_usage', { p_code: data.discount_code.toUpperCase().trim() });
      }

      // 3. Send order confirmation email
      if (data.email && process.env.RESEND_API_KEY) {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://clowand.com'}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'order_confirmation', email: data.email, orderData: data }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, order: order[0] });
  } catch (err) {
    // P0 Alert for unexpected API crashes
    await sendAlert({
      level: 'P0',
      title: 'Orders API CRASH',
      message: err.message,
      evidence: err.stack
    });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
