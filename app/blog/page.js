import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { getSiteImage } from '../../lib/getSiteImage'
import BlogFilter from './BlogFilter'

export const revalidate = 3600

export const metadata = {
  title: 'Blog | Clowand - Bathroom Hygiene Tips & Guides',
  description: 'Expert tips, guides, and insights on bathroom hygiene, toilet cleaning, and creating a healthier home environment.',
  openGraph: {
    title: 'Blog | Clowand',
    description: 'Expert bathroom hygiene tips and guides from Clowand.',
    url: 'https://clowand.com/blog',
  },
}

// Server component — fetch at request time for fresh data
async function getPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
  )
  const defaultCover = await getSiteImage('blog_default_cover')
  const defaultCoverUrl = defaultCover?.image_url || ''
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, alt_text, published_at, category, tags')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  return (data || []).map(post => ({
    ...post,
    cover_image: post.cover_image || defaultCoverUrl,
  }))
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPage() {
  const posts = await getPosts()

  // Gather unique categories
  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))]

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clowand.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://clowand.com/blog" }
    ]
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="py-24 px-6 text-center border-b border-slate-800">
        <p className="text-xs font-black tracking-widest text-blue-400 uppercase mb-4">Clowand Blog</p>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
          Bathroom Hygiene<br />Tips & Guides
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Expert advice for a cleaner, healthier home. From quick tips to deep dives.
        </p>
      </section>

      {/* Filter + Posts */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <BlogFilter posts={posts} categories={categories} />

        {posts.length === 0 ? (
          <p className="text-center text-slate-500 py-20">No articles yet. Check back soon.</p>
        ) : (
          <div id="blog-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-slate-900 rounded-2xl overflow-hidden hover:bg-slate-800 transition-all duration-300"
              >
                <div className="relative w-full h-52 bg-slate-800">
                  <Image
                    src={post.cover_image}
                    alt={post.alt_text || post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs text-slate-400">{formatDate(post.published_at)}</p>
                    {post.category && (
                      <span className="px-2.5 py-0.5 bg-slate-800 rounded-full text-[9px] font-bold tracking-wider text-blue-300 uppercase">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black leading-snug mb-3 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  )}
                  <p className="mt-4 text-xs font-black tracking-widest text-blue-400 group-hover:underline">
                    READ MORE →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
