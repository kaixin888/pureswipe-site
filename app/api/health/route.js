import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { wrapContractRoute } from '../../../lib/contract-validator';

// 健康检查必须每次请求实时执行，禁止静态缓存
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function handler() {
  const checks = {};
  let degraded = false;

  checks.supabase = { status: 'pending' };
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing credentials');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, count, error } = await supabase
      .from('products').select('id', { count: 'exact', head: true });
    if (error) throw error;
    checks.supabase = { status: 'ok', productCount: count };
  } catch (err) {
    degraded = true;
    checks.supabase = { status: 'down', error: 'Connection failed' };
  }

  checks.r2 = { status: 'pending' };
  try {
    const r2Endpoint = process.env.R2_ENDPOINT;
    if (!r2Endpoint) {
      checks.r2 = { status: 'degraded', reason: 'Missing credentials' };
    } else {
      const controller = new AbortController();
      const timeoutFn = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(r2Endpoint, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutFn);
        checks.r2 = { status: res.ok ? 'ok' : 'degraded', httpStatus: res.status };
      } catch {
        clearTimeout(timeoutFn);
        checks.r2 = { status: 'down', error: 'Unreachable' };
        degraded = true;
      }
    }
  } catch (err) {
    checks.r2 = { status: 'error', error: 'Internal server error' };
  }

  checks.stripe = { status: 'pending' };
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    checks.stripe = { status: 'down', reason: 'STRIPE_SECRET_KEY not set' };
    degraded = true;
  } else {
    checks.stripe = { status: 'ok', keyType: stripeKey.startsWith('sk_test_') ? 'test' : 'live' };
  }

  checks.paypal = { status: 'pending' };
  const paypalId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  checks.paypal = paypalId ? { status: 'ok' } : { status: 'degraded', reason: 'PAYPAL_CLIENT_ID not set' };

  checks.resend = { status: 'pending' };
  const resendKey = process.env.RESEND_API_KEY;
  checks.resend = resendKey ? { status: 'ok' } : { status: 'degraded', reason: 'RESEND_API_KEY not set' };

  checks.env = {
    nodeEnv: process.env.NODE_ENV || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'local',
  };

  const status = degraded ? 'degraded' : 'ok';
  return NextResponse.json({ status, checks, timestamp: new Date().toISOString() });
}

export const GET = wrapContractRoute(handler, null);
