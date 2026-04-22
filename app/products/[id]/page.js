'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useCart } from 'react-use-cart'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { 
  CheckCircle, ShieldCheck, X, Star, Zap, Shield, Camera, 
  Ruler, Truck, ChevronDown 
} from 'lucide-react'
import { useStore } from '../../../components/Providers'
import Product360 from '../../../components/Product360'
import DeliveryCountdown from '../../../components/DeliveryCountdown'
import { getEffectivePrice } from '../../../lib/getEffectivePrice'

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
  const [purchaseType, setPurchaseType] = useState('one-time') // 'one-time' | 'subscribe'
  const [previewImage, setPreviewImage] = useState(null)
  const [openSection, setOpenSection] = useState(null)
  
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
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (data) setReviews(data)
    }
    fetchReviews()
  }, [id])

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
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

  // Phase E-2: unified effective price (sale_price-aware).
  // Subscribe-and-save 15% stacks ON TOP of the base effective price.
  const { price: effectivePrice, originalPrice: trueOriginalPrice, isOnSale } = getEffectivePrice(product)
  const finalPrice = purchaseType === 'subscribe' ? effectivePrice * 0.85 : effectivePrice
  // Strikethrough basis: real original on sale, otherwise legacy 1.3x marketing markup.
  const strikethroughPrice = isOnSale ? trueOriginalPrice : effectivePrice * 1.3

  function handleBuyNow() {
    if (isOutOfStock) return
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: finalPrice,
      image: product.image_url,
      quantity: qty,
      purchase_type: purchaseType
    })
    setIsCheckoutOpen(true)
  }

  function handleAddToCart() {
    if (isOutOfStock) return
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: finalPrice,
      image: product.image_url,
      quantity: qty,
      purchase_type: purchaseType
    })

    // GA4 Ecommerce: add_to_cart
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: finalPrice * qty,
        items: [{
          item_id: product.id.toString(),
          item_name: product.name,
          price: finalPrice,
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
      "price": String(effectivePrice),
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
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-500" />
            <p className="text-[11px] font-semibold tracking-[0.18em] text-walmart-sky uppercase">Clowand Premium</p>
          </div>
          <h1 className="text-3xl lg:text-5xl font-medium leading-tight tracking-tight text-white">{product.name}</h1>

          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < fullStars ? 'currentColor' : 'none'} className={i === fullStars && halfStar ? 'opacity-50' : ''} />
              ))}
            </div>
            <span className="text-sm text-slate-400 font-bold tracking-tight">{rating} ({product.review_count || 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-semibold text-white tracking-tight">
              ${finalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-slate-400 line-through">${strikethroughPrice.toFixed(2)}</span>
            {isOnSale && (
              <span className="text-[10px] bg-red-600/15 text-red-300 px-2 py-1 rounded-md font-semibold tracking-wide uppercase">Sale</span>
            )}
            {purchaseType === 'subscribe' && <span className="text-[10px] bg-walmart-sky/15 text-walmart-sky px-2 py-1 rounded-md font-semibold tracking-wide uppercase">Save 15%</span>}
          </div>

          {/* Subscribe & Save UI */}
          <div className="flex flex-col gap-2 mt-2">
            <button 
              onClick={() => setPurchaseType('one-time')}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${purchaseType === 'one-time' ? 'border-walmart-sky bg-walmart-sky/5' : 'border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${purchaseType === 'one-time' ? 'border-blue-600' : 'border-slate-600'}`}>
                  {purchaseType === 'one-time' && <div className="w-2 h-2 rounded-full bg-walmart-sky" />}
                </div>
                <span className="text-sm font-bold text-white">One-time purchase</span>
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-300">${effectivePrice.toFixed(2)}</span>
            </button>

            <button 
              onClick={() => setPurchaseType('subscribe')}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${purchaseType === 'subscribe' ? 'border-walmart-sky bg-walmart-sky/5' : 'border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${purchaseType === 'subscribe' ? 'border-blue-600' : 'border-slate-600'}`}>
                  {purchaseType === 'subscribe' && <div className="w-2 h-2 rounded-full bg-walmart-sky" />}
                </div>
                <div>
                  <span className="text-sm font-bold block text-left text-white">Subscribe & Save</span>
                  <span className="text-[10px] text-walmart-sky font-semibold tracking-[0.18em] block text-left">Deliver every 3 months</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold tracking-tight text-white">${(effectivePrice * 0.85).toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block line-through tracking-tighter">${effectivePrice.toFixed(2)}</span>
              </div>
            </button>
          </div>

          {/* Delivery Countdown */}
          <DeliveryCountdown />

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
                className={`flex-1 py-4 rounded-full font-semibold tracking-wide text-sm transition-all ${isOutOfStock ? 'bg-slate-700 text-slate-500' : added ? 'bg-green-600 text-white' : 'bg-walmart-navy/20 text-white border border-walmart-navy/40 hover:bg-walmart-navy/40'}`}
              >
                {isOutOfStock ? 'OUT OF STOCK' : added ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
            </div>
            
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-full font-semibold tracking-wide text-sm transition-all bg-walmart-navy text-white hover:bg-walmart-navy/90 flex items-center justify-center gap-2 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Zap size={16} fill="currentColor" />
              BUY IT NOW
            </button>

            {/* Payment Trust Badges */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Guaranteed Safe Checkout</p>
              <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                <img src="/images/trust/paypal.svg" alt="PayPal" className="h-5 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" />
                <img src="/images/trust/stripe.svg" alt="Stripe" className="h-6 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" />
                <img src="/images/trust/visa.svg" alt="Visa" className="h-4 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" />
                <img src="/images/trust/mastercard.svg" alt="Mastercard" className="h-8 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h2 className="text-sm font-black tracking-widest text-slate-400 mb-3 uppercase flex items-center gap-2">
              <Shield size={14} className="text-blue-500" />
              Product Description
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
          </div>

          {/* Product Specs & Shipping Accordion */}
          <div className="flex flex-col gap-4 mt-2 border-t border-slate-800 pt-8">
            <div className="border-b border-slate-800 pb-4">
              <button 
                onClick={() => setOpenSection(openSection === 'specs' ? null : 'specs')}
                className="w-full flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <Ruler size={18} className="text-blue-500" />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-200 group-hover:text-white transition-colors">Product Specifications</span>
                </div>
                <ChevronDown size={18} className={`text-slate-500 transition-transform ${openSection === 'specs' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'specs' && (
                <div className="mt-4 text-sm text-slate-400 leading-relaxed space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between border-b border-slate-800/50 pb-2"><span>Wand Length</span><span className="text-white font-bold">18 Inches</span></div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2"><span>Material</span><span className="text-white font-bold">High-Grade ABS</span></div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2"><span>Refill Mechanism</span><span className="text-white font-bold">Quick-Release Zero-Touch</span></div>
                  <div className="flex justify-between pb-2"><span>Compatibility</span><span className="text-white font-bold">Clowand 3-Layer Pads Only</span></div>
                </div>
              )}
            </div>

            <div className="border-b border-slate-800 pb-4">
              <button 
                onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                className="w-full flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-blue-500" />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-200 group-hover:text-white transition-colors">Shipping & Returns</span>
                </div>
                <ChevronDown size={18} className={`text-slate-500 transition-transform ${openSection === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'shipping' && (
                <div className="mt-4 text-sm text-slate-400 leading-relaxed space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <p>🚀 <span className="text-white font-bold italic">FREE Standard Shipping</span> across the United States. Orders are processed within 24 hours.</p>
                  <p>📦 <span className="text-white font-bold italic">3-5 Day Delivery</span> from our regional warehouses (CA, TX, NJ).</p>
                  <p>🛡️ <span className="text-white font-bold italic">365-Day Satisfaction</span>: If you aren't happy, we'll make it right. No-hassle return policy.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {bullets.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800">
          <div className="text-center mb-16">
            <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Premium Hygiene</span>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mt-4">Advanced Cleaning Tech</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bullets.map((b, i) => (
              <div key={i} className="flex flex-col gap-4 bg-slate-900/50 rounded-[2rem] p-8 border border-slate-800/50 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <CheckCircle size={20} />
                </div>
                <p className="text-lg font-bold text-slate-200 leading-snug">{b}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section id="reviews" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
          <div>
            <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Voice of America</span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mt-4 text-white">Customer Reviews</h2>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-5xl font-semibold tracking-tight text-white">{rating}</p>
              <div className="flex gap-1 text-yellow-400 mt-2 justify-center">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
            </div>
            <div className="w-px h-16 bg-slate-800" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 max-w-[100px] leading-relaxed italic">Verified US Purchases Only</p>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden">
                {/* Photo Review Badge */}
                {review.image_url && (
                  <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-blue-500" />
                  </div>
                )}
                
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[...Array(review.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>

                {/* UGC Image */}
                {review.image_url && (
                  <div 
                    className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 bg-slate-800 cursor-zoom-in group/img"
                    onClick={() => setPreviewImage(review.image_url)}
                  >
                    <Image src={review.image_url} fill className="object-cover group-hover/img:scale-105 transition-transform duration-700" alt="Customer Photo" />
                    <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-all" />
                  </div>
                )}

                <p className="text-xl text-slate-200 italic font-medium leading-relaxed mb-8">"{review.content}"</p>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-blue-400 border border-slate-700 uppercase">
                    {review.author_name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-widest uppercase text-white">{review.author_name || 'Verified Buyer'}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{review.author_location || 'United States'} • {new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-800">
            <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Be the first to review this product!</p>
          </div>
        )}
      </section>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 animate-in fade-in duration-300">
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 text-white hover:text-blue-400 transition-colors">
            <X size={32} />
          </button>
          <div className="relative max-w-4xl max-h-full aspect-square w-full">
            <Image src={previewImage} fill className="object-contain" alt="Customer Preview" />
          </div>
        </div>
      )}
    </main>
  )
}
