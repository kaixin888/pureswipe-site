// 环境诊断端点 — 检查有哪些数据库连接环境变量
// GET /api/diagnose-env?secret=clowand888
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'clowand888') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const relevantKeys = ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING', 'POSTGRES_USER', 'POSTGRES_HOST',
    'POSTGRES_DATABASE', 'DIRECT_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  const envVars = {};
  for (const key of relevantKeys) {
    const val = process.env[key];
    if (val) {
      envVars[key] = val.length > 40 ? val.substring(0, 40) + '...' : val;
    } else {
      envVars[key] = '(not set)';
    }
  }

  return Response.json({
    node: process.version,
    platform: process.platform,
    env: envVars,
    all_keys: Object.keys(process.env)
      .filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('SUPABASE') || k.includes('PG'))
      .sort()
  });
}
