import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Generate SEO metadata per article
export async function generateMetadata({ params }) {
  const { data } = await supabase
    .from('posts')
    .select('title, excerpt, cover_image')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'Article Not Found | Clowand' }

  return {
    title: `${data.title} | Clowand Blog`,
    description: data.excerpt || '',
    openGraph: {
      title: data.title,
      description: data.excerpt || '',
      images: data.cover_image ? [data.cover_image] : [],
      url: `https://clowand.com/blog/${params.slug}`,
      type: 'article',
    },
  }
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Render markdown-like content (bold, headings, lists, links)
function renderContent(text) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-black mt-10 mb-4 text-white">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-lg font-black mt-8 mb-3 text-white">
          {line.replace('### ', '')}
        </h3>
      )
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="flex gap-2 items-start text-slate-300 text-sm leading-relaxed">
          <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
    } else {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-400 underline hover:text-blue-300">$1</a>')
      elements.push(
        <p key={key++} className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
      )
    }
  }

  // Wrap consecutive <li> in <ul>
  const wrapped = []
  let liBuffer = []
  for (const el of elements) {
    if (el.type === 'li') {
      liBuffer.push(el)
    } else {
      if (liBuffer.length) {
        wrapped.push(<ul key={key++} className="flex flex-col gap-2 my-4 pl-2">{liBuffer}</ul>)
        liBuffer = []
      }
      wrapped.push(el)
    }
  }
  if (liBuffer.length) wrapped.push(<ul key={key++} className="flex flex-col gap-2 my-4 pl-2">{liBuffer}</ul>)

  return wrapped
}

export default async function BlogPostPage({ params }) {
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!post) notFound()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-2">
        <nav className="text-xs text-slate-400 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-[200px]">{post.title}</span>
        </nav>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        {/* Meta */}
        <p className="text-xs text-blue-400 font-black tracking-widest uppercase mb-4">
          {formatDate(post.published_at)}
        </p>

        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-black leading-tight mb-8">{post.title}</h1>

        {/* Cover image */}
        {post.cover_image && (
          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-10 bg-slate-800">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-4 mb-10 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose-clowand">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-slate-900 rounded-2xl text-center">
          <p className="text-sm font-black tracking-widest text-blue-400 uppercase mb-3">Ready to Upgrade?</p>
          <h3 className="text-xl font-black mb-4">Shop Clowand Toilet Brush Systems</h3>
          <Link
            href="/#bundles"
            className="inline-block bg-blue-600 text-white font-black text-xs tracking-widest px-8 py-4 rounded-full hover:bg-blue-500 transition-colors"
          >
            SHOP NOW →
          </Link>
        </div>

        {/* Back */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-xs text-slate-400 hover:text-white font-black tracking-widest transition-colors"
          >
            ← BACK TO BLOG
          </Link>
        </div>
      </article>
    </main>
  )
}
