// 环境诊断端点（完整版，不截断）
// GET /api/diagnose-env?secret=clowand888
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'clowand888') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const relevantKeys = ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING', 'POSTGRES_USER', 'POSTGRES_HOST',
    'POSTGRES_DATABASE', 'DIRECT_URL', 'SUPABASE_DIRECT_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  const envVars = {};
  for (const key of relevantKeys) {
    const val = process.env[key];
    envVars[key] = val || '(not set)';
  }

  return Response.json(envVars);
}
