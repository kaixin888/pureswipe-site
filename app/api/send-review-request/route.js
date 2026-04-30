import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { reviewRequestTemplate } from '../../../lib/email-templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

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
