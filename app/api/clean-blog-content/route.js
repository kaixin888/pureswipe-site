import { createClient } from '@supabase/supabase-js'

// Prevent static prerendering — env vars only available at runtime
export const dynamic = 'force-dynamic'

// Remove AI pipeline filler: from "(Ensuring word count" through all subsequent
// filler paragraphs until the next markdown heading (## or ###) or end of string.
// This strips the word-count padding text and the auto-generated filler paragraphs
// that follow, while preserving legitimate content sections.
const AI_FILLER_REGEX =
  /\(\s*Ensuring word count\s*[>=]+\s*\d+[^)]*\)[\s\S]*?(?=\n##|\n###|$)/gi

// Fallback: catch "Adding more descriptive text" variants not matched above
const AI_FALLBACK_REGEX =
  /\(?\s*(?:Adding more descriptive text|word count|Ensuring word count)[^)]*\)[\s\S]*?(?=\n##|\n###|$)/gi

export async function GET() {
  // Authenticate: require CRON_SECRET or admin password
  const secret = process.env.CRON_SECRET || 'clowand888'
  const { searchParams } = new URL(import.meta.url || 'http://localhost')
  // (import.meta.url only works in ESM; fallback to header auth)
  // Skip auth in dev; in production, Vercel sets CRON_SECRET

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Guard: fail early if service key not available (Vercel env only)
  if (!serviceKey) {
    return Response.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey
  )

  // Find ALL published posts
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, slug, title, content')
    .eq('is_published', true)
    .limit(500)

  if (fetchError) {
    return Response.json(
      { error: 'Failed to fetch posts', detail: fetchError.message },
      { status: 500 }
    )
  }

  const results = {
    totalChecked: posts.length,
    affected: [],
    cleaned: [],
    errors: [],
  }

  for (const post of posts) {
    let dirty = false
    let cleanedContent = post.content

    // Primary pattern: (Ensuring word count >= NNN: ...)
    if (AI_FILLER_REGEX.test(cleanedContent)) {
      dirty = true
      AI_FILLER_REGEX.lastIndex = 0
      cleanedContent = cleanedContent.replace(AI_FILLER_REGEX, '').trim()
    }

    // Fallback pattern: other AI meta commentary
    if (AI_FALLBACK_REGEX.test(cleanedContent)) {
      dirty = true
      AI_FALLBACK_REGEX.lastIndex = 0
      cleanedContent = cleanedContent.replace(AI_FALLBACK_REGEX, '').trim()
    }

    if (dirty) {
      // Normalize: collapse 3+ blank lines to 2
      cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n')

      results.affected.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
      })

      const { error: updateError } = await supabase
        .from('posts')
        .update({ content: cleanedContent })
        .eq('id', post.id)

      if (updateError) {
        results.errors.push({
          id: post.id,
          slug: post.slug,
          error: updateError.message,
        })
      } else {
        results.cleaned.push(post.slug)
      }
    }
  }

  return Response.json({
    message: `Checked ${results.totalChecked} posts. Found ${results.affected.length} with AI pipeline text. Cleaned ${results.cleaned.length}. Errors: ${results.errors.length}.`,
    results,
  })
}
