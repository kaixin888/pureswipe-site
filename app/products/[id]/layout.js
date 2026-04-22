import { createClient } from '@supabase/supabase-js'

const SITE = 'https://clowand.com'
const BRAND = 'Clowand'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

function abs(u) {
  if (!u) return `${SITE}/og-image.jpg`
  if (/^https?:\/\//i.test(u)) return u
  return `${SITE}${u.startsWith('/') ? '' : '/'}${u}`
}

function clip(s, n) {
  if (!s) return ''
  const stripped = String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return stripped.length > n ? stripped.slice(0, n - 1).trimEnd() + '…' : stripped
}

async function fetchProduct(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,price,description,image_url,seo_title,seo_description,alt_text,asin,rating,review_count,stock,extra_images')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.id)

  if (!product) {
    return {
      title: `Product | ${BRAND}`,
      description: 'Premium disposable toilet brush systems for US homes.',
      robots: { index: false, follow: true },
    }
  }

  const title = product.seo_title || `${product.name} | ${BRAND}`
  // Priority: explicit SEO copy > product description > alt_text fallback (image-derived ALT often
  // captures keywords the description misses — leveraged for auto-generated meta).
  const description = clip(
    product.seo_description || product.description || product.alt_text,
    160
  )
  const imageUrl = abs(product.image_url)
  const canonical = `${SITE}/products/${product.id}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: BRAND,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.alt_text || product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
    other: {
      // Inline JSON-LD via <meta> is non-standard; the layout below injects a real <script>.
      'product:price:amount': String(product.price ?? ''),
      'product:price:currency': 'USD',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
    },
  }
}

export default async function ProductLayout({ children, params }) {
  const product = await fetchProduct(params.id)

  // JSON-LD Product schema — boosts rich-result eligibility on Google SERP.
  const jsonLd = product
    ? {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: [abs(product.image_url)],
        description: clip(product.description || product.alt_text || '', 5000),
        sku: product.asin || product.id,
        mpn: product.asin || product.id,
        brand: { '@type': 'Brand', name: BRAND },
        offers: {
          '@type': 'Offer',
          url: `${SITE}/products/${product.id}`,
          priceCurrency: 'USD',
          price: product.price,
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: BRAND },
        },
        ...(product.rating && product.review_count
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.review_count,
              },
            }
          : {}),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
