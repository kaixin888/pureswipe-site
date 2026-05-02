import { NextResponse } from 'next/server';
import { welcomeTemplate, orderConfirmTemplate, shippingTemplate } from '../../../lib/email-templates';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

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

export async function POST(request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, {status: 500, headers: API_CACHE_HEADERS });
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
      return NextResponse.json({ error: 'Unknown email type' }, {status: 400, headers: API_CACHE_HEADERS });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, {status: 500, headers: API_CACHE_HEADERS });
    }
    return NextResponse.json({ success: true, id: result.id }, { headers: API_CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, {status: 500, headers: API_CACHE_HEADERS });
  }
}
