'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useCart } from 'react-use-cart'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Product360 from '../../../../components/Product360'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../../../components/Providers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { setIsCartOpen } = useStore()
  const [showSticky, setShowSticky] = useState(false)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/#bundles')
        return
      }
      setProduct(data)
      setLoading(false)
    }
    if (id) fetchProduct()
  }, [id, router])

  useEffect(() => {
    if (!id) return
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_published', true)
        .or(`product_id.eq.${id},product_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(6)
      if (data && data.length > 0) setReviews(data)
    }
    fetchReviews()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) return null

  // Parse extra images
  let allImages = [product.image_url]
  try {
    const extras = JSON.parse(product.extra_images || '[]')
    allImages = extras.length > 0 ? extras : [product.image_url]
  } catch {}

  // Parse bullets
  let bullets = []
  try {
    bullets = JSON.parse(product.bullets || '[]')
  } catch {}

  const isOutOfStock = product.stock <= 0

  function handleAddToCart() {
    if (isOutOfStock) return
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id.toString(), name: product.name, price: product.price, image: product.image_url })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Star rating
  const rating = parseFloat(product.rating) || 0
  const fullStars = Math.floor(rating)
  const halfStar = rating - fullStars >= 0.5

  // SEO: use seo_title / seo_description if set, fallback to product fields
  const seoTitle = product.seo_title || `${product.name} | Clowand`
  const seoDesc = product.seo_description || product.description || 'Premium disposable toilet brush system by Clowand.'

  // Update document title dynamically (client component)
  React.useEffect(() => {
    document.title = seoTitle
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', seoDesc)
  }, [seoTitle, seoDesc])

  // GEO: Enhanced Product and Breadcrumb Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url,
    "description": seoDesc,
    "sku": product.id.toString(),
    "brand": { "@type": "Brand", "name": "Clowand" },
    "offers": {
      "@type": "Offer",
      "url": `https://clowand.com/products/${product.id}`,
      "priceCurrency": "USD",
      "price": String(product.price),
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": String(product.rating || 4.8),
      "reviewCount": String(product.review_count || 127)
    },
    "review": reviews.slice(0, 3).map(r => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": r.author_name },
      "datePublished": r.created_at,
      "reviewBody": r.content,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": String(r.rating || 5)
      }
    }))
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clowand.com" },
      { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://clowand.com/#bundles" },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://clowand.com/products/${product.id}` }
    ]
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-2">
        <nav className="text-xs text-slate-400 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#bundles" className="hover:text-white transition-colors">Products</Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-14">

        {/* Images */}
        <div className="flex flex-col gap-4">
          <Product360
            images={allImages}
            tag={product.tag}
            currentFrame={selectedImage}
            onFrameChange={setSelectedImage}
          />
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-white ${
                    selectedImage === idx ? 'border-blue-500' : 'border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <p className="text-xs font-black tracking-widest text-blue-400 uppercase">clowand</p>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-black leading-tight">{product.name}</h1>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < fullStars ? 'text-yellow-400' : i === fullStars && halfStar ? 'text-yellow-300' : 'text-slate-600'}`}>
                    {i < fullStars ? '★' : i === fullStars && halfStar ? '½' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-400">{rating} ({product.review_count?.toLocaleString()} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white">${product.price?.toFixed(2)}</span>
            <span className="text-sm text-slate-400 line-through">${(product.price * 1.3).toFixed(2)}</span>
            <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded font-bold">SAVE 23%</span>
          </div>

          {/* Bullet points */}
          {(() => {
            try {
              const bts = typeof product.bullets === 'string'
                ? JSON.parse(product.bullets || '[]')
                : (Array.isArray(product.bullets) ? product.bullets : [])
              return bts.length > 0 ? (
                <ul className="space-y-2 border-t border-slate-800 pt-4">
                  {bts.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 mt-0.5 flex-shrink-0 font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null
            } catch { return null }
          })()}

          {/* Stock status */}
          {isOutOfStock ? (
            <div className="text-red-400 font-bold text-sm">OUT OF STOCK</div>
          ) : (
            <div className="text-green-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              In Stock &bull; Ships within 1-2 business days
            </div>
          )}

          {/* Qty + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-slate-700 rounded-full overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-4 py-3 text-white hover:bg-slate-800 transition-colors font-bold"
              >-</button>
              <span className="px-4 py-3 text-white font-bold min-w-[40px] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="px-4 py-3 text-white hover:bg-slate-800 transition-colors font-bold"
              >+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-4 rounded-full font-black tracking-widest text-sm transition-all ${
                isOutOfStock
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : added
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
              }`}
            >
              {isOutOfStock ? 'OUT OF STOCK' : added ? '✓ ADDED TO CART' : 'ADD TO CART'}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: '🛡️', label: '100% Satisfaction\nGuarantee' },
              { icon: '↩️', label: 'Hassle-Free\nNo-Return Refund' },
              { icon: '🚚', label: 'Fast US\nShipping' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center border border-slate-800 rounded-xl p-3">
                <span className="text-2xl">{b.icon}</span>
                <span className="text-[10px] text-slate-400 leading-tight whitespace-pre-line">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-slate-800 pt-6">
              <h2 className="text-sm font-black tracking-widest text-slate-400 mb-3 uppercase">About This Product</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Features / Bullets */}
      {bullets.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="border-t border-slate-800 pt-10">
            <h2 className="text-xl font-black tracking-widest text-white mb-8 uppercase">Key Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3 items-start bg-slate-900 rounded-xl p-4">
                  <span className="text-blue-400 mt-0.5 text-lg shrink-0">✓</span>
                  <span className="text-sm text-slate-300 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="border-t border-slate-800 pt-10">
            <h2 className="text-xl font-black tracking-widest text-white mb-8 uppercase">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                  <div className="flex gap-1 mb-4 text-yellow-400 text-base">
                    {[...Array(review.rating || 5)].map((_, i) => <span key={i}>★</span>)}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic mb-5">"{review.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-white">
                      {(review.author_name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-widest text-white">{review.author_name}</p>
                      {review.author_location && (
                        <p className="text-[10px] text-slate-500">{review.author_location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20 text-center">
        <Link
          href="/#bundles"
          className="inline-block border border-slate-700 text-slate-400 hover:text-white hover:border-white text-xs font-black tracking-widest px-8 py-4 rounded-full transition-all"
        >
          ← VIEW ALL PRODUCTS
        </Link>
      {/* Sticky Mobile Add to Cart */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="md:hidden fixed bottom-6 left-4 right-4 z-[100] bg-white rounded-3xl shadow-2xl p-4 flex items-center justify-between border border-slate-100"
            style={{ 
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              marginBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-1">
                <Image src={product.image_url} alt={product.name} width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-tighter text-slate-900 truncate pr-2">{product.name}</h4>
                <p className="text-sm font-black italic tracking-tighter text-blue-600">${product.price?.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                handleAddToCart()
                setIsCartOpen(true)
              }}
              disabled={isOutOfStock}
              className={`px-8 py-3 rounded-full font-black tracking-widest text-[10px] uppercase transition-all ${
                isOutOfStock ? 'bg-slate-200 text-slate-400' : 'bg-slate-950 text-white shadow-xl shadow-slate-900/20 active:scale-95'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </section>
    </main>
  )
}
