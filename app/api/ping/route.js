import { API_CACHE_HEADERS } from '../../../lib/api-helpers';
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({ ok: true, time: new Date().toISOString() }, { headers: API_CACHE_HEADERS })
}
