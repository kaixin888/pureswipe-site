/**
 * update-blog-covers.js
 * 将所有 20 篇新博客文章的 cover_image 更新为 R2 产品图
 */
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

const COVER_URL = 'https://media.clowand.com/products/starter-kit-main.jpg'

const slugs = [
  'apartment-disposable-toilet-brush-buying-guide',
  'safe-disposable-toilet-brush-for-family',
  'no-sticky-hands-disposable-toilet-brush',
  'fight-bathroom-germs-odors-disposable-toilet-brush',
  'rental-move-out-cleaning-disposable-toilet-brush',
  'small-bathroom-disposable-toilet-brush',
  'airbnb-host-disposable-toilet-brush',
  'spring-cleaning-disposable-toilet-brush',
  'college-student-dorm-disposable-toilet-brush',
  'large-family-multi-bathroom-disposable-toilet-brush',
  'how-to-use-disposable-toilet-brush',
  'clean-toilet-rim-dead-corners',
  'replace-store-disposable-toilet-brush-heads',
  'disposable-toilet-brush-vs-silicone',
  'flushable-vs-non-flushable-disposable-toilet-brush',
  'where-toilet-bacteria-hide',
  'what-causes-bathroom-odor-disposable-toilet-brush',
  'senior-friendly-disposable-toilet-brush',
  'best-bathroom-gift-idea-disposable-toilet-brush',
  '5-common-mistakes-buying-disposable-toilet-brush'
]

;(async () => {
  let updated = 0
  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('posts')
      .update({ cover_image: COVER_URL })
      .eq('slug', slug)
      .select('id, title')
    if (error) {
      console.error('FAIL:', slug, error.message)
    } else if (data && data.length > 0) {
      console.log('OK:', data[0].id, data[0].title.slice(0, 60))
      updated++
    } else {
      console.log('SKIP (not found):', slug)
    }
  }
  console.log(`\nUpdated ${updated}/20 posts.`)
})()
