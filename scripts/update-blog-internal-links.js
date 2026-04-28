/**
 * update-blog-internal-links.js (v2)
 * SEO internal linking — insert markdown links `[anchor](url)` at keyword insertion points
 * Uses broader keyword matching to handle markdown special characters
 */
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

const SITE = 'https://clowand.com'

// Each rule: { keyword, insertBefore, linkMarkdown }
// keyword = text that must exist in content (case-insensitive, trimmed)
// insertBefore = the markdown text to append link right before
const linkRules = [
  // Group 1: Cross-link to related blog topics
  { match: 'if you manage multiple properties', slug: 'apartment-disposable-toilet-brush-buying-guide', anchor: 'apartment dwellers need a different approach' },
  { match: 'everyday objects', slug: 'disposable-toilet-brush-vs-silicone', anchor: 'why silicone brushes fall short' },
  { match: 'spring cleaning', slug: 'spring-cleaning-disposable-toilet-brush', anchor: 'see our spring cleaning guide' },
  { match: 'dorm bathroom', slug: 'college-student-dorm-disposable-toilet-brush', anchor: 'check our dorm bathroom guide' },
  { match: 'shared bathroom', slug: 'small-bathroom-disposable-toilet-brush', anchor: 'see our small bathroom guide' },
  { match: 'senior', slug: 'senior-friendly-disposable-toilet-brush', anchor: 'read our senior-friendly guide' },
  { match: 'airbnb', slug: 'airbnb-host-disposable-toilet-brush', anchor: 'see why Airbnb hosts love it' },
  { match: 'musty', slug: 'what-causes-bathroom-odor-disposable-toilet-brush', anchor: 'learn what really causes bathroom odors' },
  { match: 'bacteria', slug: 'where-toilet-bacteria-hide', anchor: 'see where bacteria really hide' },
  { match: 'mistake', slug: '5-common-mistakes-buying-disposable-toilet-brush', anchor: 'avoid common buying mistakes' },
  { match: 'under the rim', slug: 'clean-toilet-rim-dead-corners', anchor: 'master cleaning under the rim' },
  { match: 'refill', slug: 'replace-store-disposable-toilet-brush-heads', anchor: 'when to replace brush heads' },
  { match: 'flushable', slug: 'flushable-vs-non-flushable-disposable-toilet-brush', anchor: 'flushable vs non-flushable explained' },
  { match: 'gift', slug: 'best-bathroom-gift-idea-disposable-toilet-brush', anchor: 'the perfect bathroom gift idea' },
  { match: 'family', slug: 'safe-disposable-toilet-brush-for-family', anchor: 'read our family safety guide' },
  { match: 'rental', slug: 'rental-move-out-cleaning-disposable-toilet-brush', anchor: 'rental move-out cleaning tips' },
  { match: 'multiple bathrooms', slug: 'large-family-multi-bathroom-disposable-toilet-brush', anchor: 'see our multi-bathroom solution' },
  { match: 'right way', slug: 'how-to-use-disposable-toilet-brush', anchor: 'see the step-by-step guide' },
]

// Each article gets:
// - 1 link to product page (#bundles) 
// - 1-2 cross-links to relevant other blog posts
const productLink = `[Clowand starter kit](${SITE}/#bundles)`

;(async () => {
  // Fetch all posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, slug, title, content')

  if (error) { console.error('Fetch error:', error); process.exit(1) }

  const contentMap = {}
  for (const p of posts) contentMap[p.slug] = p.content

  let totalLinks = 0
  let totalPosts = 0

  for (const p of posts) {
    if (p.slug === 'best-bathroom-gift-idea-disposable-toilet-brush') continue
    let content = p.content
    let added = 0

    // 1. Add product page link near "starter kit" mentions (if not already linked)
    const starterKitPatterns = [
      /starter kit/i, /[Ss]tarter [Kk]it/i, /[Bb]rush [Ss]ystem/i, /[Bb]undle/i
    ]
    for (const pat of starterKitPatterns) {
      if (added >= 2) break
      const match = content.match(pat)
      if (match && match.index !== undefined) {
        // Check not already inside a markdown link
        const before = content.substring(Math.max(0, match.index - 20), match.index)
        if (!before.includes('](') && !content.substring(match.index, match.index + 50).includes('](http')) {
          // Replace the matched text with a link
          const matched = match[0]
          content = content.substring(0, match.index) + 
            `[${matched}](${SITE}/#bundles)` + 
            content.substring(match.index + matched.length)
          added++
        }
      }
    }

    // 2. Add cross-links to related blog posts
    for (const rule of linkRules) {
      if (added >= 3) break
      // Skip if same slug (don't link to self)
      if (rule.slug === p.slug) continue
      
      const idx = content.toLowerCase().indexOf(rule.match.toLowerCase())
      if (idx === -1) continue
      
      // Check not already in a link
      const before = content.substring(Math.max(0, idx - 30), idx)
      if (before.includes('](')) continue

      // Find sentence boundary to replace naturally
      const afterPeriod = content.lastIndexOf('.', idx)
      const afterNewline = content.lastIndexOf('\n', idx)
      const sentenceStart = Math.max(afterPeriod, afterNewline) + 1
      
      // Build the link text
      const linkText = `[${rule.anchor}](${SITE}/blog/${rule.slug})`
      const insertPhrase = rule.match
      
      // Find actual position in content (handle case mismatch)
      const actualIdx = content.substring(sentenceStart).toLowerCase().indexOf(rule.match.toLowerCase())
      if (actualIdx === -1) continue
      
      const pos = sentenceStart + actualIdx
      const foundLen = rule.match.length
      
      content = content.substring(0, pos) + linkText + ' ' + content.substring(pos)
      added++
    }

    // 3. Write back
    if (added > 0) {
      const { error: ue } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', p.id)
      
      if (ue) console.log(`FAIL ${p.slug}: ${ue.message}`)
      else {
        console.log(`OK ${p.slug}: +${added} links`)
        totalLinks += added
        totalPosts++
      }
    } else {
      console.log(`SKIP ${p.slug}: no insertion points`)
    }
  }

  console.log(`\nDone. ${totalPosts} posts updated, ${totalLinks} total links added.`)
})()
