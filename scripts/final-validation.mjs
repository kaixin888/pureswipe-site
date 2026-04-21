import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olgfqcygqzuevaftmdja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateFinalFlow() {
  console.log('--- FINAL VALIDATION START ---');
  
  // 1. Get initial state
  const { data: products } = await supabase.from('products').select('id, name, stock').limit(1);
  const target = products[0];
  const { data: discount } = await supabase.from('discount_codes').select('code, usage_count').eq('code', 'CLOWAND10').single();
  
  console.log(`Initial: ${target.name} (Stock: ${target.stock}), Discount ${discount.code} (Usage: ${discount.usage_count})`);

  // 2. Simulate Step 1: Pending Order
  const testId = `FINAL-${Math.random().toString(36).slice(-4).toUpperCase()}`;
  const { error: e1 } = await supabase.from('orders').insert([{
    order_id: testId,
    customer_name: 'Final Validator',
    email: 'ops@clowand.com',
    status: 'Pending',
    amount: 29.99,
    product_name: target.name
  }]);
  console.log(e1 ? `Pending Order: FAILED (${e1.message})` : 'Pending Order: OK');

  // 3. Simulate Step 2: Payment Success (RPC)
  // We use the parameter names as defined in the PM's text and my latest code fix
  console.log('Executing RPCs...');
  const { error: e2 } = await supabase.rpc('decrement_product_stock', { p_id: target.id, p_quantity: 1 });
  const { error: e3 } = await supabase.rpc('increment_discount_usage', { p_code: 'CLOWAND10' });
  
  console.log(e2 ? `Stock RPC: FAILED (${e2.message})` : 'Stock RPC: OK');
  console.log(e3 ? `Discount RPC: FAILED (${e3.message})` : 'Discount RPC: OK');

  // 4. Verify Final State
  const { data: pEnd } = await supabase.from('products').select('stock').eq('id', target.id).single();
  const { data: dEnd } = await supabase.from('discount_codes').select('usage_count').eq('code', 'CLOWAND10').single();

  const stockOk = pEnd.stock === target.stock - 1;
  const discountOk = dEnd.usage_count === discount.usage_count + 1;

  console.log('\n--- FINAL VERDICT ---');
  console.log(`Stock: ${target.stock} -> ${pEnd.stock} (${stockOk ? 'PASSED' : 'FAILED'})`);
  console.log(`Discount: ${discount.usage_count} -> ${dEnd.usage_count} (${discountOk ? 'PASSED' : 'FAILED'})`);

  if (stockOk && discountOk) {
    console.log('ALL SYSTEMS NOMINAL. CLOWAND IS READY FOR TRAFFIC.');
  } else {
    console.log('CRITICAL ERROR: SYSTEM INCONSISTENCY DETECTED.');
  }
}

simulateFinalFlow();
