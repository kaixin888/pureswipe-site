import { NextResponse } from 'next/server';
import { wrapContractRoute } from '../../../lib/contract-validator';

export const POST = wrapContractRoute(async (request) => {
  const { password } = await request.json();
  
  if (password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
}, 'auth:POST');
