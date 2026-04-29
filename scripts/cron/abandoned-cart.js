/**
 * 弃单自动恢复脚本 — Accio 定时任务直接执行
 * 
 * 功能：
 * 1. 查询 orders 表中超过 1h 的 Pending 订单
 * 2. 发送弃单挽回邮件（含 COMEBACK10 折扣码）
 * 3. 标记 abandoned_email_sent = true
 * 
 * 调用方式：node scripts/cron/abandoned-cart.js
 * 计划时间：每日 09:00 / 14:00 / 19:00 / 23:00（北京时间）
 * 
 * 注意：本脚本使用 ipify.org 作为网络连通性检测（GFW 可能阻断），
 *       如果 await fetch('https://api.ipify.org') 超时则跳过执行。
 *       本地网络不通畅时不执行，避免 Supabase 连接池耗尽。
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg5NDcxNywiZXhwIjoyMDkxNDcwNzE3fQ.RDr_UBLAR1bjxRa1pbq7SIeFeUUbMtSu_FwJ6tkIaJY';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_8JmtiyB3_FQP5kwscM1qC7Gpwp2c3uRis';
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK_URL || 'https://open.feishu.cn/open-apis/bot/v2/hook/30ce9bd2-1eac-4dd5-a7d2-23c1fbcf1096';

const FROM_EMAIL = 'Clowand <support@clowand.com>';

const SUBJECTS = [
  'You left something behind, {{name}} 🛒',
  'Still thinking it over? Your cart is waiting',
  '{{name}}, your Clowand kit is one click away',
];

function pickSubject(customerName) {
  const idx = Math.floor(Date.now() / 86400000) % SUBJECTS.length;
  return SUBJECTS[idx].replace('{{name}}', customerName || 'there');
}

/** 网络连通性检查 — GFW 阻断时跳过执行 */
async function checkConnectivity() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    console.log('[abandoned-cart] ⚠️ 网络不可达（GFW 阻断），跳过本次执行');
    return false;
  }
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
    // swallow
  }
}

async function run() {
  console.log(`[abandoned-cart] 🕐 ${new Date().toISOString()} — 开始弃单检测`);

  // Step 1: 网络检查
  const online = await checkConnectivity();
  if (!online) {
    console.log('[abandoned-cart] ❌ 网络不可用，退出');
    return;
  }

  // Step 2: 连接 Supabase
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: abandonedOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending')
      .eq('abandoned_email_sent', false)
      .lt('created_at', oneHourAgo);

    if (error) throw error;

    console.log(`[abandoned-cart] 📦 找到 ${abandonedOrders.length} 个弃单`);

    let sent = 0;
    let failed = 0;

    for (const order of abandonedOrders) {
      try {
        const subject = pickSubject(order.customer_name);

        // 构建 HTML 邮件
        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:40px 20px">
      <table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#1a3a5c;padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:-0.5px">clowand</h1>
        </td></tr>
        <tr><td style="padding:40px 32px">
          <h2 style="color:#1a3a5c;font-size:20px;margin:0 0 12px">Hey ${order.customer_name || 'there'},</h2>
          <p style="color:#555;font-size:15px;line-height:1.6">You left something in your cart — and it's still waiting for you.</p>
          <table width="100%" style="margin:24px 0;background:#f5f7fa;border-radius:12px;padding:20px">
            <tr><td style="text-align:center">
              <p style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Your Order</p>
              <p style="color:#1a3a5c;font-size:18px;font-weight:bold;margin:0">${order.product_name || 'Clowand Toilet Cleaning System'}</p>
              <p style="color:#2ecc71;font-size:24px;font-weight:bold;margin:8px 0 0">$${order.amount || '—'}</p>
            </td></tr>
          </table>
          <table width="100%" style="background:#fff7e6;border:1px solid #ffd591;border-radius:12px;padding:16px;margin:16px 0">
            <tr><td style="text-align:center">
              <p style="color:#d48806;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">🎁 Your Personal Discount</p>
              <p style="color:#1a3a5c;font-size:28px;font-weight:bold;margin:0;letter-spacing:4px">COMEBACK10</p>
              <p style="color:#999;font-size:12px;margin:4px 0 0">10% OFF — Valid for 72 hours</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="text-align:center;padding:8px 0">
              <a href="https://clowand.com/checkout?coupon=COMEBACK10" 
                 style="display:inline-block;background:#2ecc71;color:#fff;text-decoration:none;
                        padding:16px 48px;border-radius:50px;font-size:14px;font-weight:bold">
                → Complete Your Order
              </a>
            </td></tr>
          </table>
          <p style="color:#aaa;font-size:12px;text-align:center;margin:24px 0 0">
            Questions? Reply to this email or contact support@clowand.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: order.email,
            subject,
            html: emailHtml,
          }),
        });

        if (response.ok) {
          await supabase
            .from('orders')
            .update({ abandoned_email_sent: true })
            .eq('id', order.id);
          console.log(`[abandoned-cart] ✅ 已发送: ${order.email}`);
          sent++;
        } else {
          const errText = await response.text();
          console.error(`[abandoned-cart] ❌ 发送失败 ${order.email}: ${errText}`);
          failed++;
        }
      } catch (err) {
        console.error(`[abandoned-cart] ❌ 错误 ${order.email}: ${err.message}`);
        failed++;
      }
    }

    // 通知飞书（有数据时才通知）
    if (abandonedOrders.length > 0) {
      const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
      await notifyFeishu(
        `🛒 [弃单挽回] ${stamp} UTC\n` +
        `检测: ${abandonedOrders.length} 单 (>1h Pending)\n` +
        `成功: ${sent} | 失败: ${failed}`
      );
    }

    console.log(`[abandoned-cart] ✅ 完成 — 处理 ${abandonedOrders.length} 单，成功 ${sent}，失败 ${failed}`);
    process.exit(0);
  } catch (error) {
    console.error(`[abandoned-cart] 💥 执行失败: ${error.message}`);
    await notifyFeishu(`⚠️ [弃单挽回] 执行失败: ${error.message}`);
    process.exit(1);
  }
}

run();
