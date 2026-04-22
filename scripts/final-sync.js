const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

async function run() {
  // 1. Set sale_price for the first product to test feed/ui
  const { data: products } = await supabase.from('products').select('id, price').limit(1);
  if (products && products.length > 0) {
    const p = products[0];
    const newSalePrice = (Number(p.price) * 0.8).toFixed(2);
    console.log(`Setting product ${p.id} sale_price to ${newSalePrice}`);
    await supabase.from('products').update({ sale_price: newSalePrice }).eq('id', p.id);
  }

  // 2. Update siteSettings hero_title to ensure narrator voice is correct
  console.log('Updating siteSettings hero_title and hero_subtitle...');
  await supabase.from('siteSettings').update({ 
    hero_title: 'The End of the Dirty Toilet Brush.',
    hero_subtitle: 'Never Touch the Mess Again.'
  }).eq('id', 1); // Assuming id 1 is the main settings

  console.log('Done.');
}

run();
