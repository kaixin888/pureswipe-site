// 站点图片获取工具
// 使用: const { image_url, alt_text } = await getSiteImage('home_hero_bg');
// 内部缓存避免重复请求

const imageCache = {};

export async function getSiteImage(slotKey) {
  if (imageCache[slotKey]) return imageCache[slotKey];

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
    );

    const { data } = await supabase
      .from('site_images')
      .select('image_url, alt_text, width, height')
      .eq('slot_key', slotKey)
      .single();

    if (data) {
      imageCache[slotKey] = data;
      return data;
    }
  } catch (err) {
    console.error(`getSiteImage("${slotKey}") error:`, err);
  }

  return { image_url: '', alt_text: '', width: 0, height: 0 };
}
