'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogFilter({ posts, categories }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState(posts);
  const gridRef = useRef(null);

  useEffect(() => {
    var result = posts;

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(function(p) {
        return (p.category || '').toLowerCase() === activeCategory.toLowerCase();
      });
    }

    // Search text
    if (searchQuery.trim()) {
      var q = searchQuery.toLowerCase().trim();
      result = result.filter(function(p) {
        return (p.title || '').toLowerCase().includes(q)
          || (p.excerpt || '').toLowerCase().includes(q)
          || ((p.tags || [])).some(function(t) { return t.toLowerCase().includes(q); });
      });
    }

    setFiltered(result);
  }, [activeCategory, searchQuery, posts]);

  function handleCategoryClick(cat) {
    setActiveCategory(cat);
  }

  return (
    <div className="mb-12">
      {/* Category pills */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <button
          onClick={function() { handleCategoryClick('All'); }}
          className={
            'px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ' +
            (activeCategory === 'All'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white')
          }
        >
          All
        </button>
        {categories.map(function(cat) {
          return (
            <button
              key={cat}
              onClick={function() { handleCategoryClick(cat); }}
              className={
                'px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ' +
                (activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white')
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mx-auto mb-10">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={searchQuery}
          onChange={function(e) { setSearchQuery(e.target.value); }}
          placeholder="Search articles..."
          className="w-full pl-12 pr-6 py-3.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600/50 transition-all"
        />
      </div>

      {/* Results count */}
      <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 italic mb-8">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        {activeCategory !== 'All' ? ' in ' + activeCategory : ''}
        {searchQuery.trim() ? ' matching "' + searchQuery + '"' : ''}
      </p>

      {/* Filtered grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm mb-4">No articles match your filters.</p>
          <button
            onClick={function() { setActiveCategory('All'); setSearchQuery(''); }}
            className="px-6 py-3 bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-700 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(function(post) {
            return (
              <Link
                key={post.id}
                href={'/blog/' + post.slug}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
