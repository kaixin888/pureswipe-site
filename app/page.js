'use client'
// VERSION: 6.6.13-PHASE-E-FINAL-POLISH

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { useCart } from 'react-use-cart'
import { useStore } from '../components/Providers'


import { 
  Play, ShieldCheck, Zap, Droplets, CheckCircle, Package, CreditCard, 
  Truck, Globe, X, Search, MapPin, Star, AlertCircle, ThumbsUp, 
  ChevronDown, Trash2, Recycle, Droplet, Sparkles, Ruler, Shield, RefreshCw,
  Mail, Phone
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

const TRANSLATIONS = {
  en: {
    heroTitle: "The End of the Dirty Toilet Brush.",
    heroSub: "Never Touch the Mess Again.",
    shopBundles: "Start My Clean Journey",
    freeShipping: "Free Shipping Across USA",
    features: "Features",
    bundles: "Select Your System",
    saveUpTo: "Save Up to 40% with bulk packs",
    zeroTouchTitle: "Zero Contact",
    zeroTouchDesc: "Attach and release with a single click. Your hands never touch the dirty water.",
    handleTitle: "18\" Long Reach",
    handleDesc: "Industry-leading length keeps you at a safe distance. No more bending over.",
    padTitle: "3-Layer Power Pad",
    padDesc: "Scrub, disinfect, and protect with our reinforced 3-layer scouring technology.",
    mostPopular: "Most Popular",
    checkout: "Checkout",
    payNow: "Pay Now",
    success: "Success!",
    trackTitle: "Track Order",
    trackInput: "Enter Order ID",
    trackBtn: "Track"
  }
}

const BUNDLES = [
  {
    id: 'starter',
    name: 'Starter Kit',
    price: 19.99,
    description: 'Perfect for beginners',
    image: '/images/hero.jpg',
    items: ['1x 18" Anti-Splash Wand', '1x Ventilated Caddy', '12x Single-Use Fresh Ocean Refill Pads'],
    tag: 'Start Here'
  },
  {
    id: 'family',
    name: 'Family Value Pack',
    price: 34.99,
    description: 'BEST VALUE & RESULTS',
    image: '/images/wand-box.jpg',
    items: ['1x 18" Anti-Splash Wand', '1x Ventilated Caddy', '36x Mixed Scent Single-Use Refill Pads'],
    tag: 'Best Seller',
    popular: true
  },
  {
    id: 'eco-refill',
    name: 'Eco Refill Box',
    price: 24.99,
    description: 'Stock up & Save',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    items: ['48x Extra-Strength Single-Use Refill Pads', 'Recyclable Eco-Packaging', 'Compatible with all Wands'],
    tag: 'Eco Friendly'
  }
]

const REVIEWS = [
  { name: "Sarah J.", location: "Houston, TX", comment: "Finally, a toilet brush that doesn't gross me out! The 18-inch handle is a game-changer. I don't have to get anywhere near the bowl. Love the zero-touch release!", rating: 5 },
  { name: "Mike R.", location: "New York, NY", comment: "Best purchase for my new apartment. The caddy is well-ventilated so it stays dry. The pads really scrub off the tough stains without scratching.", rating: 5 },
  { name: "Linda W.", location: "Chicago, IL", comment: "The 'no-return' refund policy gave me the confidence to try it. But I'm keeping it! It's much more hygienic than those traditional brushes.", rating: 5 },
  { name: "Robert D.", location: "Miami, FL", comment: "I have back issues, and the extra-long handle means I don't have to bend down as much. Very sturdy and professional feel.", rating: 5 },
  { name: "Jessica M.", location: "Seattle, WA", comment: "One box lasts me almost a year with the 48 refills. Great value and it actually cleans better than the soap-dispensing brushes I've used before.", rating: 5 },
  { name: "David K.", location: "Denver, CO", comment: "Super easy to use. Click on, clean, click off. No mess, no dripping on the floor. Highly recommend for busy families.", rating: 5 },
  { name: "Karen L.", location: "Atlanta, GA", comment: "The pads have a lot of cleaning agent in them. One pad is enough for a deep clean. My bathroom smells like the ocean now!", rating: 5 },
  { name: "Thomas B.", location: "Boston, MA", comment: "A bit skeptical at first, but the quality of the wand is top-notch. It's solid, not flimsy like the ones you find at the supermarket.", rating: 5 },
  { name: "Jennifer S.", location: "San Francisco, CA", comment: "Excellent customer service. I had a question about the refills and they replied within minutes. Great product, even better team.", rating: 5 },
  { name: "Steven P.", location: "Phoenix, AZ", comment: "Love that it's designed for US standards. Fits perfectly under the rim. Makes a chore I hate a lot less disgusting.", rating: 5 }
]

const FAQ = [
  { q: "How does free shipping work?", a: "We offer free standard shipping (3-5 business days) on all bundles across the continental USA. Tracking is provided via email once your order ships." },
  { q: "What is your return policy?", a: "We offer a 100% Satisfaction Guarantee. If you're not happy with clowand, we'll provide a full refund—no need to ship used products back. Your hygiene and convenience are our priority." },
  { q: "Are the refill pads environmentally friendly?", a: "Yes! Our refills are made from biodegradable materials and the packaging is 100% recyclable. Clean your home without the guilt." },
  { q: "Will the pads work on my toilet?", a: "Clowand is designed to reach deep under the rim and into the trap, making it effective for 99% of toilet designs including low-flow models." },
  { q: "How many uses per disposable pad?", a: "Each refill pad is single-use for maximum hygiene. It contains enough concentrated cleaning agent for one thorough, deep clean." }
]

function TrustBarItems() {
  return (
    <div className="flex gap-16 items-center px-8 uppercase text-[10px] font-black italic tracking-widest shrink-0">
      <span className="flex items-center gap-2"><Truck size={14} /> Free USA Shipping</span>
      <span className="flex items-center gap-2"><ShieldCheck size={14} /> Verified Quality</span>
      <span className="flex items-center gap-2"><RefreshCw size={14} /> 100% Satisfaction Guarantee</span>
      <span className="flex items-center gap-2"><Star size={14} /> 50k+ Happy Customers</span>
    </div>
  );
}

function BeforeAfterSlider() {
  const [split, setSplit] = React.useState(50)
  const [animated, setAnimated] = React.useState(false)
  const sliderRef = React.useRef(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated) {
        setAnimated(true)
        setSplit(30)
        setTimeout(() => setSplit(50), 700)
      }
    }, { threshold: 0.3 })
    if (sliderRef.current) observer.observe(sliderRef.current)
    return () => observer.disconnect()
  }, [animated])

  const beforeItems = ['Bacteria builds up', 'Drips on your floor', 'Must touch the bowl', 'Needs a holder']
  const afterItems = ['Touch-free design', 'Disposable heads', '18-inch reach', 'No holder needed']

  return (
    <div ref={sliderRef} className="relative aspect-[4/5] md:aspect-video rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group shadow-2xl">
      {/* After Image (Top) */}
      <div className="absolute inset-0 bg-blue-50">
        <Image src="/images/hero.jpg" fill className="object-cover" alt="After" />
        <div className="absolute top-8 right-8 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">The clowand Way</div>
        
        {/* After Benefits */}
        <div className="absolute bottom-8 right-8 space-y-2">
          {afterItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 justify-end">
              <span className="text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md">{item}</span>
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle size={10} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before Image (Bottom, clipped) */}
      <div className="absolute inset-0 grayscale contrast-125" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
        <Image src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200" fill className="object-cover" alt="Before" />
        <div className="absolute top-8 left-8 bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Traditional Method</div>
        
        {/* Before Issues */}
        <div className="absolute bottom-8 left-8 space-y-2">
          {beforeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle size={10} className="text-red-500" />
              </div>
              <span className="text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slider Handle */}
      <div className="absolute inset-y-0" style={{ left: `${split}%`, zIndex: 10 }}>
        <div className="absolute inset-y-0 w-1 bg-white shadow-2xl transform -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-col-resize group-active:scale-90 transition-transform">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-slate-200 rounded-full" />
            <div className="w-1 h-4 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Transparent range input */}
      <input
        type="range" min="10" max="90" value={split}
        onChange={e => setSplit(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize"
        style={{ zIndex: 20 }}
      />
    </div>
  )
}
function TrustBar() {
  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden relative z-10">
      <div className="flex animate-marquee w-max">
        <TrustBarItems />
        <TrustBarItems aria-hidden="true" />
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const { addItem, cartTotal, items, emptyCart } = useCart()
  const { setIsCheckoutOpen } = useStore()
  const [lang, setLang] = useState('en')


  const [activeFaq, setActiveFaq] = useState(null)
  const [trackId, setTrackId] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [isExitPopupOpen, setIsExitPopupOpen] = useState(false)
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [bundles, setBundles] = useState(BUNDLES)




  const [reviews, setReviews] = useState([])
  const [faqs, setFaqs] = useState([])
  const [siteSettings, setSiteSettings] = useState({})
  const [videoIndex, setVideoIndex] = useState(0)

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  // Fetch active products from Supabase — falls back to hardcoded BUNDLES if table empty
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, sale_price, description, image_url, stock, status, tag, popular, bullets')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
      
      if (!error && data && data.length > 0) {
        const mapped = data.map((p) => {
          let bullets = []
          try { bullets = JSON.parse(p.bullets || '[]') } catch (e) {}
          return {
            id: String(p.id),
            name: p.name,
            price: Number(p.price),
            sale_price: p.sale_price != null ? Number(p.sale_price) : null,
            description: p.description || '',
            image: p.image_url || '/images/hero.jpg',
            items: bullets,
            tag: p.tag || '',
            popular: !!p.popular,
            stock: p.stock != null ? p.stock : 999,
          }
        })
        setBundles(mapped)
      }
      // If table empty or error → keep BUNDLES fallback (no action needed)
    }
    fetchProducts()
  }, [])

  // Fetch published reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id,author_name,author_location,rating,content,ugc_image_url,is_published,created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(9)
      if (!error && data && data.length > 0) setReviews(data)
    }
    fetchReviews()
  }, [])

  // Fetch published FAQs from Supabase
  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('id,question,answer,is_published,created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
      if (!error && data && data.length > 0) setFaqs(data)
    }
    fetchFaqs()
  }, [])

  // Fetch site settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key,value')
      if (!error && data) {
        const s = {}
        data.forEach(item => s[item.key] = item.value)
        setSiteSettings(s)
      }
    }
    fetchSettings()
  }, [])

  // Exit popup logic
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !isExitPopupOpen && !isSubscribed) {
        setIsExitPopupOpen(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [isExitPopupOpen, isSubscribed])

  const scrollIntoView = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email: subscriberEmail }])
    
    setIsSubmitting(false)
    if (!error) {
      setIsSubscribed(true)
      setTimeout(() => setIsExitPopupOpen(false), 5000)
    }
  }

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!trackId) return
    const { data, error } = await supabase
      .from('orders')
      .select('status,tracking_number,shipping_carrier')
      .eq('id', trackId)
      .single()
    if (data) setTrackResult(data)
    else setTrackResult({ error: true })
  }

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Mobile Hero */}
      <section className="md:hidden relative w-full overflow-hidden min-h-[70vh] flex flex-col">
        <video
          key={videoIndex}
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster="/images/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={() => setVideoIndex(v => (v + 1) % 2)}
        >
          <source src={videoIndex === 0 ? "https://media.clowand.com/videos/product-wand.mp4" : "https://media.clowand.com/videos/product-lid.mp4"} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        {/* Video indicator dots */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {[0,1].map(i => (
            <button
              key={i}
              onClick={() => setVideoIndex(i)}
              className={"w-2 h-2 rounded-full transition-all " + (videoIndex === i ? "bg-white scale-125" : "bg-white/40")}
            />
          ))}
        </div>
        <div className="relative flex-1 flex flex-col justify-end px-6 pb-12 pt-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-fit border border-white/30">
            {siteSettings.hero_badge || "2026 Hygiene Revolution"}
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter leading-tight uppercase text-white mt-6 mb-8 py-2 overflow-visible">
            {siteSettings.hero_title || t.heroTitle}
          </h1>
          <p className="text-sm text-white/80 mb-8 leading-relaxed max-w-[280px]">
            {siteSettings.hero_subtitle || t.heroSub}
          </p>
          <button
            onClick={() => scrollIntoView('bundles')}
            className="w-full bg-black text-white rounded-full py-5 text-sm font-bold uppercase tracking-widest active:scale-[0.98] transition-transform shadow-xl"
          >
            {t.shopBundles}
          </button>
        </div>
      </section>

      {/* Desktop Hero */}
      <section className="hidden md:block relative h-screen w-full overflow-hidden">
        <video
          key={videoIndex + "-desktop"}
          autoPlay
          muted
          loop={false}
          playsInline
          preload="metadata"
          poster="/images/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={() => setVideoIndex(v => (v + 1) % 2)}
        >
          <source src={videoIndex === 0 ? "https://media.clowand.com/videos/product-wand.mp4" : "https://media.clowand.com/videos/product-lid.mp4"} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/40 to-transparent" />
        <div className="relative h-full container mx-auto px-12 flex flex-col justify-center max-w-7xl">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-600/10 border border-blue-600/20 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-10 w-fit backdrop-blur-md">
            <Sparkles size={14} className="animate-pulse" />
            {siteSettings.hero_badge || "2026 Hygiene Revolution"}
          </div>
          <h1 className="text-6xl lg:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase text-slate-950 mt-12 mb-8 py-2 overflow-visible">
            {siteSettings.hero_title || t.heroTitle}
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-xl leading-relaxed font-medium">
            {siteSettings.hero_subtitle || t.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={() => scrollIntoView('bundles')}
              className="bg-slate-950 text-white px-12 py-6 rounded-full text-sm font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3 group"
            >
              {t.shopBundles}
              <Zap size={18} className="text-blue-400 group-hover:animate-bounce" />
            </button>
            <div className="flex items-center gap-4 px-6">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                    <Image src={`https://i.pravatar.cc/100?img=${i+10}`} width={40} height={40} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-tight">
                Trusted by<br/><span className="text-slate-900">50,000+ Houses</span>
              </div>
            </div>
          </div>
        </div>
        {/* Video switcher */}
        <div className="absolute bottom-12 right-12 flex gap-3">
          {[0,1].map(i => (
            <button
              key={i}
              onClick={() => setVideoIndex(i)}
              className={"w-16 h-1 rounded-full transition-all " + (videoIndex === i ? "bg-blue-600" : "bg-slate-300")}
            />
          ))}
        </div>
      </section>

      <TrustBar />

      {/* Core Features - Bento Style */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[11px] italic">Engineering Excellence</span>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mt-4 text-slate-950 leading-[0.85] py-10 overflow-visible">Built for the <br/>Modern Bathroom</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {/* Feature 1: Large Reach */}
            <div className="md:col-span-8 bg-white rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-16 flex flex-col justify-between group hover:shadow-2xl transition-all border border-slate-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <Ruler size={28} />
                </div>
                <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-950 mb-6 py-4 overflow-visible">{t.handleTitle}</h3>
                <p className="text-slate-500 text-lg max-w-md leading-relaxed">{t.handleDesc}</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-5 pointer-events-none">
                <Ruler size={400} className="rotate-12 transform translate-x-20 translate-y-20" />
              </div>
            </div>

            {/* Feature 2: Zero Touch */}
            <div className="md:col-span-4 bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-10 flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                  <Zap size={28} />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-4 py-4 overflow-visible">{t.zeroTouchTitle}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{t.zeroTouchDesc}</p>
              </div>
            </div>

            {/* Feature 3: Power Pad */}
            <div className="md:col-span-4 bg-blue-600 rounded-[2.5rem] md:rounded-[3rem] p-10 flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                  <Droplets size={28} />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-4 py-4 overflow-visible">{t.padTitle}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{t.padDesc}</p>
              </div>
            </div>

            {/* Feature 4: Hybrid Info */}
            <div className="md:col-span-8 bg-white rounded-[2.5rem] md:rounded-[3rem] p-10 flex items-center gap-12 group hover:shadow-2xl transition-all border border-slate-100">
              <div className="flex-1">
                <div className="flex gap-2 mb-6">
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-blue-600 text-blue-600" />)}
                </div>
                <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-slate-950 mb-4 py-4 overflow-visible">Verified Hygiene</h3>
                <p className="text-slate-500 leading-relaxed">99.9% of users report feeling significantly more hygienic compared to traditional brushes.</p>
              </div>
              <div className="hidden md:flex flex-1 gap-4">
                <div className="flex-1 aspect-square bg-slate-50 rounded-3xl flex items-center justify-center p-8">
                  <ShieldCheck size={48} className="text-blue-600" />
                </div>
                <div className="flex-1 aspect-square bg-slate-50 rounded-3xl flex items-center justify-center p-8">
                  <ThumbsUp size={48} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <BeforeAfterSlider />
            <div className="space-y-10">
              <div>
                <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[11px] italic">The Problem & The Solution</span>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mt-4 text-slate-950 leading-[0.85] py-10 overflow-visible">Why households <br/>are switching.</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                Traditional toilet brushes are bacterial breeding grounds. They stay wet, drip on your floors, and require you to get uncomfortably close to the waste.
              </p>
              <div className="space-y-6">
                {[
                  { icon: <Shield size={20} />, title: "Antimicrobial Storage", desc: "Ventilated caddy prevents bacterial growth." },
                  { icon: <Droplet size={20} />, title: "Pre-Loaded Cleaner", desc: "Pads contain heavy-duty disinfecting agents." },
                  { icon: <Recycle size={20} />, title: "Eco-Conscious", desc: "Biodegradable heads and recyclable wands." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black italic tracking-tighter uppercase text-slate-950 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Select Your System - Bento Grid */}
      <section id="bundles" className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-600/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <span className="text-blue-400 font-black uppercase tracking-[0.3em] text-[11px] italic">Select Your System</span>
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mt-4 text-white leading-[0.85] py-10 overflow-visible">Ready for <br/>Better Hygiene?</h2>
            <p className="text-slate-400 mt-8 font-medium tracking-wide">{t.saveUpTo}</p>
          </div>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
            {bundles.map((bundle, i) => (
              <div 
                key={bundle.id}
                className={
                  "group relative bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col hover:shadow-[0_0_80px_rgba(37,99,235,0.2)] transition-all duration-300 border border-white/10 " +
                  (i === 0 ? "md:col-span-2 md:flex-row md:min-h-[600px]" : "md:col-span-1")
                }
              >
                {/* Popular Badge */}
                {bundle.popular && (
                  <div className="absolute top-8 left-8 z-30 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Star size={12} className="fill-white" />
                    {t.mostPopular}
                  </div>
                )}

                {/* Image Container */}
                <div className={"relative " + (i === 0 ? "md:w-3/5" : "aspect-[4/5]")}>
                  <Image 
                    src={bundle.image} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={bundle.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />
                  
                  {/* Tag on Image for mobile/smaller cards */}
                  {bundle.tag && i !== 0 && (
                    <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {bundle.tag}
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className={
                  "relative z-10 flex flex-col flex-1 " + 
                  (i === 0 ? "p-8 md:p-16 md:justify-center" : "p-8 md:p-10")
                }>
                  <div className="mb-auto">
                    {bundle.tag && i === 0 && (
                      <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic mb-4 block">
                        {bundle.tag}
                      </span>
                    )}
                    <h3 className={
                      "font-black italic tracking-tighter uppercase text-slate-950 mt-2 mb-4 py-2 overflow-visible " +
                      (i === 0 ? "text-4xl md:text-6xl" : "text-3xl")
                    }>
                      {bundle.name}
                    </h3>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                      {bundle.description}
                    </p>
                    
                    <ul className="space-y-3 mb-10">
                      {(bundle.items || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                          <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        {mounted ? (
                          <>
                            {(() => {
                              const sp = bundle.sale_price
                              const onSale = sp != null && Number(sp) > 0 && Number(sp) < Number(bundle.price)
                              const display = onSale ? Number(sp) : Number(bundle.price)
                              return (
                                <>
                                  <span className="text-4xl font-black italic tracking-tighter text-slate-950">
                                    ${display.toFixed(2)}
                                  </span>
                                  {onSale && (
                                    <span className="text-lg font-bold text-slate-300 line-through decoration-slate-400">
                                      ${Number(bundle.price).toFixed(2)}
                                    </span>
                                  )}
                                </>
                              )
                            })()}
                          </>
                        ) : (
                           <span className="text-4xl font-black italic tracking-tighter text-slate-950">
                            ${Number(bundle.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Free USA Shipping Included</span>
                    </div>
                    <button 
                      onClick={() => {
                        addItem(bundle)
                        setIsCheckoutOpen(true)
                      }}
                      className="bg-blue-600 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-950 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[11px] italic">Wall of Hygiene</span>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mt-4 text-slate-950 leading-[0.85] py-10 overflow-visible">What the <br/>Hygiene Club says.</h2>
            </div>
            <div className="flex items-center gap-4 bg-white px-8 py-6 rounded-[2rem] shadow-xl border border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-black italic tracking-tighter text-slate-950">4.9/5.0</div>
                <div className="flex gap-1 justify-center mt-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-blue-600 text-blue-600" />)}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-100 mx-4" />
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Based on 1,240+<br/>Verified Reviews</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(reviews.length > 0 ? reviews : REVIEWS.slice(0, 6)).map((review, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(j => (
                      <Star key={j} size={14} className={j <= review.rating ? "fill-blue-600 text-blue-600" : "text-slate-200"} />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium mb-8 italic">"{review.comment || review.content}"</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div>
                    <div className="font-black italic tracking-tighter uppercase text-slate-950 text-sm">{review.name || review.author_name}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{review.location || review.author_location}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircle size={14} className="text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[11px] italic">Common Questions</span>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mt-4 text-slate-950 py-10 overflow-visible">Everything else.</h2>
          </div>
          
          <div className="space-y-4">
            {(faqs.length > 0 ? faqs : FAQ).map((faq, i) => (
              <div 
                key={i} 
                className="group bg-slate-50 rounded-3xl overflow-hidden border border-transparent hover:border-blue-600/20 transition-all"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="font-black italic tracking-tighter uppercase text-slate-950 text-lg">{faq.q || faq.question}</span>
                  <div className={"w-8 h-8 rounded-full bg-white flex items-center justify-center transition-transform " + (activeFaq === i ? "rotate-180" : "")}>
                    <ChevronDown size={18} className="text-slate-400" />
                  </div>
                </button>
                <div className={"overflow-hidden transition-all duration-300 " + (activeFaq === i ? "max-h-96" : "max-h-0")}>
                  <div className="px-8 pb-8 text-slate-500 leading-relaxed text-sm">
                    {faq.a || faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-4 space-y-8">
              <div className="text-2xl font-black italic tracking-tighter uppercase tracking-widest">CLOWAND</div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Premium US bathroom hygiene system. Designed for distance, built for speed.
              </p>
              <div className="flex gap-4">
                {[Mail, Phone].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all cursor-pointer">
                    <Icon size={18} />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h5 className="font-black italic tracking-tighter uppercase text-xs mb-8 tracking-[0.2em] text-blue-400">Shop</h5>
                <ul className="space-y-4 text-sm font-medium text-slate-400">
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => scrollIntoView('bundles')}>Starter Kits</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => scrollIntoView('bundles')}>Refill Packs</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => scrollIntoView('bundles')}>Family Sets</li>
                </ul>
              </div>
              <div>
                <h5 className="font-black italic tracking-tighter uppercase text-xs mb-8 tracking-[0.2em] text-blue-400">Support</h5>
                <ul className="space-y-4 text-sm font-medium text-slate-400">
                  <li className="hover:text-white cursor-pointer transition-colors">Shipping Policy</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Refund Policy</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h5 className="font-black italic tracking-tighter uppercase text-xs mb-8 tracking-[0.2em] text-blue-400">Track Order</h5>
                <form onSubmit={handleTrack} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="ORDER ID" 
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-blue-600 transition-colors"
                    />
                    <button type="submit" className="absolute right-2 top-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                      <Search size={16} />
                    </button>
                  </div>
                  {trackResult && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2">
                      {trackResult.error ? (
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Order not found</p>
                      ) : (
                        <div>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">{trackResult.status}</p>
                          <p className="text-[8px] text-slate-500 font-medium">{trackResult.shipping_carrier}: {trackResult.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              © 2026 CLOWAND. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6 grayscale opacity-40">
              <CreditCard size={24} />
              <Package size={24} />
              <Shield size={24} />
            </div>
          </div>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      {isExitPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsExitPopupOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden group">
            <button 
              onClick={() => setIsExitPopupOpen(false)}
              className="absolute top-6 right-6 p-3 hover:bg-slate-50 rounded-full transition-all text-slate-300 hover:text-slate-950"
            >
              <X size={20} />
            </button>
            
            <div className="p-12 text-center">
              <div className="mb-8">
                <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Exclusive Offer</span>
                                                                <h2 className="text-4xl font-black italic tracking-tighter uppercase mt-4 text-slate-950 leading-[1.4] py-10 overflow-visible">WAIT! Don't leave your<br/>hygiene to chance.</h2>
              </div>

              {!isSubscribed ? (
                <>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic mb-2">Get 10% OFF your first clowand system today.</p>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic mb-8">Join 5,000+ households choosing zero-touch cleaning.</p>
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <input 
                      type="email" 
                      required
                      placeholder="ENTER YOUR EMAIL"
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-center"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Authenticating...' : 'Unlock 10% Off'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-8 animate-in zoom-in duration-500">
                  <p className="text-2xl font-black italic tracking-tighter text-emerald-600 uppercase mb-2">Welcome to the Club</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic mb-6">Your code: <span className="bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">CLOWAND10</span></p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Check your inbox for details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 animate-in fade-in duration-300">
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
