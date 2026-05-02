/**
 * Blog bulk import API route — uses ADMIN_PASSWORD for auth, server-side Supabase insert bypasses RLS via service_role key.
 * POST /api/blog-import
 * Body: { password: "clowand888", posts: [...] }
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Service role key from env — bypasses RLS
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  // Auth check
  const { password, posts } = await request.json();
  const adminPw = process.env.ADMIN_PASSWORD || 'clowand888';
  if (password !== adminPw) {
    return NextResponse.json({ error: 'Unauthorized' }, {status: 401, headers: API_CACHE_HEADERS });
  }

  if (!SERVICE_KEY) {
    return NextResponse.json({ error: 'Service role key not configured in env' }, {status: 500, headers: API_CACHE_HEADERS });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const results = [];

  for (const post of posts) {
    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('posts')
      .select('id, slug')
      .eq('slug', post.slug)
      .maybeSingle();

    if (existing) {
      results.push({ slug: post.slug, status: 'skipped', id: existing.id });
      continue;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags,
        content: post.content,
        cover_image: post.cover_image || null,
        is_published: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single();

    if (error) {
      results.push({ slug: post.slug, status: 'error', error: error.message });
    } else {
      results.push({ slug: post.slug, status: 'inserted', id: data.id });
    }
  }

  return NextResponse.json({ results }, { headers: API_CACHE_HEADERS });
}
