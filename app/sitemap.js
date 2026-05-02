import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Force dynamic rendering — no CDN/Edge cache
export const revalidate = 0
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

export default async function sitemap() {
  const baseUrl = 'https://www.clowand.com'

  // Enforce no-store on CDN level (Vercel Edge may ignore revalidate=0)
  const h = await headers()
  // (headers() call ensures this runs server-side, not at build-time)

  // Static routes
  const staticRoutes = [
    '/',
    '/about',
    '/blog',
    '/faq',
    '/login',
    '/account',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic product routes (explicit limit=500 to avoid Supabase default truncation)
  const { data: products } = await supabase
    .from('products')
    .select('id, created_at')
    .eq('status', 'active')
    .limit(500)

  const productRoutes = (products || []).map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(product.created_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  // Dynamic blog routes (explicit limit=500 to avoid default truncation)
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('slug, published_at')
    .eq('is_published', true)
    .limit(500)

  if (postsError) {
    console.error('[sitemap] posts query error:', postsError.message)
  }

  const blogRoutes = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const allRoutes = [...staticRoutes, ...productRoutes, ...blogRoutes]
  console.log(`[sitemap] Generated ${allRoutes.length} URLs (${staticRoutes.length} static, ${productRoutes.length} products, ${blogRoutes.length} blog posts)`)
  return allRoutes
}
