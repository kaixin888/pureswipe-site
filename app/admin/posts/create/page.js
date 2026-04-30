'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function CreatePostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    is_published: false,
  })
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm(f => ({
      ...f,
      [name]: val,
      ...(name === 'title' ? { slug: slugify(value) } : {}),
    }))
  }

  async function handleSave(publish) {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.slug.trim()) { setError('Slug is required'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('posts').insert([{
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      cover_image: form.cover_image,
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    }])
    setSaving(false)
    if (err) { setError(err.message); return }
    router.push('/admin/posts')
  }

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9',
    borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block', color: '#333' }

  return (
    <div style={{ padding: '24px', maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={() => router.push('/admin/posts')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>New Article</h1>
      </div>

      {error && (
        <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', color: '#ff4d4f', padding: '8px 16px', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Article title" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Slug (URL) *</label>
          <input name="slug" value={form.slug} onChange={handleChange} placeholder="article-url-slug" style={inputStyle} />
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Preview: /blog/{form.slug || 'your-slug'}</p>
        </div>

        <div>
          <label style={labelStyle}>Excerpt (summary shown in listing)</label>
          <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3}
            placeholder="Brief summary of the article..." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <div>
          <label style={labelStyle}>Cover Image URL</label>
          <input name="cover_image" value={form.cover_image} onChange={handleChange}
            placeholder="https://..." style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Content (Markdown supported: ## Heading, **bold**, - list item, [link](url))</label>
          <textarea name="content" value={form.content} onChange={handleChange} rows={20}
            placeholder="Write your article content here..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{
              padding: '10px 24px', borderRadius: 6, border: '1px solid #d9d9d9',
              background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14
            }}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            style={{
              padding: '10px 24px', borderRadius: 6, border: 'none',
              background: '#1677ff', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14
            }}
          >
            {saving ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
