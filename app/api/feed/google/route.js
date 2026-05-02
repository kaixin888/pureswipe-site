import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // re-build feed at most once per hour even if forced dynamic

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

const BASE_URL = 'https://clowand.com'
const BRAND = 'Clowand'
// Google Product Category 606 = Bath > Bathroom Accessories
const GOOGLE_CATEGORY = '606'

// XML 1.0 forbids most control chars; CDATA still chokes on "]]>" sequence.
function xmlEscape(s) {
  if (s == null) return ''
  return String(s).replace(/]]>/g, ']]]]><![CDATA[>')
}

function safeNumber(n, fallback = 0) {
  const v = Number(n)
  return Number.isFinite(v) ? v : fallback
}

function parseJsonField(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function absoluteUrl(u) {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  return `${BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`
}

export async function GET() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')

  if (error) {
    return new Response(`Feed error: ${error.message}`, { status: 500 })
  }
  if (!products || products.length === 0) {
    return new Response('No active products', { status: 404 })
  }

  const items = products.map((p) => {
    const price = safeNumber(p.price).toFixed(2)
    const salePrice = p.sale_price && safeNumber(p.sale_price) > 0
      ? safeNumber(p.sale_price).toFixed(2)
      : null
    const inStock = safeNumber(p.stock) > 0
    const productUrl = `${BASE_URL}/products/${p.id}`
    const mainImage = absoluteUrl(p.image_url)
    const extras = parseJsonField(p.extra_images).slice(0, 10).map(absoluteUrl).filter(Boolean)
    const altText = p.alt_text || p.name
    // ASIN doubles as MPN — Cloudwand makes the product, no manufacturer GTIN.
    const mpn = p.asin || `CLW-${p.id.slice(0, 8).toUpperCase()}`

    return `
    <item>
      <g:id>${xmlEscape(p.id)}</g:id>
      <g:title><![CDATA[${xmlEscape(p.name)}]]></g:title>
      <g:description><![CDATA[${xmlEscape(p.description || p.name)}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:mobile_link>${productUrl}</g:mobile_link>
      <g:image_link>${mainImage}</g:image_link>
${extras.map(u => `      <g:additional_image_link>${u}</g:additional_image_link>`).join('\n')}
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${price} USD</g:price>
${salePrice ? `      <g:sale_price>${salePrice} USD</g:sale_price>` : ''}
      <g:brand>${BRAND}</g:brand>
      <g:mpn>${xmlEscape(mpn)}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${GOOGLE_CATEGORY}</g:google_product_category>
      <g:product_type>Home &gt; Bathroom &gt; Toilet Cleaning</g:product_type>
      <g:item_group_id>${xmlEscape(p.tag || 'clowand-toilet-brush')}</g:item_group_id>
      <g:custom_label_0><![CDATA[${xmlEscape(altText)}]]></g:custom_label_0>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard Free Shipping</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Clowand Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Professional 18" Disposable Toilet Brush Systems — Clowand US</description>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      'Surrogate-Control': 'no-store',
    },
  })
}
