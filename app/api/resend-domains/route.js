import { NextResponse } from 'next/server';

// Temporary proxy route to fetch Resend domain DNS records from Vercel servers
// Remove after DNS verification is complete
export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });

  const res = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
