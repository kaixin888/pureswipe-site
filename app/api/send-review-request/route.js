import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function reviewRequestTemplate({ customerName, orderData }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:2px;margin:0;">CLOWAND</h1>
      <p style="color:#60a5fa;font-size:11px;letter-spacing:4px;margin:4px 0 0;">PREMIUM BATHROOM HYGIENE</p>
    </div>
    <div style="background:#1e293b;border-radius:16px;padding:32px;">
      <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
        How's your Clowand experience?
      </h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Hi ${customerName || 'there'}, we hope you're loving your <strong style="color:#fff;">${orderData.product_name || 'Clowand product'}</strong>!
      </p>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your feedback means the world to us and helps other families discover a cleaner, 
        more hygienic bathroom routine. Would you take 60 seconds to leave us a review?
      </p>
      <div style="text-align:center;margin:0 0 24px;">
        <a href="https://search.google.com/local/writereview?placeid=clowand"
          style="display:inline-block;background:#2563eb;color:#ffffff;font-size:12px;font-weight:900;letter-spacing:3px;padding:16px 32px;border-radius:100px;text-decoration:none;margin-bottom:12px;">
          LEAVE A GOOGLE REVIEW &rarr;
        </a>
        <br>
        <a href="https://www.trustpilot.com/review/clowand.com"
          style="display:inline-block;background:#00b67a;color:#ffffff;font-size:12px;font-weight:900;letter-spacing:2px;padding:12px 28px;border-radius:100px;text-decoration:none;margin-top:8px;">
          REVIEW ON TRUSTPILOT
        </a>
      </div>
      <div style="background:#0f172a;border-radius:12px;padding:16px;text-align:center;">
        <p style="color:#64748b;font-size:12px;margin:0 0 8px;">Order Reference</p>
        <p style="color:#60a5fa;font-size:16px;font-weight:700;margin:0;">#${orderData.order_id || 'N/A'}</p>
      </div>
      <div style="margin-top:24px;padding:16px;background:#052e16;border-radius:8px;border-left:4px solid #22c55e;">
        <p style="color:#86efac;font-size:13px;margin:0;">
          &zwj;&#128737;&#65039; <strong>100% Satisfaction Guarantee</strong> &mdash; Any issues? Reply to this email and we'll make it right.
        </p>
      </div>
    </div>
    <p style="color:#475569;font-size:11px;text-align:center;margin-top:24px;">
      Clowand &middot; 123 Clean St, Boston, MA 02108<br>
      <a href="https://clowand.com" style="color:#60a5fa;">clowand.com</a> &middot;
      <a href="mailto:support@clowand.com" style="color:#60a5fa;">support@clowand.com</a>
    </p>
  </div>
</body>
</html>`;
}

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
