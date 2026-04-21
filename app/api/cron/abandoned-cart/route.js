import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { abandonedCartTemplate } from '../../../../lib/email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';

export async function GET(request) {
  // Check Vercel Cron Secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Fetch pending orders older than 1 hour that haven't been emailed
    const { data: abandonedOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending')
      .eq('abandoned_email_sent', false)
      .lt('created_at', oneHourAgo);

    if (error) throw error;

    const results = [];
    for (const order of abandonedOrders) {
      try {
        // Send email via Resend
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: order.email,
            subject: 'Wait, you forgot something!',
            html: abandonedCartTemplate({
              customerName: order.customer_name,
              totalAmount: order.amount,
              cartItems: order.product_name
            })
          })
        });

        if (response.ok) {
          // Update order to mark email as sent
          await supabase
            .from('orders')
            .update({ abandoned_email_sent: true })
            .eq('id', order.id);
          results.push({ order_id: order.order_id, status: 'sent' });
        } else {
          results.push({ order_id: order.order_id, status: 'failed', error: await response.text() });
        }
      } catch (err) {
        results.push({ order_id: order.order_id, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({ processed: abandonedOrders.length, details: results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
