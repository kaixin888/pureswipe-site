const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://olgfqcygqzuevaftmdja.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

const reviews = [
  {
    author_name: 'Sarah Miller',
    author_location: 'Austin, TX',
    rating: 5,
    content: 'Best cleaning tool ever. My bathroom feels like a spa. The zero-touch mechanism is exactly what I needed to stop the gross drip trail.',
    ugc_image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    is_published: true
  },
  {
    author_name: 'John Davis',
    author_location: 'Seattle, WA',
    rating: 5,
    content: 'The 18-inch handle is a back-saver! I can reach every corner of the bowl without bending over or getting splashed.',
    ugc_image_url: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800',
    is_published: true
  },
  {
    author_name: 'Emily Chen',
    author_location: 'San Francisco, CA',
    rating: 5,
    content: 'Super hygienic. I love how the pads just click off. No more storing a dirty brush in the corner. Highly recommend for any modern home.',
    ugc_image_url: 'https://images.unsplash.com/photo-1585421514738-ee1b3bb67ef2?auto=format&fit=crop&q=80&w=800',
    is_published: true
  },
  {
    author_name: 'Michael Brown',
    author_location: 'Chicago, IL',
    rating: 5,
    content: 'Great value. The refill box lasts a long time and actually cleans better than the expensive reusable ones I used to buy.',
    ugc_image_url: 'https://images.unsplash.com/photo-1558317374-067df5f1503c?auto=format&fit=crop&q=80&w=800',
    is_published: true
  },
  {
    author_name: 'Jessica Wilson',
    author_location: 'Miami, FL',
    rating: 5,
    content: 'Modern design and very functional. It looks great in my bathroom and works even better. The scrub pads are very effective.',
    ugc_image_url: 'https://images.unsplash.com/photo-1620627812632-6bc6040a6e3b?auto=format&fit=crop&q=80&w=800',
    is_published: true
  },
  {
    author_name: 'David Garcia',
    author_location: 'Los Angeles, CA',
    rating: 5,
    content: 'No more messy dripping brushes. Cleanest solution found. My wife is happy and so am I. Simple but brilliant.',
    ugc_image_url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800',
    is_published: true
  }
];

async function run() {
  const { data, error } = await supabase.from('reviews').insert(reviews);
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  console.log('Success:', data);
  process.exit(0);
}

run();
