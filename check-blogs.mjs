import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

async function checkBlogs() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, cover_image');
  
  if (error) {
    console.error('Error fetching blogs:', error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

checkBlogs();
