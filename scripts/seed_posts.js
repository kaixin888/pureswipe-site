const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://olgfqcygqzuevaftmdja.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

const posts = [
  {
    title: 'The Dirty Truth: Why Your Traditional Toilet Brush is a Biohazard',
    slug: 'traditional-toilet-brush-biohazard-danger',
    excerpt: 'Think your toilet is clean? Think again. We explore the microscopic world of the traditional toilet brush and why it might be the most dangerous item in your bathroom.',
    content: `## The Microscopic Reality

Every time you use a traditional toilet brush, you are essentially creating a petri dish of fecal bacteria, E. coli, and staphylococcus. The damp bristles and the dark, moist holder provide the perfect breeding ground for pathogens that can survive for weeks.

### The "Drip" Problem

When you move a wet brush from the bowl to the holder, you create a trail of bacteria-laden water. This moisture sits at the bottom of the cup, creating a stagnant pool of filth that off-gasses every time you enter the room.

### Why Clowand is Different

Clowand eliminates the need for a permanent brush. Our disposable heads are used once and flushed (or disposed of), meaning zero bacteria stays in your bathroom. It is the end of the dirty toilet brush era.`,
    cover_image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=1200',
    is_published: true,
    published_at: new Date().toISOString()
  },
  {
    title: 'The 18-Inch Revolution: Engineering the Perfect Clean',
    slug: '18-inch-ergonomic-toilet-cleaning-revolution',
    excerpt: 'Cleaning the toilet shouldn’t be a workout or a splash hazard. Discover how Clowand’s 18-inch ergonomic handle was designed for the ultimate reach and safety.',
    content: `## Reach Without the Risk

Most toilet brushes are too short, forcing you to get uncomfortably close to the splash zone. Our engineers spent months testing prototypes to find the "Golden Ratio" of bathroom cleaning: 18 inches.

### Ergonomics Meets Hygiene

The curved handle isn’t just for looks. It allows you to reach deep into the U-bend and under the rim without putting strain on your wrist or back. 

### Splash Protection

By keeping your hands nearly two feet away from the water, we significantly reduce the risk of aerosolized bacteria coming into contact with your skin or clothing. It is precision engineering for a task no one likes, but everyone needs done right.`,
    cover_image: 'https://images.unsplash.com/photo-1620627812632-6bc6040a6e3b?auto=format&fit=crop&q=80&w=1200',
    is_published: true,
    published_at: new Date().toISOString()
  },
  {
    title: 'Disposable vs. Traditional: The Ultimate Bathroom Showdown',
    slug: 'disposable-vs-traditional-toilet-brush-comparison',
    excerpt: 'Is the convenience of disposable cleaning worth the switch? We break down the costs, hygiene benefits, and environmental impact in this comprehensive guide.',
    content: `## The Cost of Convenience

Many consumers hesitate at the thought of "refills." However, when you calculate the cost of cleaning solutions, gloves, and the frequent replacement of gross traditional brushes, the Clowand system is surprisingly economical.

### Hygiene Comparison

- **Traditional**: Reuses the same dirty bristles for 6-12 months. Requires chemical soaking.
- **Disposable**: Fresh, pre-loaded detergent in every head. Zero cross-contamination.

### Environmental Impact

Clowand is committed to sustainability. Our disposable heads are designed to be biodegradable, offering a guilt-free way to maintain a hospital-grade clean in your home. Don’t compromise—upgrade your standard.`,
    cover_image: 'https://images.unsplash.com/photo-1558317374-067df5f1503c?auto=format&fit=crop&q=80&w=1200',
    is_published: true,
    published_at: new Date().toISOString()
  }
];

async function run() {
  const { data, error } = await supabase.from('posts').insert(posts);
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  console.log('Success:', data);
  process.exit(0);
}

run();
