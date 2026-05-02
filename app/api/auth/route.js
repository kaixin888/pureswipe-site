import { NextResponse } from 'next/server';
import { wrapContractRoute } from '../../../lib/contract-validator';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

export const POST = wrapContractRoute(async (request) => {
  const { password } = await request.json();
  
  if (password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: true }, { headers: API_CACHE_HEADERS });
  }
  
  return NextResponse.json({ success: false }, {status: 401, headers: API_CACHE_HEADERS });
}, 'auth:POST');
