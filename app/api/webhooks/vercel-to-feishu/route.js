import { NextResponse } from 'next/server';
import { sendAlert } from '../../../../lib/monitor';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // 1. Handle Vercel Deployment Events
    // See: https://vercel.com/docs/observability/webhooks-overview
    if (body.type && body.type.startsWith('deployment.')) {
      const { type, payload } = body;
      const isSuccess = type === 'deployment.succeeded';
      const level = isSuccess ? 'P3' : 'P0';
      const title = `Vercel Deployment ${isSuccess ? 'Success' : 'FAILED'}`;
      const message = `Project: ${payload.name || 'clowand'}\n` +
                      `URL: https://${payload.url}\n` +
                      `Branch: ${payload.deployment?.meta?.githubCommitRef || 'unknown'}`;
      
      await sendAlert({ level, title, message });
      return NextResponse.json({ ok: true, source: 'vercel' });
    }

    // 2. Handle Uptime Robot Alerts
    // Custom JSON pattern for Uptime Robot
    if (body.alertTypeFriendlyName || body.monitorFriendlyName) {
      const isDown = body.alertTypeFriendlyName === 'Down';
      const level = isDown ? 'P0' : 'P2';
      const title = `Uptime Monitor: ${body.monitorFriendlyName} is ${body.alertTypeFriendlyName}`;
      const message = `Monitor URL: ${body.monitorURL}\n` +
                      `Details: ${body.alertDetails || 'No additional details'}`;
      
      await sendAlert({ level, title, message });
      return NextResponse.json({ ok: true, source: 'uptimerobot' });
    }

    // 3. Handle Internal Manual Alerts
    // Used by our own server-side catch blocks
    if (body.level && body.title && body.message) {
      await sendAlert({
        level: body.level,
        title: body.title,
        message: body.message,
        evidence: body.evidence
      });
      return NextResponse.json({ ok: true, source: 'internal' });
    }

    // 4. Catch-all for unknown formats
    await sendAlert({
      level: 'P2',
      title: 'Generic Webhook Notification',
      message: 'Received unknown payload format.',
      evidence: JSON.stringify(body, null, 2).substring(0, 1000)
    });

    return NextResponse.json({ ok: true, source: 'generic' });
  } catch (error) {
    console.error('Webhook Proxy Error:', error);
    
    // Attempt to send a critical error alert if the proxy itself fails
    await sendAlert({
      level: 'P0',
      title: 'Webhook Proxy CRASH',
      message: error.message,
      evidence: error.stack
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
