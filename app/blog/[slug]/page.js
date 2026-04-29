import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import BlogProducts from '../../../components/BlogProducts'
import BlogRelatedArticles from '../../../components/BlogRelatedArticles'
import { getSiteImage } from '../../../lib/getSiteImage'

// Force dynamic rendering - always fetch latest content from DB
export const revalidate = 3600

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

// 获取站点默认封面图（site_images 管理）
async function getDefaultCover() {
  const siteImg = await getSiteImage('blog_default_cover')
  return siteImg?.image_url || ''
}

// Generate SEO metadata per article
export async function generateMetadata({ params }) {
  const { data } = await supabase
    .from('posts')
    .select('title, excerpt, cover_image')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'Article Not Found | Clowand' }

  // 如果文章没有封面图，回退到 site_images 管理的默认封面
  const coverImage = data.cover_image || await getDefaultCover()

  return {
    title: `${data.title} | Clowand Blog`,
    description: data.excerpt || '',
    openGraph: {
      title: data.title,
      description: data.excerpt || '',
      images: coverImage ? [coverImage] : [],
      url: `https://clowand.com/blog/${params.slug}`,
      type: 'article',
    },
  }
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPostPage({ params }) {
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!post) notFound()

  // 若文章无自定义封面图，使用 site_images 管理的默认封面
  const defaultCover = post.cover_image || await getDefaultCover()

    // GEO: Enhanced Article and Breadcrumb Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": defaultCover || "https://clowand.com/logo.png",
    "datePublished": post.published_at,
    "dateModified": post.published_at,
    "author": { "@type": "Person", "name": "Clowand Engineering Team", "url": "https://clowand.com/about" },
    "publisher": {
      "@type": "Organization",
      "name": "Clowand",
      "logo": { "@type": "ImageObject", "url": "https://clowand.com/logo.png" }
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clowand.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://clowand.com/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://clowand.com/blog/${params.slug}` }
    ]
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Scoped Brute-Force Style Fix for Blog Contrast */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-article h1, .blog-article h2, .blog-article h3 {
          color: #ffffff !important;
          font-weight: 900 !important;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .blog-article p, .blog-article li {
          color: #f1f5f9 !important;
          font-size: 1.125rem !important;
          line-height: 1.8 !important;
        }
        .blog-article .prose-invert {
          color: #f1f5f9 !important;
        }
      `}} />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      
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
      <article className="blog-article max-w-3xl mx-auto px-6 py-10">
        {/* Meta */}
        <p className="text-xs text-blue-400 font-black tracking-widest uppercase mb-4">
          {formatDate(post.published_at)}
        </p>

        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-black leading-tight mb-8 text-white">{post.title}</h1>

        {/* Cover image — supports site_images fallback */}
        {defaultCover && (
          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-10 bg-slate-800">
            <Image
              src={defaultCover}
              alt={post.alt_text || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-slate-200 leading-relaxed border-l-2 border-blue-500 pl-4 mb-10 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-slate lg:prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <BlogProducts />

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

      {/* Related Articles - 3 latest posts excluding current */}
      <BlogRelatedArticles currentSlug={params.slug} />
    </main>
  )
}
