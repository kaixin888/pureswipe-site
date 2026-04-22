'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

export default function PostsAdminPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, is_published, published_at, created_at')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  async function togglePublish(post) {
    const newStatus = !post.is_published
    await supabase
      .from('posts')
      .update({
        is_published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
      })
      .eq('id', post.id)
    fetchPosts()
  }

  async function deletePost(id) {
    if (!confirm('确定永久删除这篇文章？')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchPosts()
  }

  function formatDate(iso) {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>博客文章</h1>
        <Link
          href="/admin/posts/create"
          style={{
            background: '#1677ff', color: '#fff', padding: '8px 20px',
            borderRadius: 6, fontWeight: 600, textDecoration: 'none', fontSize: 14
          }}
        >
          + 新建文章
        </Link>
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['标题', '别名 (Slug)', '状态', '发布时间', '操作'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: 14, maxWidth: 300 }}>
                  <strong>{post.title}</strong>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" style={{ color: '#1677ff' }}>
                    {post.slug}
                  </a>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    background: post.is_published ? '#f6ffed' : '#fff7e6',
                    color: post.is_published ? '#52c41a' : '#fa8c16',
                    border: `1px solid ${post.is_published ? '#b7eb8f' : '#ffd591'}`
                  }}>
                    {post.is_published ? '已发布' : '草稿'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>
                  {formatDate(post.published_at)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => togglePublish(post)}
                      style={{
                        padding: '4px 12px', borderRadius: 4, border: '1px solid #d9d9d9',
                        background: '#fff', cursor: 'pointer', fontSize: 13
                      }}
                    >
                      {post.is_published ? '取消发布' : '发布'}
                    </button>
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      style={{
                        padding: '4px 12px', borderRadius: 4, border: '1px solid #1677ff',
                        color: '#1677ff', background: '#fff', fontSize: 13, textDecoration: 'none'
                      }}
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
                      style={{
                        padding: '4px 12px', borderRadius: 4, border: '1px solid #ff4d4f',
                        color: '#ff4d4f', background: '#fff', cursor: 'pointer', fontSize: 13
                      }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
