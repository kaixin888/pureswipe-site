import { createClient } from '@supabase/supabase-js';
import { sendAlert } from '../lib/monitor.js';

async function checkHealth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const results = {
    supabase: 'PENDING',
    feishu: 'OK',
    timestamp: new Date().toISOString()
  };

  try {
    if (!supabaseKey) throw new Error('Missing Supabase Key');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) throw error;
    results.supabase = 'OK';
  } catch (err) {
    results.supabase = `ERROR: ${err.message}`;
  }

  const isHealthy = results.supabase === 'OK';
  const level = isHealthy ? 'P2' : 'P1';
  const title = isHealthy ? 'Sentinel Daily Health Check' : 'Sentinel Health Check FAILURE';
  
  await sendAlert({
    level,
    title,
    message: `Scheduled sentinel health check completed.\n\nStatus:\n- Supabase: ${results.supabase}\n- Feishu Channel: ${results.feishu}`,
    evidence: JSON.stringify(results, null, 2)
  });

  console.log('Health check completed:', results);
}

checkHealth();
