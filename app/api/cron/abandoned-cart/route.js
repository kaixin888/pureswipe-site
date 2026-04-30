import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { abandonedCartTemplate } from '../../../../lib/email-templates';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK_URL;

// CTR-tested subject lines (rotate to keep open rate high; first one wins by default).
const SUBJECTS = [
  'You left something behind, {{name}} 🛒',
  'Still thinking it over? Your cart is waiting',
  '{{name}}, your Clowand kit is one click away',
];

function pickSubject(customerName) {
  const idx = Math.floor(Date.now() / 86400000) % SUBJECTS.length; // daily rotation
  return SUBJECTS[idx].replace('{{name}}', customerName || 'there');
}

async function notifyFeishu(text) {
  if (!FEISHU_WEBHOOK) return;
  try {
    await fetch(FEISHU_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text } }),
    });
  } catch {
    // swallow — webhook failure must never block the cron
  }
}

export async function GET(request) {
  // Vercel Cron auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: abandonedOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending')
      .eq('abandoned_email_sent', false)
      .lt('created_at', oneHourAgo);

    if (error) throw error;

    const results = [];
    let sent = 0;
    let failed = 0;

    for (const order of abandonedOrders) {
      try {
        const subject = pickSubject(order.customer_name);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: order.email,
            subject,
            html: abandonedCartTemplate({
              customerName: order.customer_name,
              totalAmount: order.amount,
              cartItems: order.product_name
            })
          })
        });

        if (response.ok) {
          await supabase
            .from('orders')
            .update({ abandoned_email_sent: true })
            .eq('id', order.id);
          results.push({ order_id: order.order_id, status: 'sent' });
          sent++;
        } else {
          const errText = await response.text();
          results.push({ order_id: order.order_id, status: 'failed', error: errText });
          failed++;
        }
      } catch (err) {
        results.push({ order_id: order.order_id, status: 'error', error: err.message });
        failed++;
      }
    }

    // Feishu summary (silent on zero work to avoid spam).
    if (abandonedOrders.length > 0) {
      const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
      await notifyFeishu(
        `🛒 [弃单挽回] ${stamp} UTC\n` +
        `检测: ${abandonedOrders.length} 单 (>1h Pending)\n` +
        `成功: ${sent} | 失败: ${failed}`
      );
    }

    return NextResponse.json({
      processed: abandonedOrders.length,
      sent,
      failed,
      details: results,
    });
  } catch (error) {
    await notifyFeishu(`⚠️ [弃单挽回] Cron 失败: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
