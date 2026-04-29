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
import DeliveryCountdown from '../../../components/DeliveryCountdown'
import { getEffectivePrice } from '../../../lib/getEffectivePrice'
import dynamic from 'next/dynamic'
const ProductGallery = dynamic(() => import('../../../components/ProductGallery'), { ssr: false })
const RelatedProducts = dynamic(() => import('../../../components/RelatedProducts'), { ssr: false })

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
  const [purchaseType, setPurchaseType] = useState('one-time')
  const [previewImage, setPreviewImage] = useState(null)
  const [openSection, setOpenSection] = useState('howto')
  const [relatedProducts, setRelatedProducts] = useState([])
  
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

  useEffect(() => {
    if (!id) return
    async function fetchRelated() {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, sale_price, image_url, alt_text, tag')
        .neq('id', id)
        .eq('status', 'active')
        .limit(4)
      if (data) setRelatedProducts(data)
    }
    fetchRelated()
  }, [id])

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1a3a5c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Parse extra images
  let allImages = [product.image_url]
  try {
    const extras = JSON.parse(product.extra_images || '[]')
    if (Array.isArray(extras) && extras.length > 0) {
      allImages = [product.image_url, ...extras]
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
    <main className="min-h-screen bg-white text-[#1a2935] pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-2">
        <nav className="text-xs text-[#8a9aa8] flex items-center gap-2">
          <Link href="/" className="hover:text-[#1a3a5c] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#bundles" className="hover:text-[#1a3a5c] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[#1a2935] truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-14">
        {/* Images — Swiper on mobile, grid on desktop */}
        <ProductGallery
          images={allImages}
          tag={product.tag}
          altText={product.alt_text}
          productName={product.name}
        />

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#1a3a5c]" />
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#1a3a5c] uppercase">Clowand Premium</p>
          </div>
          <h1 className="text-3xl lg:text-5xl font-medium leading-tight tracking-tight text-[#1a2935]">{product.name}</h1>

          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < fullStars ? 'currentColor' : 'none'} className={i === fullStars && halfStar ? 'opacity-50' : ''} />
              ))}
            </div>
            <span className="text-sm text-[#8a9aa8] font-bold tracking-tight">{rating} ({product.review_count || 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-semibold text-[#1a2935] tracking-tight">
              ${finalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-[#b0bcc8] line-through">${strikethroughPrice.toFixed(2)}</span>
            {isOnSale && (
              <span className="text-[10px] bg-red-600/10 text-red-600 px-2 py-1 rounded-md font-semibold tracking-wide uppercase">Sale</span>
            )}
            {purchaseType === 'subscribe' && <span className="text-[10px] bg-[#1a3a5c]/10 text-[#1a3a5c] px-2 py-1 rounded-md font-semibold tracking-wide uppercase">Save 15%</span>}
          </div>

          {/* Subscribe & Save UI */}
          <div className="flex flex-col gap-2 mt-2">
            <button 
              onClick={() => setPurchaseType('one-time')}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${purchaseType === 'one-time' ? 'border-[#1a3a5c] bg-[#1a3a5c]/5' : 'border-[#e5e0da] hover:border-[#c5c0ba]'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${purchaseType === 'one-time' ? 'border-[#1a3a5c]' : 'border-[#c5c0ba]'}`}>
                  {purchaseType === 'one-time' && <div className="w-2 h-2 rounded-full bg-[#1a3a5c]" />}
                </div>
                <span className="text-sm font-bold text-[#1a2935]">One-time purchase</span>
              </div>
              <span className="text-sm font-semibold tracking-tight text-[#5a6978]">${effectivePrice.toFixed(2)}</span>
            </button>

            <button 
              onClick={() => setPurchaseType('subscribe')}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${purchaseType === 'subscribe' ? 'border-[#1a3a5c] bg-[#1a3a5c]/5' : 'border-[#e5e0da] hover:border-[#c5c0ba]'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${purchaseType === 'subscribe' ? 'border-[#1a3a5c]' : 'border-[#c5c0ba]'}`}>
                  {purchaseType === 'subscribe' && <div className="w-2 h-2 rounded-full bg-[#1a3a5c]" />}
                </div>
                <div>
                  <span className="text-sm font-bold block text-left text-[#1a2935]">Subscribe & Save</span>
                  <span className="text-[10px] text-[#1a3a5c] font-semibold tracking-[0.18em] block text-left">Deliver every 3 months</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold tracking-tight text-[#1a2935]">${(effectivePrice * 0.85).toFixed(2)}</span>
                <span className="text-[10px] text-[#b0bcc8] block line-through tracking-tighter">${effectivePrice.toFixed(2)}</span>
              </div>
            </button>
          </div>

          {/* Delivery Countdown */}
          <DeliveryCountdown />

          {/* Qty + Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#e5e0da] rounded-full overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-[#1a2935] hover:bg-[#efece8] font-bold">-</button>
                <span className="px-4 py-3 text-[#1a2935] font-bold min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-[#1a2935] hover:bg-[#efece8] font-bold">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 rounded-full font-semibold tracking-wide text-sm transition-all ${isOutOfStock ? 'bg-[#e5e0da] text-[#b0bcc8]' : added ? 'bg-[#2ecc71] text-white' : 'bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90'}`}
              >
                {isOutOfStock ? 'OUT OF STOCK' : added ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
            </div>
            
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-full font-semibold tracking-wide text-sm transition-all bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90 flex items-center justify-center gap-2 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Zap size={16} fill="currentColor" />
              BUY IT NOW
            </button>

            {/* Payment Trust Badges */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0bcc8]">Guaranteed Safe Checkout</p>
              <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                <img src="/images/trust/paypal.svg" alt="PayPal" className="h-5 opacity-50 hover:opacity-100 transition-opacity" />
                <img src="/images/trust/stripe.svg" alt="Stripe" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
                <img src="/images/trust/visa.svg" alt="Visa" className="h-4 opacity-50 hover:opacity-100 transition-opacity" />
                <img src="/images/trust/mastercard.svg" alt="Mastercard" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#e5e0da] pt-6">
            <h2 className="text-sm font-black tracking-widest text-[#8a9aa8] mb-3 uppercase flex items-center gap-2">
              <Shield size={14} className="text-[#1a3a5c]" />
              Product Description
            </h2>
            <p className="text-sm text-[#5a6978] leading-relaxed">{product.description}</p>
          </div>

          {/* Product Specs & Shipping Accordion */}
          <div className="flex flex-col gap-4 mt-2 border-t border-[#e5e0da] pt-8">

            {/* How to Use */}
            <div className="border-b border-[#e5e0da] pb-4">
              <button
                onClick={() => setOpenSection(openSection === 'howto' ? null : 'howto')}
                className="w-full flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c] text-xs font-black">i</span>
                  <span className="text-sm font-black uppercase tracking-widest text-[#1a2935] group-hover:text-[#1a3a5c] transition-colors">How to Use</span>
                </div>
                <ChevronDown size={18} className={`text-[#b0bcc8] transition-transform ${openSection === 'howto' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'howto' && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-200 space-y-4">
                  <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#1a3a5c] text-white rounded-full flex items-center justify-center text-sm font-black">1</span>
                    <div>
                      <p className="text-sm font-bold text-[#1a2935]">Attach</p>
                      <p className="text-sm text-[#8a9aa8] mt-1">Push handle down until the refill clicks into place. You will hear a satisfying snap.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#1a3a5c] text-white rounded-full flex items-center justify-center text-sm font-black">2</span>
                    <div>
                      <p className="text-sm font-bold text-[#1a2935]">Wet</p>
                      <p className="text-sm text-[#8a9aa8] mt-1">Dip the cleaning head into toilet water for 1-2 seconds to activate the cleaner.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#1a3a5c] text-white rounded-full flex items-center justify-center text-sm font-black">3</span>
                    <div>
                      <p className="text-sm font-bold text-[#1a2935]">Scrub</p>
                      <p className="text-sm text-[#8a9aa8] mt-1">Clean the entire bowl with 360deg coverage. The 18-inch reach means no bending over.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#1a3a5c] text-white rounded-full flex items-center justify-center text-sm font-black">4</span>
                    <div>
                      <p className="text-sm font-bold text-[#1a2935]">Release</p>
                      <p className="text-sm text-[#8a9aa8] mt-1">Slide the button forward to eject the pad. No touching, no mess, no odor contact.</p>
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <a href="/#bundles" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] italic text-[#1a3a5c] border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">
                      Ready to try? Shop Now →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="border-b border-[#e5e0da] pb-4">
              <button 
                onClick={() => setOpenSection(openSection === 'specs' ? null : 'specs')}
                className="w-full flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <Ruler size={18} className="text-[#1a3a5c]" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#1a2935] group-hover:text-[#1a3a5c] transition-colors">Product Specifications</span>
                </div>
                <ChevronDown size={18} className={`text-[#b0bcc8] transition-transform ${openSection === 'specs' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'specs' && (
                <div className="mt-4 text-sm text-[#8a9aa8] leading-relaxed space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between border-b border-[#e5e0da]/50 pb-2"><span>Wand Length</span><span className="text-[#1a2935] font-bold">18 Inches</span></div>
                  <div className="flex justify-between border-b border-[#e5e0da]/50 pb-2"><span>Material</span><span className="text-[#1a2935] font-bold">High-Grade ABS</span></div>
                  <div className="flex justify-between border-b border-[#e5e0da]/50 pb-2"><span>Refill Mechanism</span><span className="text-[#1a2935] font-bold">Quick-Release Zero-Touch</span></div>
                  <div className="flex justify-between pb-2"><span>Compatibility</span><span className="text-[#1a2935] font-bold">Clowand 3-Layer Pads Only</span></div>
                </div>
              )}
            </div>

            <div className="border-b border-[#e5e0da] pb-4">
              <button 
                onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                className="w-full flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-[#1a3a5c]" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#1a2935] group-hover:text-[#1a3a5c] transition-colors">Shipping & Returns</span>
                </div>
                <ChevronDown size={18} className={`text-[#b0bcc8] transition-transform ${openSection === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'shipping' && (
                <div className="mt-4 text-sm text-[#8a9aa8] leading-relaxed space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <p>🚀 <span className="text-[#1a2935] font-bold italic">FREE Standard Shipping</span> across the United States. Orders are processed within 24 hours.</p>
                  <p>📦 <span className="text-[#1a2935] font-bold italic">3-5 Day Delivery</span> from our regional warehouses (CA, TX, NJ).</p>
                  <p>🛡️ <span className="text-[#1a2935] font-bold italic">365-Day Satisfaction</span>: If you aren't happy, we'll make it right. No-hassle return policy.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {bullets.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-[#e5e0da]">
          <div className="text-center mb-16">
            <span className="text-[#1a3a5c] font-black uppercase tracking-[0.3em] text-[10px] italic">Premium Hygiene</span>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[#1a2935] mt-4">Advanced Cleaning Tech</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bullets.map((b, i) => (
              <div key={i} className="flex flex-col gap-4 bg-white rounded-[2rem] p-8 border border-[#e5e0da] shadow-sm hover:border-[#1a3a5c]/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#1a3a5c]/10 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white transition-all">
                  <CheckCircle size={20} />
                </div>
                <p className="text-lg font-bold text-[#1a2935] leading-snug">{b}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section id="reviews" className="max-w-6xl mx-auto px-6 py-20 border-t border-[#e5e0da]">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
          <div>
            <span className="text-[#1a3a5c] font-black uppercase tracking-[0.3em] text-[10px] italic">Voice of America</span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mt-4 text-[#1a2935]">Customer Reviews</h2>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-5xl font-semibold tracking-tight text-[#1a2935]">{rating}</p>
              <div className="flex gap-1 text-yellow-400 mt-2 justify-center">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
            </div>
            <div className="w-px h-16 bg-[#e5e0da]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0bcc8] max-w-[100px] leading-relaxed italic">Verified US Purchases Only</p>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="p-10 bg-white rounded-[3rem] border border-[#e5e0da] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                {/* Photo Review Badge */}
                {review.image_url && (
                  <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-[#1a3a5c]" />
                  </div>
                )}
                
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[...Array(review.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>

                {/* UGC Image */}
                {review.image_url && (
                  <div 
                    className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 bg-[#efece8] cursor-zoom-in group/img"
                    onClick={() => setPreviewImage(review.image_url)}
                  >
                    <Image src={review.image_url} fill className="object-cover group-hover/img:scale-105 transition-transform duration-700" alt="Customer Photo" />
                    <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-all" />
                  </div>
                )}

                <p className="text-xl text-[#5a6978] italic font-medium leading-relaxed mb-8">"{review.content}"</p>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#efece8] flex items-center justify-center font-black text-xs text-[#1a3a5c] border border-[#e5e0da] uppercase">
                    {review.author_name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-widest uppercase text-[#1a2935]">{review.author_name || 'Verified Buyer'}</h4>
                    <p className="text-[10px] text-[#b0bcc8] font-bold uppercase tracking-widest mt-1">{review.author_location || 'United States'} • {new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-[#e5e0da]">
            <p className="text-[#b0bcc8] font-black tracking-widest uppercase text-xs">Be the first to review this product!</p>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <span className="text-[#1a3a5c] font-black uppercase tracking-[0.3em] text-[10px] italic">You Might Also Like</span>
              <div className="flex-1 h-px bg-[#e5e0da]" />
            </div>
            <RelatedProducts
              products={relatedProducts}
              onProductClick={(pid) => router.push(`/products/${pid}`)}
            />
          </div>
        </section>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 animate-in fade-in duration-300">
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 text-white hover:text-[#1a3a5c] transition-colors">
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
