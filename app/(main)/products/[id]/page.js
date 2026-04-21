'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useCart } from 'react-use-cart'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle, ShieldCheck, X } from 'lucide-react'
import { useStore } from '../../../../components/Providers'
import Product360 from '../../../../components/Product360'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

export default function ProductDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isReviewGuideOpen, setIsReviewGuideOpen] = useState(false)
  
  const { addItem } = useCart()
  const { setIsCheckoutOpen } = useStore()

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !data) {
        router.push('/')
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
        .eq('product_id', id)
        .order('created_at', { ascending: false })
      if (data) setReviews(data)
    }
    fetchReviews()
  }, [id])

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Parse extra images
  let allImages = [product.image_url]
  try {
    const extras = JSON.parse(product.extra_images || '[]')
    if (Array.isArray(extras) && extras.length > 0) {
      allImages = extras
    }
  } catch {}

  // Parse bullets
  let bullets = []
  try {
    bullets = JSON.parse(product.bullets || '[]')
  } catch {}

  const isOutOfStock = product.stock <= 0

  function handleBuyNow() {
    if (isOutOfStock) return
    addItem({ 
      id: product.id.toString(), 
      name: product.name, 
      price: product.price, 
      image: product.image_url,
      quantity: qty
    })
    setIsCheckoutOpen(true)
  }

  function handleAddToCart() {
    if (isOutOfStock) return
    addItem({ 
      id: product.id.toString(), 
      name: product.name, 
      price: product.price, 
      image: product.image_url,
      quantity: qty
    })
    
    // GA4 Ecommerce: add_to_cart
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: product.price * qty,
        items: [{
          item_id: product.id.toString(),
          item_name: product.name,
          price: product.price,
          quantity: qty
        }]
      });
    }

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const rating = parseFloat(product.rating) || 4.9
  const fullStars = Math.floor(rating)
  const halfStar = (rating - fullStars) >= 0.5

  const seoTitle = product.seo_title || `${product.name} | Clowand`
  const seoDesc = product.seo_description || product.description || 'Premium disposable toilet brush system.'

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url,
    "description": seoDesc,
    "sku": String(product.id),
    "brand": { "@type": "Brand", "name": "Clowand" },
    "offers": {
      "@type": "Offer",
      "url": `https://clowand.com/products/${product.id}`,
      "priceCurrency": "USD",
      "price": String(product.price),
      "availability": "https://schema.org/InStock"
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      
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

      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-14">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <Product360
            images={allImages}
            tag={product.tag}
            currentFrame={selectedImage}
            onFrameChange={setSelectedImage}
          />
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
                  <Image src={img} alt={product.alt_text || `${product.name} View ${idx + 1}`} fill className="object-contain p-1" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <p className="text-xs font-black tracking-widest text-blue-400 uppercase">clowand</p>
          <h1 className="text-3xl lg:text-4xl font-black leading-tight uppercase italic tracking-tighter">{product.name}</h1>

          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < fullStars ? '★' : (i === fullStars && halfStar ? '½' : '☆')}</span>
              ))}
            </div>
            <span className="text-sm text-slate-400">{rating} ({product.review_count || 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white italic tracking-tighter">${product.price?.toFixed(2)}</span>
            <span className="text-sm text-slate-400 line-through">${(product.price * 1.3).toFixed(2)}</span>
          </div>

          {/* Qty + Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-700 rounded-full overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-white hover:bg-slate-800 font-bold">-</button>
                <span className="px-4 py-3 text-white font-bold min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-white hover:bg-slate-800 font-bold">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 rounded-full font-black tracking-widest text-sm transition-all ${isOutOfStock ? 'bg-slate-700 text-slate-500' : added ? 'bg-green-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {isOutOfStock ? 'OUT OF STOCK' : added ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
            </div>
            
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-full font-black tracking-widest text-sm transition-all bg-blue-600 text-white hover:bg-blue-500 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              BUY IT NOW
            </button>

            {/* Payment Trust Badges */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Guaranteed Safe Checkout</p>
              <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h2 className="text-sm font-black tracking-widest text-slate-400 mb-3 uppercase">Description</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </section>

      {bullets.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10 border-t border-slate-800">
          <h2 className="text-xl font-black tracking-widest text-white mb-8 uppercase">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bullets.map((b, i) => (
              <div key={i} className="flex gap-3 items-start bg-slate-900 rounded-xl p-4">
                <CheckCircle size={18} className="text-blue-500 shrink-0" />
                <span className="text-sm text-slate-300">{b}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
