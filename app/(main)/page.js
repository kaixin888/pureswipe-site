'use client'

import React, { useState, useEffect, Fragment } from 'react'
import { createClient } from '@supabase/supabase-js'

import { 
  Play, ShieldCheck, Zap, Droplets, CheckCircle, Package, CreditCard, 
  Truck, Globe, X, Search, MapPin, Star, AlertCircle, ThumbsUp, 
  ChevronDown, Trash2, Recycle, Droplet, Sparkles, Ruler, Shield, RefreshCw,
  Mail, Phone
} from 'lucide-react'

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

const TRANSLATIONS = {
  en: {
    heroTitle: "Clean Smarter, Not Harder.",
    heroSub: "The 18-inch hygienic revolution for your bathroom. Triple action pads, zero-touch mechanism. Hassle-Free No-Return Refund.",
    shopBundles: "Shop Bundles",
    freeShipping: "Free Shipping Across USA",
    features: "Features",
    bundles: "Choose Your Bundle",
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
    items: ['1x 18" Anti-Splash Wand', '1x Ventilated Caddy', '12x Fresh Ocean Refills'],
    tag: 'Start Here'
  },
  {
    id: 'family',
    name: 'Family Value Pack',
    price: 34.99,
    description: 'BEST VALUE & RESULTS',
    image: '/images/wand-box.jpg',
    items: ['1x 18" Anti-Splash Wand', '1x Ventilated Caddy', '36x Mixed Scents Refills'],
    tag: 'Best Seller',
    popular: true
  },
  {
    id: 'eco-refill',
    name: 'Eco Refill Box',
    price: 24.99,
    description: 'Stock up & Save',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    items: ['48x Extra-Strength Refills', 'Recyclable Eco-Packaging', 'Compatible with all Wands'],
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
  { q: "How many uses do I get per pad?", a: "Each pad is single-use for maximum hygiene. It contains enough concentrated cleaning agent for one thorough, deep clean." }
]

function TrustBar() {
  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden whitespace-nowrap relative z-10">
      <div className="flex animate-marquee gap-8 items-center px-4 uppercase text-[10px] font-black italic tracking-widest">
        {[...Array(20)].map((_, i) => (
          <Fragment key={i}>
            <Truck size={14} /> Free USA Shipping
            <ShieldCheck size={14} /> Verified Quality
            <RefreshCw size={14} /> 100% Satisfaction Guarantee
            <Star size={14} /> 50k+ Happy Customers
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [lang, setLang] = useState('en')
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [activeFaq, setActiveFaq] = useState(null)
  const [trackId, setTrackId] = useState('')
  const [trackResult, setTrackResult] = useState(null)

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  useEffect(() => {
    const trackVisitor = async () => {
      const sessionKey = 'clowand_visitor_active'
      if (!sessionStorage.getItem(sessionKey)) {
        await supabase.from('site_stats').insert([{ 
          type: 'visitor', 
          session_id: Math.random().toString(36).substring(7)
        }])
        sessionStorage.setItem(sessionKey, 'true')
      }
    }
    trackVisitor()
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=AS_UeNNIxUa4S2p8E-H9-p3S2E9p8S2E9p8S2E9p8S2E9p8S2E9p8S2E9p8S2E9p8S2E9p8S2E9p8S2E9p8S2E9p8S&currency=USD&disable-funding=credit,card`
    script.addEventListener('load', () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: selectedBundle.price.toString() },
                description: selectedBundle.name
              }]
            })
          },
          onApprove: async (data, actions) => {
            setPaymentStatus('processing')
            const order = await actions.order.capture()
            
            const shipping = order.purchase_units[0].shipping
            const address = shipping.address
            const phone = order.payer.phone?.phone_number?.national_number || ''
            
            await supabase.from('orders').insert([{
              order_id: `CW-${order.id.slice(-6)}`,
              customer_name: order.payer.name.given_name + ' ' + order.payer.name.surname,
              email: order.payer.email_address,
              phone: phone,
              amount: selectedBundle.price,
              product_name: selectedBundle.name,
              status: 'Paid',
              shipping_address: address.address_line_1 + (address.address_line_2 ? ', ' + address.address_line_2 : ''),
              shipping_city: address.admin_area_2,
              shipping_state: address.admin_area_1,
              shipping_zip: address.postal_code,
              shipping_country: address.country_code
            }])
            
            setPaymentStatus('success')
            setTimeout(() => {
              setSelectedBundle(null)
              setPaymentStatus('idle')
            }, 5000)
          }
        }).render('#paypal-button-container')
      }
    })
    if (selectedBundle) {
      document.body.appendChild(script)
    }
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [selectedBundle])

  const handleTrack = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', trackId.startsWith('CW-') ? trackId : `CW-${trackId}`)
      .single()
    
    if (data) setTrackResult(data)
  }

  const scrollIntoView = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Hero */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[160px] opacity-60"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24 relative">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm border border-blue-100">
              <Zap size={14} /> 2026 Hygiene Revolution
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase mb-10 text-slate-950">
              {t.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-bold mb-12 max-w-xl italic leading-relaxed">
              {t.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => scrollIntoView('bundles')}
                className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
              >
                {t.shopBundles}
              </button>
              <div className="flex items-center gap-6 px-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow-sm overflow-hidden"><img src={`https://i.pravatar.cc/40?u=${i}`} alt="user" /></div>)}
                </div>
                <div>
                  <div className="flex text-blue-600 gap-1"><Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">50k+ Happy Users</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="aspect-square bg-slate-50 rounded-[5rem] overflow-hidden relative border border-slate-100 shadow-2xl group">
               <img src="/images/hero.jpg" className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-110 transition-all duration-1000 group-hover:grayscale-0" alt="product" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"></div>
               <div className="absolute bottom-12 left-12 p-8 bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl flex items-center gap-6 max-w-xs animate-float">
                  <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg"><Ruler size={32} /></div>
                  <div>
                    <h4 className="font-black text-xl italic tracking-tighter uppercase leading-none mb-1">18" Shield</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Industry Leading Reach</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Bento Features */}
      <section id="features" className="py-40 bg-slate-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
             <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">The Tech</span>
             <h2 className="text-5xl font-black italic tracking-tighter uppercase mt-6 text-slate-950 leading-none">Hygiene 2.0 Engineering</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative group overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Droplet size={32} />
                </div>
                <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-slate-900">{t.zeroTouchTitle}</h3>
                <p className="text-lg font-bold text-slate-400 italic max-w-md leading-relaxed">{t.zeroTouchDesc}</p>
              </div>
              <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" className="absolute top-0 right-0 h-full w-1/2 object-cover grayscale opacity-10 group-hover:opacity-100 transition-all duration-1000 group-hover:grayscale-0 pointer-events-none" />
            </div>
            
            <div className="md:col-span-4 bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col justify-end relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 text-white/10 group-hover:scale-150 transition-all duration-1000"><Shield size={200} /></div>
               <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">{t.handleTitle}</h3>
               <p className="text-sm font-bold text-slate-400 italic leading-relaxed">{t.handleDesc}</p>
            </div>

            <div className="md:col-span-4 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm group">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-slate-900">Triple Action</h3>
                <p className="text-sm font-bold text-slate-400 italic leading-relaxed">Scrub, Disinfect, Protect. All in one disposable pad.</p>
            </div>

            <div className="md:col-span-8 bg-blue-600 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-12 group overflow-hidden">
               <div className="flex-1">
                 <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none">Biodegradable Pads</h3>
                 <p className="text-lg font-bold text-blue-100 italic leading-relaxed">Eco-friendly materials that don't compromise on cleaning power.</p>
               </div>
               <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-3xl group-hover:scale-125 transition-all duration-1000">
                  <Recycle size={80} />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
               <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-10 text-slate-950 leading-none">Stop Touching<br/>the Grime.</h2>
               <div className="space-y-10">
                  <div className="flex gap-8 items-start">
                    <div className="p-4 bg-red-50 rounded-full text-red-500 flex-shrink-0"><X size={20} /></div>
                    <div>
                      <h4 className="font-black italic tracking-tighter uppercase text-lg mb-2">Old Brushes</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic leading-relaxed">Traps bacteria in bristles, short handles cause splashes, unhygienic storage.</p>
                    </div>
                  </div>
                  <div className="flex gap-8 items-start">
                    <div className="p-4 bg-emerald-50 rounded-full text-emerald-500 flex-shrink-0"><CheckCircle size={20} /></div>
                    <div>
                      <h4 className="font-black italic tracking-tighter uppercase text-lg mb-2 text-emerald-600">clowand System</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic leading-relaxed">Zero-touch release, 18" splash-guard reach, single-use power pads.</p>
                    </div>
                  </div>
               </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-slate-950 rounded-[4rem] overflow-hidden flex items-center justify-center">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover opacity-60 mix-blend-screen scale-125 grayscale"
                >
                  <source src="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-video.mp4?v=1631526367" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-950 shadow-2xl animate-pulse cursor-pointer">
                      <Play size={32} className="ml-2" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section id="bundles" className="py-40 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-40 -mt-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-32">
             <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Exclusive Deals</span>
             <h2 className="text-6xl font-black italic tracking-tighter uppercase mt-6 text-white leading-none">{t.bundles}</h2>
             <p className="text-blue-200/40 font-bold italic mt-4">{t.saveUpTo}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {BUNDLES.map(bundle => (
              <div 
                key={bundle.id}
                className={`group relative p-1 rounded-[5rem] transition-all duration-500 hover:-translate-y-4 ${bundle.popular ? 'bg-blue-600 scale-105 shadow-3xl shadow-blue-600/40 border-none' : 'bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10'}`}
              >
                {bundle.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest italic rounded-full shadow-2xl">
                    {t.mostPopular}
                  </div>
                )}
                
                <div className="bg-white rounded-[5rem] p-12 h-full flex flex-col">
                  <div className="aspect-[4/3] rounded-[3rem] overflow-hidden mb-10 bg-slate-50 border border-slate-100">
                    <img src={bundle.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={bundle.name} />
                  </div>
                  
                  <div className="mb-10">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-slate-900">{bundle.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black italic tracking-tighter text-blue-600">${bundle.price}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">USD</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-6 mb-16 flex-1">
                    {bundle.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                        <CheckCircle size={16} className="text-blue-600" /> {item}
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => setSelectedBundle(bundle)}
                    className="w-full py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-slate-950 text-white hover:bg-blue-600 shadow-2xl active:scale-95"
                  >
                    Buy {bundle.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-40 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
             <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Social Proof</span>
             <h2 className="text-5xl font-black italic tracking-tighter uppercase mt-6 text-slate-950 leading-none">Customer Voices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {REVIEWS.map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:-translate-y-2 transition-transform duration-500">
                <div>
                  <div className="flex text-blue-600 gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic leading-relaxed mb-6">"{review.comment}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-50 overflow-hidden"><img src={`https://i.pravatar.cc/32?u=${review.name}`} alt={review.name} /></div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900">{review.name}</h4>
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-24">
          <div className="flex-1 relative">
            <div className="aspect-[3/4] rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale" alt="about clowand" />
            </div>
            <div className="absolute -bottom-10 -right-10 p-12 bg-blue-600 text-white rounded-[3rem] shadow-2xl animate-float">
               <Shield size={64} className="opacity-20 absolute top-4 right-4" />
               <p className="text-4xl font-black italic tracking-tighter uppercase">EST. 2026</p>
               <p className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Boston, MA</p>
            </div>
          </div>
          <div className="flex-1 space-y-10">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Our Story</span>
            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.9] text-slate-950">Engineering<br/>a Cleaner<br/>Life.</h2>
            <p className="text-xl font-bold italic text-slate-400 leading-relaxed uppercase tracking-widest">
              Clowand was born out of a simple frustration: why are traditional toilet brushes so disgusting? We spent months engineering the perfect solution for the modern American home. Based in the USA, we are committed to quality, convenience, and a cleaner way of life.
            </p>
            <div className="grid grid-cols-2 gap-12 pt-10 border-t border-slate-100">
               <div>
                 <p className="text-3xl font-black italic tracking-tighter text-slate-950">100%</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 italic">US Based Support</p>
               </div>
               <div>
                 <p className="text-3xl font-black italic tracking-tighter text-slate-950">FREE</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 italic">Nationwide Shipping</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-40 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-32">
             <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Customer Service</span>
             <h2 className="text-5xl font-black italic tracking-tighter uppercase mt-6 text-slate-950 leading-none">Frequently Asked</h2>
          </div>
          
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-10 py-8 flex justify-between items-center text-left"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest italic">{item.q}</span>
                  <ChevronDown className={`transition-all ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-10 pb-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-loose border-t border-slate-50 pt-6">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracker */}
      <section className="py-40 bg-white">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-12">Track Order</h2>
          <div className="flex gap-4 p-4 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-sm">
            <input 
              type="text" 
              placeholder="Enter Order ID" 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="flex-1 bg-transparent border-none text-slate-950 px-8 font-black focus:ring-0 uppercase tracking-widest text-sm"
            />
            <button onClick={handleTrack} className="px-10 py-5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
              Track
            </button>
          </div>
          {trackResult && (
            <div className="mt-16 p-12 bg-white border border-slate-100 rounded-[3rem] text-left shadow-xl animate-in slide-in-from-bottom duration-500">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Order ID: #{trackResult.order_id}</span>
              <p className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase mt-4">{trackResult.status}</p>
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      {selectedBundle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-950/80 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-3xl border border-slate-100 relative">
              <button 
                onClick={() => setSelectedBundle(null)}
                className="absolute top-8 right-8 p-4 hover:bg-slate-50 rounded-full transition-all text-slate-300 hover:text-slate-950"
              >
                <X size={24} />
              </button>
              
              <div className="p-16">
                <div className="mb-12">
                   <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Securing Order</span>
                   <h2 className="text-5xl font-black italic tracking-tighter uppercase mt-4 text-slate-950">Checkout</h2>
                </div>

                <div className="bg-slate-50 p-10 rounded-[3rem] mb-12 border border-slate-100 flex justify-between items-center group">
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-2">Selected Pack</p>
                     <h4 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{selectedBundle.name}</h4>
                   </div>
                   <div className="text-right">
                     <p className="text-3xl font-black italic tracking-tighter text-blue-600">${selectedBundle.price}</p>
                   </div>
                </div>

                <div id="paypal-button-container" className="relative z-10"></div>
                
                {paymentStatus === 'processing' && (
                  <div className="mt-10 p-10 bg-slate-50 rounded-[3rem] text-center border border-slate-100 animate-pulse">
                     <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-400">Authenticating with PayPal...</p>
                  </div>
                )}
                
                {paymentStatus === 'success' && (
                  <div className="mt-10 p-10 bg-emerald-50 rounded-[3rem] text-center border border-emerald-100">
                     <p className="text-xl font-black italic tracking-tighter text-emerald-600 uppercase mb-2">Success!</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Check your email for confirmation.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </main>
  )
}
