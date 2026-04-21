import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

async function auditImages() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, cover_image');
  
  if (error) {
    console.error(error);
    return;
  }

  const updates = [
    {
      title: '2026 Bathroom Trends',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000'
    },
    {
      title: 'Disposable vs Reusable',
      url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1000'
    },
    {
      title: 'Keep Guest Bathrooms Sparkling',
      url: 'https://images.unsplash.com/photo-1620626011761-9963d7521576?auto=format&fit=crop&q=80&w=1000'
    }
  ];

  for (const update of updates) {
    const post = data.find(p => p.title.includes(update.title));
    if (post) {
      console.log(`Updating ${post.title}...`);
      await supabase.from('posts').update({ cover_image: update.url }).eq('id', post.id);
    }
  }

  // Find other non-bathroom images (heuristic: check for 'food', 'restaurant', etc in URL if possible, or just re-list)
  console.log('Final Audit List:');
  const { data: finalData } = await supabase.from('posts').select('id, title, cover_image');
  console.log(JSON.stringify(finalData, null, 2));
}

auditImages();
