// GDPR 数据清理 — 每月1号 03:00 执行
// 清理 6 个月前的 login_logs + 3 个月前的 audit_logs（含 IP 脱敏）
// Vercel Cron 调用（需 CRON_SECRET 认证）
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK_URL;

async function notifyFeishu(text) {
  try {
    await fetch(FEISHU_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text } }),
    });
  } catch { /* silent */ }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const start = Date.now();
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const results = { login_logs_deleted: 0, audit_logs_deleted: 0 };
  let errorMsg = null;

  try {
    // 1. 删除 6 个月前的登录日志
    const { count: loginCount, error: loginErr } = await supabase
      .from('login_logs')
      .delete()
      .lt('created_at', sixMonthsAgo);

    if (loginErr) throw new Error(`login_logs: ${loginErr.message}`);
    results.login_logs_deleted = loginCount || 0;

    // 2. 删除 3 个月前的审计日志
    const { count: auditCount, error: auditErr } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', threeMonthsAgo);

    if (auditErr) throw new Error(`audit_logs: ${auditErr.message}`);
    results.audit_logs_deleted = auditCount || 0;

  } catch (err) {
    errorMsg = err.message;
  }

  const elapsed = Date.now() - start;
  const icon = errorMsg ? '⚠️' : '🗑️';
  const msg = `${icon} [GDPR Cleanup] ${new Date().toISOString().slice(0, 16)}
Login Logs: ${results.login_logs_deleted} deleted
Audit Logs: ${results.audit_logs_deleted} deleted
Duration: ${elapsed}ms${errorMsg ? `\nError: ${errorMsg}` : ''}`;

  await notifyFeishu(msg);

  if (errorMsg) {
    return NextResponse.json({ ...results, error: errorMsg }, { status: 500 });
  }
  return NextResponse.json(results);
}
