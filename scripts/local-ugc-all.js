const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://olgfqcygqzuevaftmdja.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

async function run() {
  const { data: reviews } = await supabase.from('reviews').select('id');
  
  for (let i = 0; i < reviews.length; i++) {
    const localUrl = `/images/reviews/amazon-ugc-${(i % 5) + 1}.jpg`;
    await supabase.from('reviews').update({ ugc_image_url: localUrl }).eq('id', reviews[i].id);
  }
  console.log(`✅ Updated all ${reviews.length} reviews with local images.`);
}

run();
