const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://olgfqcygqzuevaftmdja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Step 1: Checking DB Columns ---');
  
  // Check products table
  const { data: product, error: pError } = await supabase
    .from('products')
    .select('*')
    .limit(1)
    .single();

  if (pError) {
    console.error('Error fetching product:', pError.message);
  } else {
    console.log('Product columns:', Object.keys(product));
    if (product.hasOwnProperty('alt_text')) {
      console.log('✅ Column "alt_text" exists in products table.');
    } else {
      console.error('❌ Column "alt_text" MISSING in products table.');
    }
  }

  // Check reviews table
  const { data: review, error: rError } = await supabase
    .from('reviews')
    .select('*')
    .limit(1)
    .single();

  if (rError && rError.code !== 'PGRST116') { // PGRST116 is "no rows found", which is fine
    console.error('Error fetching review:', rError.message);
  } else if (review) {
    console.log('Review columns:', Object.keys(review));
    if (review.hasOwnProperty('image_url')) {
      console.log('✅ Column "image_url" exists in reviews table.');
    } else {
      console.error('❌ Column "image_url" MISSING in reviews table.');
    }
  } else {
    console.log('No reviews found to check columns, but we will try to insert one.');
  }

  console.log('\n--- Step 2: Inserting Mock Review ---');
  if (product) {
    const mockReview = {
      product_id: product.id,
      rating: 5,
      content: "Absolutely amazing! The 18-inch handle is a back-saver, and the zero-touch mechanism is exactly what I needed for my guest bathroom. Highly recommend!",
      author_name: "Sarah M.",
      author_location: "Austin, TX",
      is_published: true,
      image_url: "/images/home-promo-1.jpg" // Using a local image as requested
    };

    const { data: inserted, error: iError } = await supabase
      .from('reviews')
      .insert([mockReview])
      .select();

    if (iError) {
      console.error('❌ Error inserting mock review:', iError.message);
      if (iError.message.includes('column "image_url" of relation "reviews" does not exist')) {
        console.log('Attempting to create column via RPC or advising manual SQL...');
      }
    } else {
      console.log('✅ Mock review inserted successfully:', inserted[0].id);
    }
  } else {
    console.error('❌ Cannot insert review: No product found.');
  }
}

run();
