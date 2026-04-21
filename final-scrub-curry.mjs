import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

async function finalScrub() {
  console.log('Starting final blog image scrub...');

  const mappings = [
    {
      slug: 'toilet-hygiene-families-protecting-kids-bathroom-bacteria',
      url: 'https://images.unsplash.com/photo-1648215533140-5a76e010839a?auto=format&fit=crop&q=80&w=1200'
    },
    {
      slug: 'hidden-dangers-of-dirty-toilet-brush',
      url: 'https://images.unsplash.com/photo-1584622781867-1c5fe959a1e3?auto=format&fit=crop&q=80&w=1200'
    },
    {
      slug: '5-tips-hotel-clean-bathroom',
      url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=1200'
    }
  ];

  for (const map of mappings) {
    const { data, error } = await supabase
      .from('posts')
      .update({ cover_image: map.url })
      .eq('slug', map.slug);
    
    if (error) {
      console.error(`Failed to update ${map.slug}:`, error);
    } else {
      console.log(`Successfully updated ${map.slug} with new verified bathroom image.`);
    }
  }

  // Double check the specific post content again for any sneaky <img> tags I missed
  const { data: post } = await supabase
    .from('posts')
    .select('content')
    .eq('slug', 'toilet-hygiene-families-protecting-kids-bathroom-bacteria')
    .single();
  
  if (post && post.content.includes('<img')) {
    console.log('WARNING: Inline <img> tag found in content. Scrubbing...');
    const newContent = post.content.replace(/<img[^>]*>/g, '');
    await supabase.from('posts').update({ content: newContent }).eq('slug', 'toilet-hygiene-families-protecting-kids-bathroom-bacteria');
  }

  console.log('Scrub complete.');
}

finalScrub();
