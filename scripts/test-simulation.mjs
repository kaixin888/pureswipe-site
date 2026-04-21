import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olgfqcygqzuevaftmdja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateFullFlow() {
  console.log('--- Phase 1: Check Current Stock ---');
  const { data: products } = await supabase.from('products').select('id, name, stock');
  const targetProduct = products[0];
  console.log(`Target: ${targetProduct.name}, ID: ${targetProduct.id}, Stock: ${targetProduct.stock}`);

  const testOrderId = `TEST-${Math.random().toString(36).slice(-6).toUpperCase()}`;

  console.log('\n--- Phase 2: Create Pending Order (Step 1) ---');
  const { error: pendingError } = await supabase.from('orders').insert([{
    order_id: testOrderId,
    customer_name: 'Test Runner',
    email: 'test@clowand.com',
    status: 'Pending',
    amount: 19.99,
    product_name: targetProduct.name,
    created_at: new Date().toISOString()
  }]);
  
  if (pendingError) {
    console.error('Pending Order Error:', pendingError);
  } else {
    console.log('Pending Order Created Successfully.');
  }

  console.log('\n--- Phase 3: Simulate Payment Success (Paid) ---');
  // We simulate the logic in api/orders/route.js
  const orderStatus = 'Paid';
  const items = [{ id: targetProduct.id, quantity: 1, name: targetProduct.name }];

  if (orderStatus === 'Paid') {
    console.log('Decrementing stock...');
    // Note: This calls the RPC we just asked the user to fix
    const { error: rpcError } = await supabase.rpc('decrement_product_stock', { 
      p_id: targetProduct.id, 
      p_qty: 1 
    });
    
    if (rpcError) {
      console.error('Stock Decrement Error:', rpcError);
    } else {
      console.log('Stock Decrement Successful.');
    }
  }

  console.log('\n--- Phase 4: Verify Results ---');
  const { data: updatedProducts } = await supabase.from('products').select('stock').eq('id', targetProduct.id).single();
  console.log(`Initial Stock: ${targetProduct.stock}, New Stock: ${updatedProducts.stock}`);
  
  if (updatedProducts.stock === targetProduct.stock - 1) {
    console.log('SUCCESS: Stock correctly decremented.');
  } else if (updatedProducts.stock === targetProduct.stock) {
    console.log('FAILURE: Stock not changed (Expected if SQL function is wrong).');
  } else {
    console.log('FAILURE: Unexpected stock value.');
  }
}

simulateFullFlow();
