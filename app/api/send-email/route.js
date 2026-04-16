import { NextResponse } from 'next/server';

// Email sending via Resend API
// Requires: RESEND_API_KEY in Vercel environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';

async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  return res.json();
}

// Welcome email for new subscribers (exit-intent popup)
function welcomeTemplate(email) {
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
      <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">Welcome! Here's your 10% off.</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Thanks for joining Clowand. Use code below at checkout for 10% off your first order.
      </p>
      <div style="background:#0f172a;border:2px dashed #3b82f6;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
        <p style="color:#94a3b8;font-size:11px;letter-spacing:3px;margin:0 0 8px;">YOUR DISCOUNT CODE</p>
        <p style="color:#60a5fa;font-size:28px;font-weight:900;letter-spacing:4px;margin:0;">CLOWAND10</p>
        <p style="color:#64748b;font-size:11px;margin:8px 0 0;">Valid for 24 hours · One use per customer</p>
      </div>
      <div style="text-align:center;">
        <a href="https://clowand.com/#bundles"
          style="display:inline-block;background:#2563eb;color:#ffffff;font-size:12px;font-weight:900;letter-spacing:3px;padding:16px 32px;border-radius:100px;text-decoration:none;">
          SHOP NOW →
        </a>
      </div>
    </div>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;">
      <p style="color:#475569;font-size:11px;text-align:center;margin:0;">
        Clowand · 123 Clean St, Boston, MA 02108<br>
        <a href="https://clowand.com" style="color:#60a5fa;">clowand.com</a> · 
        <a href="mailto:support@clowand.com" style="color:#60a5fa;">support@clowand.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Shipping notification email
function shippingTemplate({ orderData }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:2px;margin:0;">CLOWAND</h1>
    </div>
    <div style="background:#1e293b;border-radius:16px;padding:32px;">
      <h2 style="color:#60a5fa;font-size:20px;font-weight:700;margin:0 0 8px;">📦 Your order is on its way!</h2>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">
        Hi ${orderData.customer_name || 'there'}, great news — order <strong style="color:#fff;">#${orderData.order_id}</strong> has shipped!
      </p>
      <div style="background:#0f172a;border-radius:12px;padding:20px;margin:0 0 24px;">
        <p style="color:#64748b;font-size:11px;letter-spacing:2px;margin:0 0 12px;">TRACKING INFORMATION</p>
        <p style="color:#ffffff;font-size:14px;margin:0 0 4px;"><strong>${orderData.product_name || 'Clowand Product'}</strong></p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;">Tracking Number:</p>
        <p style="color:#60a5fa;font-size:20px;font-weight:900;letter-spacing:2px;margin:0;">${orderData.tracking_number}</p>
      </div>
      <div style="background:#1e3a5f;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="color:#93c5fd;font-size:13px;margin:0;">
          🚚 <strong>Estimated Delivery:</strong> 7–14 business days<br>
          <span style="font-size:12px;color:#60a5fa;">Use your tracking number at the carrier's website to follow your package.</span>
        </p>
      </div>
      <div style="margin-top:16px;padding:16px;background:#052e16;border-radius:8px;border-left:4px solid #22c55e;">
        <p style="color:#86efac;font-size:13px;margin:0;">
          🛡️ <strong>100% Satisfaction Guarantee</strong> — Any issues? We'll make it right.
        </p>
      </div>
    </div>
    <p style="color:#475569;font-size:11px;text-align:center;margin-top:24px;">
      Questions? Email <a href="mailto:support@clowand.com" style="color:#60a5fa;">support@clowand.com</a>
    </p>
  </div>
</body>
</html>`;
}

// Order confirmation email
function orderConfirmTemplate({ orderData }) {
  const items = orderData.product_name || 'Clowand Product';
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:2px;margin:0;">CLOWAND</h1>
    </div>
    <div style="background:#1e293b;border-radius:16px;padding:32px;">
      <h2 style="color:#22c55e;font-size:20px;font-weight:700;margin:0 0 8px;">✓ Order Confirmed!</h2>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">
        Hi ${orderData.customer_name || 'there'}, your order <strong style="color:#fff;">#${orderData.order_id}</strong> is confirmed.
      </p>
      <div style="background:#0f172a;border-radius:12px;padding:20px;margin:0 0 24px;">
        <p style="color:#64748b;font-size:11px;letter-spacing:2px;margin:0 0 12px;">ORDER DETAILS</p>
        <p style="color:#ffffff;font-size:14px;margin:0 0 8px;"><strong>${items}</strong></p>
        <p style="color:#60a5fa;font-size:18px;font-weight:900;margin:0;">$${Number(orderData.amount).toFixed(2)}</p>
      </div>
      <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
        Your order will ship within 1-2 business days. You'll receive a tracking email once it's on the way.
      </p>
      <div style="margin-top:24px;padding:16px;background:#052e16;border-radius:8px;border-left:4px solid #22c55e;">
        <p style="color:#86efac;font-size:13px;margin:0;">
          🛡️ <strong>100% Satisfaction Guarantee</strong> — If you're not happy, we'll make it right.
        </p>
      </div>
    </div>
    <p style="color:#475569;font-size:11px;text-align:center;margin-top:24px;">
      Questions? Email <a href="mailto:support@clowand.com" style="color:#60a5fa;">support@clowand.com</a>
    </p>
  </div>
</body>
</html>`;
}

export async function POST(request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const { type, email, orderData } = await request.json();

  try {
    let result;
    if (type === 'welcome') {
      result = await sendEmail({
        to: email,
        subject: '🎉 Your 10% off code is here — CLOWAND10',
        html: welcomeTemplate(email),
      });
    } else if (type === 'order_confirmation') {
      result = await sendEmail({
        to: email,
        subject: `Order Confirmed #${orderData?.order_id} — Clowand`,
        html: orderConfirmTemplate({ orderData }),
      });
    } else if (type === 'shipping_notification') {
      result = await sendEmail({
        to: email,
        subject: `Your Clowand order #${orderData?.order_id} has shipped! 📦`,
        html: shippingTemplate({ orderData }),
      });
    } else {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
