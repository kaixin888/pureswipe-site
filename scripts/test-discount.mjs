import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olgfqcygqzuevaftmdja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDiscountRpc() {
  console.log('Testing increment_discount_usage...');
  const { error } = await supabase.rpc('increment_discount_usage', { p_code: 'CLOWAND10' });
  if (error) {
    console.error('Discount RPC Error:', error);
  } else {
    console.log('Discount RPC Success!');
  }
}

testDiscountRpc();
