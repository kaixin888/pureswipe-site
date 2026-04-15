import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://clowand.com'

export default async function sitemap() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Static pages
  const staticPages = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  // Blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, published_at')
    .eq('is_published', true)

  const postPages = (posts || []).map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Products
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('status', 'active')

  const productPages = (products || []).map(p => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  return [...staticPages, ...postPages, ...productPages]
}
