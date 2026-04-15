import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

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
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  return data || []
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
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

      {/* Posts grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-slate-500 py-20">No articles yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-slate-900 rounded-2xl overflow-hidden hover:bg-slate-800 transition-all duration-300"
              >
                {/* Cover image */}
                <div className="relative w-full h-52 bg-slate-800">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🧹</div>
                  )}
                </div>
                {/* Content */}
                <div className="p-6">
                  <p className="text-xs text-slate-400 mb-3">{formatDate(post.published_at)}</p>
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
