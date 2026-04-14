'use client'

import React, { useState, useEffect, Fragment } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

import { 
  Play, ShieldCheck, Zap, Droplets, CheckCircle, Package, CreditCard, 
  Truck, Globe, X, Search, MapPin, Star, AlertCircle, ThumbsUp, 
  ChevronDown, Trash2, Recycle, Droplet, Sparkles, Ruler, Shield, RefreshCw,
  Mail, Phone
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TRANSLATIONS = {
  en: {
    heroTitle: "Clean Smarter, Not Harder.",
    heroSub: "The 18-inch hygienic revolution for your bathroom. Triple action pads, zero-touch mechanism. Hassle-Free No-Return Refund.",
    shopBundles: "Shop Bundles",
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

function TrustBar() {
  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden whitespace-nowrap relative z-10">
      <div className="flex animate-marquee gap-10 items-center px-4 uppercase text-[10px] font-black italic tracking-widest w-max">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-10 items-center">
            <Truck size={14} /> Free USA Shipping
            <ShieldCheck size={14} /> Verified Quality
            <RefreshCw size={14} /> 100% Satisfaction Guarantee
            <Star size={14} /> 50k+ Happy Customers
          </div>
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
        sessionStorage.setItem(sessionKey, 'true')
      }
    }
    trackVisitor()
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&disable-funding=credit,card`
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
            
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: `CW-${order.id.slice(-6)}`,
                customer_name: order.payer.name.given_name + ' ' + order.payer.name.surname,
                email: order.payer.email_address,
                phone: phone,
                amount: selectedBundle.price,
                bundle_id: selectedBundle.id,
                product_name: selectedBundle.name,
                shipping_address: address.address_line_1 + (address.address_line_2 ? ', ' + address.address_line_2 : ''),
                shipping_city: address.admin_area_2,
                shipping_state: address.admin_area_1,
                shipping_zip: address.postal_code,
                shipping_country: address.country_code
              })
            })
            
            if (res.ok) {
              setPaymentStatus('success')
              setTimeout(() => {
                setSelectedBundle(null)
                setPaymentStatus('idle')
              }, 5000)
            } else {
              setPaymentStatus('idle')
              alert('Order processing failed. Please contact support.')
            }
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "clowand Disposable Toilet Brush System",
            "image": "/images/hero.jpg",
            "description": "The ultimate 18-inch reach bathroom hygiene system. Triple-action pads, zero-touch mechanism, and 365-day supply in one box. Designed for the modern US home.",
            "brand": {
              "@type": "Brand",
              "name": "clowand"
            },
            "offers": {
              "@type": "AggregateOffer",
              "url": "https://clowand.com",
              "priceCurrency": "USD",
              "lowPrice": "19.99",
              "highPrice": "34.99",
              "offerCount": "3",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "52300"
            }
          })
        }}
      />
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
            <p className="text-lg text-slate-500 mb-12 max-w-xl leading-relaxed">
              {t.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={() => scrollIntoView('bundles')}
                className="w-full sm:w-auto px-12 py-6 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-slate-950/20"
              >
                {t.shopBundles}
              </button>
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow-sm overflow-hidden relative">
                    <Image src={`https://i.pravatar.cc/40?u=${i}`} width={40} height={40} alt="happy user" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                50k+ Happy Homes
              </p>
            </div>
          </div>
          <div className="flex-1 relative group">
             <div className="absolute inset-0 bg-blue-600/10 rounded-[4rem] blur-[80px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
             <div className="relative rounded-[4rem] overflow-hidden border border-slate-100 shadow-3xl bg-white aspect-square group-hover:-rotate-1 transition-all duration-700">
               <Image 
                 src="/images/hero.jpg" 
                 width={800} 
                 height={800} 
                 className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-110 transition-all duration-1000 group-hover:grayscale-0" 
                 alt="clowand Professional 18 inch Anti-Splash Toilet Brush" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
               <div className="absolute bottom-12 left-12">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <Play size={20} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Watch 10s Demo</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Features */}
      <section id="features" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Engineering Excellence</span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-6 text-slate-950">Why clowand?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: t.zeroTouchTitle, desc: t.zeroTouchDesc, color: 'bg-emerald-50 text-emerald-600' },
              { icon: Ruler, title: t.handleTitle, desc: t.handleDesc, color: 'bg-blue-50 text-blue-600' },
              { icon: Droplets, title: t.padTitle, desc: t.padDesc, color: 'bg-purple-50 text-purple-600' }
            ].map((feature, i) => (
              <div key={i} className="group p-8 md:p-12 bg-slate-50 rounded-[4rem] border border-slate-100 hover:bg-white hover:shadow-3xl transition-all duration-500 hover:-translate-y-4">
                <div className={`w-16 h-16 ${feature.color} rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Highlight */}
      <section className="py-40 px-6 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-blue-600 rounded-full blur-[200px]"></div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24 relative">
          <div className="flex-1 order-2 md:order-1">
             <div className="relative group rounded-[4rem] overflow-hidden border border-white/10 aspect-video">
              <Image 
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" 
                width={800} 
                height={450}
                className="absolute top-0 right-0 h-full w-1/2 object-cover grayscale opacity-10 group-hover:opacity-100 transition-all duration-1000 group-hover:grayscale-0 pointer-events-none" 
                alt="Zero-touch hygiene technology" 
              />
              <div className="relative md:absolute md:inset-0 p-10 md:p-16 flex flex-col justify-center">
                 <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-8 leading-none">Designed for <br/> US Households</h2>
                 <p className="text-slate-400 text-lg mb-10 max-w-md leading-relaxed">Built to meet the highest sanitary standards. Professional-grade durability meets minimalist design.</p>
                 <ul className="space-y-6">
                   {[
                     { icon: CheckCircle, text: 'ASTM Certified Materials' },
                     { icon: CheckCircle, text: 'Compatible with Septic Systems' },
                     { icon: CheckCircle, text: 'Ergonomic Non-Slip Grip' }
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                       <item.icon size={18} /> {item.text}
                     </li>
                   ))}
                 </ul>
              </div>
             </div>
          </div>
          <div className="flex-1 order-1 md:order-2 text-center md:text-left">
             <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] italic">The Standard</span>
             <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-6 mb-12">American <br/> Hygiene.</h2>
             <button 
               onClick={() => scrollIntoView('bundles')}
               className="px-12 py-6 bg-white text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-white/5"
             >
               View Specs
             </button>
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section id="bundles" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">{t.bundles}</span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-6 text-slate-950">{t.saveUpTo}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {BUNDLES.map((bundle, i) => (
              <div key={bundle.id} className={`group relative p-8 md:p-12 rounded-[4rem] border transition-all duration-700 flex flex-col ${bundle.popular ? 'bg-slate-950 text-white border-slate-800 scale-105 shadow-3xl z-10' : 'bg-white text-slate-900 border-slate-100 hover:shadow-2xl'}`}>
                {bundle.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {t.mostPopular}
                  </div>
                )}
                <div className="mb-12">
                   <span className="text-blue-600 font-black uppercase tracking-widest text-[10px] italic">{bundle.tag}</span>
                   <h3 className="text-3xl font-black italic tracking-tighter uppercase mt-4 mb-2">{bundle.name}</h3>
                   <p className={`${bundle.popular ? 'text-slate-400' : 'text-slate-500'} font-medium`}>{bundle.description}</p>
                </div>
                <div className="mb-12 relative h-64 rounded-3xl overflow-hidden bg-slate-50">
                   <Image 
                     src={bundle.image} 
                     width={400}
                     height={400}
                     className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" 
                     alt={`${bundle.name} - clowand Professional Toilet Brush Bundle`} 
                   />
                </div>
                <div className="mb-12 flex-1">
                   <ul className="space-y-4">
                     {bundle.items.map((item, idx) => (
                       <li key={idx} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-80">
                         <CheckCircle size={14} className="text-blue-600 shrink-0" /> {item}
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="mt-auto pt-12 border-t border-slate-100/10">
                   <div className="flex items-end justify-between mb-10">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1">One-Time Payment</span>
                        <p className="text-5xl font-black italic tracking-tighter text-blue-600">${bundle.price}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-4 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Free Ship</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => setSelectedBundle(bundle)}
                     className={`w-full py-6 rounded-full text-[10px] font-black tracking-widest transition-all ${bundle.popular ? 'bg-white text-slate-950 hover:bg-blue-600 hover:text-white' : 'bg-slate-950 text-white hover:bg-blue-600'}`}
                   >
                     Add to Cart
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-40 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
             <div className="flex-1 text-center md:text-left">
               <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Voice of America</span>
               <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-6 text-slate-950">Customer Love</h2>
             </div>
             <div className="flex items-center gap-12">
                <div className="text-center">
                  <p className="text-5xl font-black italic tracking-tighter text-slate-950 uppercase">4.9</p>
                  <div className="flex gap-1 text-blue-600 mt-2">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 max-w-[100px] leading-relaxed">Based on 50k+ Real Reviews</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {REVIEWS.map((review, i) => (
              <div key={i} className="p-8 md:p-12 bg-white rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                <div className="flex gap-1 mb-8 text-blue-600">
                  {[...Array(review.rating)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                </div>
                <p className="text-lg text-slate-600 leading-relaxed italic font-medium mb-10">"{review.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-50 overflow-hidden relative">
                    <Image src={`https://i.pravatar.cc/32?u=${review.name}`} width={32} height={32} alt={review.name} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest text-slate-900">{review.name} ({review.location})</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto rounded-[5rem] bg-blue-600 text-white p-10 md:p-32 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 scale-150 group-hover:scale-110 transition-transform duration-[3s]">
            <Image 
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800" 
              width={800} 
              height={600}
              className="w-full h-full object-cover grayscale" 
              alt="clowand Brand Story and USA presence" 
            />
          </div>
          <div className="relative max-w-2xl">
            <span className="font-black uppercase tracking-[0.3em] text-[10px] italic">Our Mission</span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-6 mb-12 leading-none">Clean with Confidence.</h2>
            <p className="text-xl text-blue-50 leading-relaxed mb-16 opacity-90">Started in Boston, clowand was born from a simple observation: cleaning tools shouldn't be the dirtiest thing in your house. We're reinventing bathroom hygiene with professional tools for every American home.</p>
            <div className="flex flex-col sm:flex-row gap-12">
              <div>
                <p className="text-4xl font-black italic tracking-tighter uppercase mb-2">2024</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Est. Boston, MA</p>
              </div>
              <div className="w-px h-16 bg-white/20 hidden sm:block"></div>
              <div>
                <p className="text-4xl font-black italic tracking-tighter uppercase mb-2">50k+</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Homes Transformed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track & FAQ */}
      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">After Sales</span>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-6 mb-12 text-slate-950">Support</h2>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleTrack(); }}
            className="flex flex-col sm:flex-row gap-4 mb-32"
          >
            <input 
              type="text" 
              placeholder={t.trackInput}
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="flex-1 px-10 py-6 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
            />
            <button type="submit" className="px-10 py-5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
              Track
            </button>
          </form>
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
