import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

async function auditFormatting() {
  const { data, error } = await supabase.from('posts').select('id, title, content');
  if (error) {
    console.error(error);
    return;
  }

  data.forEach(p => {
    const hasH = p.content.includes('# ');
    const hasNN = p.content.includes('\n\n');
    const lineCount = p.content.split('\n').length;
    console.log(`Title: ${p.title}`);
    console.log(`- Has Heading (# ): ${hasH}`);
    console.log(`- Has Double Newline (\\n\\n): ${hasNN}`);
    console.log(`- Line Count: ${lineCount}`);
    console.log('---');
  });
}

auditFormatting();
