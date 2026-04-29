// 博客推荐文章组件
// 按发布时间取最新 3 篇（排除当前文章），无匹配时不渲染

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

export default async function BlogRelatedArticles({ currentSlug }) {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published_at')
    .eq('is_published', true)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(3)

  if (!posts || posts.length === 0) return null

  function formatDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <section className="mt-20 pt-12 border-t border-slate-800">
      <h2 className="text-xl font-black tracking-widest uppercase text-blue-400 mb-10">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block bg-slate-900 rounded-2xl overflow-hidden hover:bg-slate-800/80 transition-colors"
          >
            {/* 封面图 */}
            <div className="relative w-full h-40 bg-slate-800 overflow-hidden">
              {post.cover_image ? (
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 font-black text-sm tracking-widest uppercase">
                  Clowand
                </div>
              )}
            </div>

            {/* 文本 */}
            <div className="p-5">
              <p className="text-[10px] text-slate-500 font-semibold mb-2">
                {formatDate(post.published_at)}
              </p>
              <h3 className="text-sm font-bold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
