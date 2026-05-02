// GET /api/patrol/full — P1 全量巡检端点（Vercel Cron 触发）
// 测试 4 页面可达性 + 内容完整性
// 返回 { passed, failed, summary, timestamp }
import { NextResponse } from 'next/server';
import { wrapContractRoute } from '../../../../lib/contract-validator';
import { API_CACHE_HEADERS } from '../../../../lib/api-helpers';

// 巡检每次请求实时执行，禁止静态缓存
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clowand.com';
const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Clowand <support@clowand.com>';
const ALERT_EMAIL = 'qufu345@gmail.com';

// 4 个核心页面检查配置
const PAGE_CHECKS = [
  {
    key: 'home',
    url: `${SITE_URL}/`,
    mustContain: ['clowand', 'toilet'],
    minLength: 2000,
  },
  {
    key: 'product',
    url: `${SITE_URL}/product/refill-heads-12-pack`,
    mustContain: ['refill', 'price', 'add'],
    minLength: 2000,
  },
  {
    key: 'cart',
    url: `${SITE_URL}/cart`,
    mustContain: ['cart', 'checkout'],
    minLength: 800,
  },
  {
    key: 'checkout',
    url: `${SITE_URL}/checkout`,
    mustContain: ['checkout', 'email'],
    minLength: 500,
  },
];

// 发告警邮件（Resend API）
async function sendAlertEmail(results) {
  if (!RESEND_API_KEY) {
    console.error('[patrol] RESEND_API_KEY not configured, alert email skipped');
    return null;
  }
  const failedPages = results.filter(r => !r.passed);
  const subject = `[clowand P1 ALERT] ${failedPages.length} page(s) DOWN`;
  const html = `<h2>Clowand Patrol Alert</h2>
<p><strong>Time:</strong> ${new Date().toISOString()}</p>
<h3>Failed Pages</h3>
<ul>${failedPages.map(f => `<li><strong>${f.key}</strong> (${f.url}): ${f.error}</li>`).join('')}</ul>
<h3>All Results</h3>
<table border="1" cellpadding="6"><tr><th>Page</th><th>URL</th><th>Status</th><th>Time</th></tr>
${results.map(r => `<tr><td>${r.key}</td><td>${r.url}</td><td>${r.passed ? 'PASS' : 'FAIL'}</td><td>${r.timeMs}ms</td></tr>`).join('')}</table>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: ALERT_EMAIL, subject, html }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[patrol] Alert email failed:', err.message);
    return null;
  }
}

async function handler(request) {
  // Vercel Cron auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, {status: 401, headers: API_CACHE_HEADERS });
  }

  const results = [];
  const startTime = Date.now();

  for (const check of PAGE_CHECKS) {
    const pageStart = Date.now();
    try {
      const controller = new AbortController();
      const timeoutFn = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(check.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'clowand-patrol/1.0' },
      });
      clearTimeout(timeoutFn);

      const timeMs = Date.now() - pageStart;
      const text = await res.text();
      const textLower = text.toLowerCase();

      const hasRequired = check.mustContain.every(word =>
        textLower.includes(word.toLowerCase())
      );
      const hasMinLength = text.length >= check.minLength;

      if (res.ok && hasRequired && hasMinLength) {
        results.push({
          key: check.key,
          url: check.url,
          passed: true,
          httpStatus: res.status,
          length: text.length,
          timeMs,
        });
      } else {
        const reasons = [];
        if (!res.ok) reasons.push(`HTTP ${res.status}`);
        if (!hasRequired) reasons.push('Missing required content');
        if (!hasMinLength) reasons.push(`Content too short (${text.length} < ${check.minLength})`);
        results.push({
          key: check.key,
          url: check.url,
          passed: false,
          httpStatus: res.status,
          error: reasons.join('; '),
          timeMs,
        });
      }
    } catch (err) {
      const timeMs = Date.now() - pageStart;
      results.push({
        key: check.key,
        url: check.url,
        passed: false,
        error: err.name === 'AbortError' ? 'Timeout (15s)' : 'Network error',
        timeMs,
      });
    }
  }

  const totalTime = Date.now() - startTime;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  // P0/P1 告警：任一失败立即发邮件
  if (failed > 0) {
    sendAlertEmail(results).catch(e =>
      console.error('[patrol] Alert email error:', e.message)
    );
  }

  return NextResponse.json({
    summary: { passed, failed, total: PAGE_CHECKS.length, totalTimeMs: totalTime },
    results,
    timestamp: new Date().toISOString(),
  });
}

export const GET = wrapContractRoute(handler, null);
