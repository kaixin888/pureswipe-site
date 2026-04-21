import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { reviewRequestTemplate } from '../../../lib/email-templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

export async function POST(request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const { orderId, email, orderData } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'No email provided' }, { status: 400 });
  }

  try {
    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `How's your Clowand experience? Share your thoughts!`,
        html: reviewRequestTemplate({ customerName: orderData?.customer_name, orderData }),
      }),
    });
    const result = await res.json();
    if (result.error) throw new Error(JSON.stringify(result.error));

    // Mark review_requested_at in Supabase
    if (orderId) {
      await supabase
        .from('orders')
        .update({ review_requested_at: new Date().toISOString() })
        .eq('id', orderId);
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
