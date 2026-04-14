import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  
  if (password === process.env.ADMIN_PASSWORD || password === 'clowand888') {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
}
