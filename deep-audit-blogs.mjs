import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

async function checkSpecificBlog() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image')
    .eq('slug', 'toilet-hygiene-families-protecting-kids-bathroom-bacteria')
    .single();
  
  if (error) {
    console.error('Error fetching specific blog:', error);
    return;
  }
  console.log('Target Blog Data:', JSON.stringify(data, null, 2));
  
  // Also check if there are ANY other food images in the whole table
  const { data: allPosts } = await supabase.from('posts').select('id, title, slug, cover_image');
  console.log('All Posts (ID, Slug, Image):');
  console.log(JSON.stringify(allPosts, null, 2));
}

checkSpecificBlog();
