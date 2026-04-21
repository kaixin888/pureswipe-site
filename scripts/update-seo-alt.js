const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://olgfqcygqzuevaftmdja.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

async function updateSEO() {
  await supabase.from('products').update({ alt_text: 'Clowand Toilet Wand Starter Kit with 48 Refills - Wall Mounted Sanitary Cleaning System' }).eq('name', 'Clowand Toilet Wand Starter Kit - Wall Mounted, 48 Refills (White)');
  await supabase.from('products').update({ alt_text: 'Clowand Auto Lid Toilet Brush Kit - Disposable Cleaning System with 48 Refills and Automatic Holder' }).eq('name', 'Clowand Disposable Toilet Brush - 48 Refills Auto Lid Kit');
  console.log('SEO alt_text updated.');
}

updateSEO();
