// 登录锁定检查 API
// 调用: POST /api/check-lockout { ip }
// 响应: { locked: boolean, remaining_minutes: number }
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg5NDcxNywiZXhwIjoyMDkxNDcwNzE3fQ.gDsdXU_FBdxrEiYSAx4pI03prLg_sSHPctQrGjFK4rM';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req) {
  try {
    const { ip } = await req.json();
    if (!ip) return Response.json({ locked: false });

    // 查询当前 IP 的锁定状态
    const { data } = await supabase
      .from('login_lockouts')
      .select('*')
      .eq('ip_address', ip)
      .single();

    if (!data) return Response.json({ locked: false });

    const now = new Date();

    // 如果锁定期已过，清除记录
    if (data.locked_until && new Date(data.locked_until) < now) {
      await supabase.from('login_lockouts').delete().eq('ip_address', ip);
      return Response.json({ locked: false });
    }

    // 如果仍然在锁定中
    if (data.locked_until && new Date(data.locked_until) > now) {
      const remaining = Math.ceil((new Date(data.locked_until) - now) / 60000);
      return Response.json({ locked: true, remaining_minutes: remaining });
    }

    return Response.json({ locked: false });
  } catch (err) {
    return Response.json({ locked: false });
  }
}

// 记录登录失败并检查锁定
export async function PUT(req) {
  try {
    const { ip } = await req.json();
    if (!ip) return Response.json({ ok: false });

    const now = new Date();
    const { data: existing } = await supabase
      .from('login_lockouts')
      .select('*')
      .eq('ip_address', ip)
      .single();

    if (existing) {
      // 如果已过锁定期，重置
      if (existing.locked_until && new Date(existing.locked_until) < now) {
        await supabase.from('login_lockouts').delete().eq('ip_address', ip);
        // 重新插入
        const { error } = await supabase.from('login_lockouts').insert({
          ip_address: ip,
          failed_attempts: 1,
          last_failed_at: now.toISOString(),
        });
        if (error) console.error('lockout reinsert error:', error);
        return Response.json({ ok: true, locked: false });
      }

      const newAttempts = (existing.failed_attempts || 0) + 1;
      let lockedUntil = null;

      if (newAttempts >= MAX_ATTEMPTS) {
        lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60000).toISOString();
      }

      const { error } = await supabase
        .from('login_lockouts')
        .update({
          failed_attempts: newAttempts,
          locked_until: lockedUntil,
          last_failed_at: now.toISOString(),
        })
        .eq('ip_address', ip);

      if (error) console.error('lockout update error:', error);

      return Response.json({
        ok: true,
        locked: newAttempts >= MAX_ATTEMPTS,
        remaining_minutes: newAttempts >= MAX_ATTEMPTS ? LOCKOUT_MINUTES : 0,
        attempts_left: MAX_ATTEMPTS - newAttempts,
      });
    } else {
      // 首次失败
      const { error } = await supabase.from('login_lockouts').insert({
        ip_address: ip,
        failed_attempts: 1,
        last_failed_at: now.toISOString(),
      });
      if (error) console.error('lockout insert error:', error);
      return Response.json({ ok: true, locked: false, attempts_left: MAX_ATTEMPTS - 1 });
    }
  } catch (err) {
    return Response.json({ ok: false });
  }
}
