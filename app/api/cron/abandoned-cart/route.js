// 弃单挽回 Cron（Vercel Cron Jobs）
// 双源查询：
//   - orders（PayPal 创建的 Pending 订单）
//   - abandoned_carts（前端 exit-intent 捕获的弃单）
// 对符合条件的发送恢复邮件，含 COMEBACK10 折扣码
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { wrapContractRoute } from '../../../../lib/contract-validator';
export const dynamic = 'force-dynamic';
import { abandonedCartTemplate } from '../../../../lib/email-templates';
import { API_CACHE_HEADERS } from '../../../../lib/api-helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK_URL;

// CTR-tested subject lines (rotate to keep open rate high)
const SUBJECTS = [
  'You left something behind, {{name}} 🛒',
  'Still thinking it over? Your cart is waiting',
  '{{name}}, your Clowand kit is one click away',
];

function pickSubject(customerName) {
  const idx = Math.floor(Date.now() / 86400000) % SUBJECTS.length;
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

// 将 abandoned_carts 的 items JSONB 数组转为显示字符串
function formatCartItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) return 'Clowand Cleaning System';
  return items.map((i) => `${i.name || i.id} x${i.quantity || 1}`).join(', ');
}

// 发送恢复邮件并更新标记
async function sendRecoveryEmail({ to, subject, html, table, recordId, orderId }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (response.ok) {
    // 更新发送状态—orders 用 abandoned_email_sent，abandoned_carts 用 email_sent
    const updateField =
      table === 'orders' ? { abandoned_email_sent: true } : { email_sent: true };
    await supabase.from(table).update(updateField).eq('id', recordId);
    return { order_id: orderId, status: 'sent' };
  }

  const errText = await response.text();
  return { order_id: orderId, status: 'failed', error: errText };
}
export const GET = wrapContractRoute(async (request) => {
  // Vercel Cron auth
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (!isVercelCron) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const results = [];
    let sent = 0;
    let failed = 0;

    // === 源1: orders（PayPal Pending 订单） ===
    const { data: abandonedOrders, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending')
      .eq('abandoned_email_sent', false)
      .lt('created_at', oneHourAgo);

    if (ordersErr) throw ordersErr;

    for (const order of abandonedOrders || []) {
      const subject = pickSubject(order.customer_name);
      const html = abandonedCartTemplate({
        customerName: order.customer_name,
        totalAmount: order.amount,
        cartItems: order.product_name,
      });
      try {
        const result = await sendRecoveryEmail({
          to: order.email,
          subject,
          html,
          table: 'orders',
          recordId: order.id,
          orderId: order.order_id || order.id,
        });
        results.push(result);
        if (result.status === 'sent') sent++;
        else failed++;
      } catch (err) {
        results.push({ order_id: order.order_id, status: 'error', error: err.message });
        failed++;
      }
    }

    // === 源2: abandoned_carts（前端捕获） ===
    const { data: abandonedCarts, error: cartsErr } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .eq('email_sent', false)
      .not('email', 'is', null)
      .lt('created_at', oneHourAgo);

    if (cartsErr) throw cartsErr;

    for (const cart of abandonedCarts || []) {
      const subject = pickSubject(null); // abandoned_carts 无 customer_name
      const itemsStr = formatCartItems(cart.items);
      const html = abandonedCartTemplate({
        customerName: cart.email.split('@')[0], // 友好显示：邮箱前缀
        totalAmount: cart.cart_total,
        cartItems: itemsStr,
      });
      try {
        const result = await sendRecoveryEmail({
          to: cart.email,
          subject,
          html,
          table: 'abandoned_carts',
          recordId: cart.id,
          orderId: cart.id,
        });
        results.push(result);
        if (result.status === 'sent') sent++;
        else failed++;
      } catch (err) {
        results.push({ order_id: cart.id, status: 'error', error: err.message });
        failed++;
      }
    }

    const totalProcessed = (abandonedOrders?.length || 0) + (abandonedCarts?.length || 0);

    // Feishu summary
    if (totalProcessed > 0) {
      const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
      await notifyFeishu(
        `🛒 [弃单挽回] ${stamp} UTC\n` +
          `检测: ${totalProcessed} 单 (>1h)\n` +
          `   Orders: ${abandonedOrders?.length || 0}\n` +
          `   AbandonedCarts: ${abandonedCarts?.length || 0}\n` +
          `成功: ${sent} | 失败: ${failed}`
      );
    }

    return NextResponse.json({
      processed: totalProcessed,
      from_orders: abandonedOrders?.length || 0,
      from_abandoned_carts: abandonedCarts?.length || 0,
      sent,
      failed,
      details: results,
    }, { headers: API_CACHE_HEADERS });
  } catch (error) {
    await notifyFeishu(`⚠️ [弃单挽回] Cron 失败: ${error.message}`);
    return NextResponse.json({ error: 'Internal server error' }, {status: 500, headers: API_CACHE_HEADERS });
  }
}, 'cron:GET');
