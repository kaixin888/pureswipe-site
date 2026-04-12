'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Play, ShieldCheck, Zap, Droplets, CheckCircle, Package, CreditCard, 
  Truck, Globe, X, Search, MapPin, Star, AlertCircle, ThumbsUp, 
  ChevronDown, Trash2, Recycle, Droplet, Sparkles, Ruler, Shield, RefreshCw
} from 'lucide-react'

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

const TRANSLATIONS = {
  en: {
    heroTitle: "Clean Smarter, Not Harder.",
    heroSub: "The 18-inch hygienic revolution for your bathroom. Triple action pads, zero-touch mechanism.",
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
    items: ['1x 18" Anti-Splash Wand', '1x Ventilated Caddy', '12x Fresh Ocean Refills'],
    tag: 'Start Here'
  },
  {
    id: 'family',
    name: 'Family Value Pack',
    price: 34.99,
    description: 'BEST VALUE & RESULTS',
    items: ['1x 18" Anti-Splash Wand', '1x Ventilated Caddy', '36x Mixed Scents Refills'],
    tag: 'Best Seller',
    popular: true
  },
  {
    id: 'eco-refill',
    name: 'Eco Refill Box',
    price: 24.99,
    description: 'Stock up & Save',
    items: ['48x Extra-Strength Refills', 'Recyclable Eco-Packaging', 'Compatible with all Wands'],
    tag: 'Eco Friendly'
  }
]

const FAQ = [
  { q: "How does free shipping work?", a: "We offer free standard shipping (3-5 business days) on all bundles across the continental USA. Tracking is provided via email once your order ships." },
  { q: "What is your return policy?", a: "We offer a 30-day risk-free trial. If you don't love Clowand, return it within 30 days for a full refund—no questions asked." },
  { q: "Are the refill pads environmentally friendly?", a: "Yes! Our refills are made from biodegradable materials and the packaging is 100% recyclable. Clean your home without the guilt." },
  { q: "Will the pads work on my toilet?", a: "Clowand is designed to reach deep under the rim and into the trap, making it effective for 99% of toilet designs including low-flow models." },
  { q: "How many uses do I get per pad?", a: "Each pad is single-use for maximum hygiene. It contains enough concentrated cleaning agent for one thorough, deep clean." }
]

function TrustBar() {
  return (
    <div className="bg-brand-primary text-white py-2 overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee gap-8 items-center text-[10px] font-black uppercase tracking-widest italic">
        {[1,2,3,4,5].map(i => (
          <span key={i} className="flex items-center gap-6">
            <Truck size={14} /> Free USA Shipping
            <ShieldCheck size={14} /> Secure Checkout
            <RefreshCw size={14} /> 100% Satisfaction Guarantee
            <Recycle size={14} /> Eco-Friendly
            <Star size={14} fill="white" /> 50,000+ Happy Homes
          </span>
        ))}
      </div>
    </div>
  )
}

function BentoGrid() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-4">Engineered for Hygiene</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Three features that make clowand the smarter choice.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[600px]">
        <div className="md:col-span-2 bg-brand-mint p-12 rounded-[3rem] flex flex-col justify-end group overflow-hidden relative border-2 border-transparent hover:border-brand-primary transition-all">
          <div className="absolute top-12 left-12 p-4 bg-white rounded-full text-brand-primary shadow-sm"><Ruler size={32} /></div>
          <h3 className="text-4xl font-black italic uppercase leading-none mb-4">18-Inch Reach</h3>
          <p className="text-sm font-bold text-brand-primary/80 uppercase tracking-tight max-w-sm">Industry-leading length keeps you at a safe distance from germs and splashes. Reach deep under the rim without effort.</p>
        </div>
        <div className="md:col-span-2 md:row-span-2 bg-slate-950 p-12 rounded-[3rem] flex flex-col justify-between text-white border-2 border-transparent hover:border-brand-orange transition-all group overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-white/10 rounded-full"><Sparkles size={32} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest py-2 px-6 border border-white/20 rounded-full">New Tech</span>
          </div>
          <div>
            <h3 className="text-5xl font-black italic uppercase leading-none mb-6">3-Layer Scrubbing</h3>
            <p className="text-sm font-bold text-white/60 uppercase tracking-tight mb-8">Triple action pads that scrub, lift, and protect. One pad is enough for the entire session.</p>
            <div className="space-y-4">
              {['Scrubbing Layer', 'Disinfecting core', 'Polishing shield'].map(l => (
                <div key={l} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14} className="text-brand-orange" /> {l}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-slate-100 p-12 rounded-[3rem] flex flex-col justify-end border-2 border-transparent hover:border-brand-primary transition-all">
          <div className="p-4 bg-white rounded-full text-brand-primary shadow-sm w-fit mb-8"><Zap size={32} /></div>
          <h3 className="text-4xl font-black italic uppercase leading-none mb-4">Zero-Touch</h3>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-tight max-w-sm">No more touching dirty pads. One click to attach, one click to release. Hygiene redefined.</p>
        </div>
      </div>
    </section>
  )
}

function Comparison() {
  return (
    <section className="py-24 bg-brand-mint/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-8">Why Make the Switch?</h2>
            <p className="text-slate-600 font-bold uppercase tracking-tight text-sm mb-12 max-w-lg">Traditional toilet brushes harbor bacteria and require messy maintenance. There is a better way.</p>
            <div className="space-y-6">
              <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100">
                <h4 className="text-red-600 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2"><X size={16} /> Traditional Brushes</h4>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-red-900/60">
                  <li>Trap bacteria in bristles after each use</li>
                  <li>Splash dirty water when cleaning</li>
                  <li>Require storage that keeps them moist</li>
                  <li>Need frequent deep cleaning or replacement</li>
                </ul>
              </div>
              <div className="p-8 bg-brand-primary text-white rounded-[2.5rem]">
                <h4 className="text-brand-mint text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2"><CheckCircle size={16} /> clowand Solution</h4>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-brand-mint/70">
                  <li>Single-use pads eliminate germ transfer</li>
                  <li>18" reach keeps you at safe distance</li>
                  <li>Ventilated caddy keeps wand dry</li>
                  <li>Zero-touch disposal, no mess</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-slate-950 rounded-[4rem] aspect-square flex items-center justify-center p-12 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/50 to-transparent"></div>
             <div className="relative text-center">
               <div className="w-24 h-24 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-8 shadow-3xl group-hover:scale-110 transition-all cursor-pointer"><Play fill="white" size={40} className="ml-2" /></div>
               <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Watch How it Works</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [lang, setLang] = useState('en')
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [trackId, setTrackId] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [activeFaq, setActiveFaq] = useState(null)

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  useEffect(() => {
    // 简单的访客计数逻辑 (Session Based)
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
    script.src = `https://www.paypal.com/sdk/js?client-id=AS_UeNNIxhlDd1LBTRe0GzuD7PEFHNMlZqmo34NqTSBZdGfiDSM1TjrS9V80PPiA3ecdjIGmcVrkt2iN&currency=USD`
    script.id = 'paypal-sdk'
    script.addEventListener('load', () => setPaypalLoaded(true))
    document.body.appendChild(script)
    return () => {
      const s = document.getElementById('paypal-sdk')
      if (s) s.remove()
    }
  }, [])

  useEffect(() => {
    if (paypalLoaded && selectedBundle && paymentStatus === 'idle' && window.paypal) {
      const container = document.getElementById('paypal-button-container')
      if (container) {
        container.innerHTML = ''
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: selectedBundle.price.toString() },
                description: `clowand ${selectedBundle.name}`
              }]
            })
          },
          onApprove: async (data, actions) => {
            setPaymentStatus('processing')
            const order = await actions.order.capture()
            
            // 提取详细收货地址与联系电话 (用于物流导出)
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
    }
  }, [paypalLoaded, selectedBundle, paymentStatus])

  const handleTrack = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', trackId)
      .single()
    if (data) setTrackResult(data)
    else alert('Order not found')
  }

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-brand-mint font-sans">
      <TrustBar />
      
      {/* Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-6">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/20 rounded-full p-2 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4 px-6">
            <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white"><Sparkles size={20} /></div>
            <span className="font-black italic uppercase tracking-tighter text-2xl">clowand</span>
          </div>
          <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <a href="#features" className="hover:text-brand-primary transition-all">Features</a>
             <a href="#bundles" className="hover:text-brand-primary transition-all">Bundles</a>
             <a href="#reviews" className="hover:text-brand-primary transition-all">Reviews</a>
          </div>
          <button 
            onClick={() => document.getElementById('bundles').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-brand-orange text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all"
          >
            Shop Now
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-32 max-w-7xl mx-auto px-6 text-center relative">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[800px] bg-brand-mint/50 rounded-full blur-[120px]"></div>
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand-mint rounded-full text-brand-primary text-[10px] font-black uppercase tracking-widest italic mb-12 shadow-sm">
          <Shield size={14} /> Certified Hygiene System
        </div>
        <h1 className="text-7xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.85] italic mb-12">
          {t.heroTitle.split(',')[0]}<br/>
          <span className="text-brand-orange drop-shadow-sm">{t.heroTitle.split(',')[1]}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-16 italic">
          {t.heroSub}
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-24">
           <button onClick={() => document.getElementById('bundles').scrollIntoView({ behavior: 'smooth' })} className="px-20 py-8 bg-brand-primary text-white rounded-full text-xs font-black uppercase tracking-widest shadow-3xl shadow-brand-primary/30 hover:scale-105 transition-all">
            {t.shopBundles}
          </button>
          <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="User" />
              </div>
            ))}
            <div className="pl-6 text-left">
              <div className="flex gap-1 text-yellow-400 mb-1"><Star fill="currentColor" size={12} /> <Star fill="currentColor" size={12} /> <Star fill="currentColor" size={12} /> <Star fill="currentColor" size={12} /> <Star fill="currentColor" size={12} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Trusted by 50,000+ Homes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Marks */}
      <section className="py-20 border-y border-slate-100 flex justify-center items-center gap-12 md:gap-32 grayscale opacity-40">
        <div className="font-black italic text-3xl opacity-50">FORBES</div>
        <div className="font-black italic text-3xl opacity-50">WIRED</div>
        <div className="font-black italic text-3xl opacity-50">CNN</div>
        <div className="font-black italic text-3xl opacity-50">GQ</div>
      </section>

      <BentoGrid />
      <Comparison />

      {/* Steps */}
      <section className="py-32 max-w-7xl mx-auto px-6 text-center">
         <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-16">Simple as 1-2-3-4</h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { t: 'Attach Refill', d: 'Slide a fresh pad onto the wand', i: Package },
              { t: 'Clean Toilet', d: 'Scrub all surfaces effortlessly', i: Droplets },
              { t: 'Press to Dispose', d: 'Release pad without touching', i: Trash2 },
              { t: 'Flush or Bin', d: 'Dispose hygienically', i: Recycle }
            ].map((s, idx) => (
              <div key={s.t} className="relative group">
                <div className="w-20 h-20 bg-brand-mint rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-brand-primary group-hover:bg-brand-orange group-hover:text-white transition-all shadow-sm">
                   <s.i size={32} />
                </div>
                <div className="absolute top-0 right-1/4 w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center font-black italic text-xs shadow-sm">{idx+1}</div>
                <h4 className="text-xl font-black uppercase italic mb-4">{s.t}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">{s.d}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Bundles */}
      <section id="bundles" className="py-40 bg-slate-950 text-white rounded-[5rem] mx-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
            <h2 className="text-7xl font-black uppercase tracking-tighter italic mb-8">{t.bundles}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-orange italic underline underline-offset-8 decoration-white/20">{t.saveUpTo}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {BUNDLES.map(bundle => (
              <div key={bundle.id} className={`p-16 rounded-[4rem] border-4 transition-all duration-500 relative group overflow-hidden ${bundle.popular ? 'border-brand-orange bg-white text-slate-950 shadow-3xl scale-105 z-10' : 'border-white/10 hover:border-white/30'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">{bundle.name}</h3>
                  {bundle.popular && <span className="bg-brand-orange text-white text-[8px] font-black uppercase tracking-widest py-2 px-4 rounded-full italic">BEST VALUE</span>}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest italic mb-12 ${bundle.popular ? 'text-slate-400' : 'text-white/40'}`}>{bundle.description}</p>
                <div className="text-7xl font-black italic tracking-tighter mb-12 leading-none">
                  <span className="text-3xl font-bold align-top mt-2 mr-1">$</span>{bundle.price}
                </div>
                <ul className="space-y-6 mb-16">
                  {bundle.items.map(item => (
                    <li key={item} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter">
                      <CheckCircle size={18} className={bundle.popular ? 'text-brand-orange' : 'text-brand-mint'} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => setSelectedBundle(bundle)}
                  className={`w-full py-8 rounded-[2.5rem] text-xs font-black uppercase tracking-widest transition-all ${bundle.popular ? 'bg-slate-950 text-white shadow-xl' : 'bg-white text-slate-950'}`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-7xl font-black uppercase tracking-tighter italic mb-8">Join the Revolution</h2>
             <div className="flex justify-center items-center gap-4 mb-4">
                <div className="flex gap-1 text-yellow-400"><Star fill="currentColor" size={24} /> <Star fill="currentColor" size={24} /> <Star fill="currentColor" size={24} /> <Star fill="currentColor" size={24} /> <Star fill="currentColor" size={24} /></div>
                <span className="text-4xl font-black italic tracking-tighter">5.0</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary italic">50,000+ Satisfied Customers Nationwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', loc: 'Los Angeles', quote: 'The 18-inch handle is a back-saver. Finally, a toilet brush that doesn\'t gross me out!', stars: 5 },
              { name: 'Michael R.', loc: 'New York', quote: 'Zero touch actually works perfectly. The pads scrub much better than regular bristles.', stars: 5 },
              { name: 'Jennifer K.', loc: 'Chicago', quote: 'Setup took 30 seconds. This is how cleaning in 2026 should feel. Highly recommend!', stars: 5 }
            ].map(r => (
              <div key={r.name} className="bg-brand-mint p-12 rounded-[4rem] border border-brand-primary/5 shadow-sm group hover:scale-[1.02] transition-all">
                <div className="flex gap-2 mb-8 text-brand-primary">
                  <Star fill="currentColor" size={14} /> <Star fill="currentColor" size={14} /> <Star fill="currentColor" size={14} /> <Star fill="currentColor" size={14} /> <Star fill="currentColor" size={14} />
                </div>
                <p className="text-xl font-bold italic text-slate-900 mb-8 uppercase tracking-tighter leading-tight">"{r.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black italic text-brand-primary text-sm shadow-sm">{r.name[0]}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-950">{r.name}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{r.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-40 bg-brand-mint/20 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-black uppercase tracking-tighter italic">Common Doubts</h2>
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
      <section className="py-40">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-12">{t.trackTitle}</h2>
          <div className="flex gap-4 p-4 bg-slate-50 rounded-[3rem] border border-slate-100">
            <input 
              type="text" 
              placeholder={t.trackInput} 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="flex-1 bg-transparent border-none text-slate-950 px-8 font-black focus:ring-0 uppercase tracking-widest text-sm"
            />
            <button onClick={handleTrack} className="px-10 py-5 bg-brand-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl shadow-brand-primary/20">
              {t.trackBtn}
            </button>
          </div>
          {trackResult && (
            <div className="mt-16 p-12 bg-white border border-slate-100 rounded-[3rem] text-left shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Order ID: #{trackResult.order_id}</span>
              <p className="text-2xl font-black italic tracking-tighter text-brand-primary uppercase mt-4">{trackResult.status}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white shadow-lg"><Sparkles size={24} /></div>
              <span className="font-black italic uppercase tracking-tighter text-3xl">clowand</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Redefining Bathroom Hygiene</p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
             <a href="/privacy" className="hover:text-brand-primary">Privacy</a>
             <a href="/terms" className="hover:text-brand-primary">Terms</a>
             <a href="/refund" className="hover:text-brand-primary">Refunds</a>
          </div>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">© 2026 clowand. 100% US Compliant.</p>
        </div>
      </footer>

      {/* Modal */}
      {selectedBundle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6">
          <div className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-2xl relative">
            <button onClick={() => setSelectedBundle(null)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-950 transition-all"><X size={40} /></button>
            {paymentStatus === 'idle' && (
              <>
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-brand-mint text-brand-primary rounded-full flex items-center justify-center"><CreditCard size={24} /></div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic">{t.checkout}</h2>
                </div>
                <div className="space-y-6 mb-12 bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-slate-400 italic">Selected Pack</span>
                    <span className="text-slate-900">{selectedBundle.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-slate-400 italic">Total Amount</span>
                    <span className="text-brand-orange font-black">${selectedBundle.price}</span>
                  </div>
                </div>
                <div id="paypal-button-container" className="w-full min-h-[150px]"></div>
                <p className="mt-8 text-center text-[8px] font-black uppercase tracking-widest text-slate-300">Secure 256-bit SSL Encrypted Payment</p>
              </>
            )}
            {paymentStatus === 'processing' && (
              <div className="py-32 text-center">
                <div className="w-24 h-24 border-[12px] border-brand-mint border-t-brand-primary rounded-full animate-spin mx-auto mb-12"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">Confirming Payment with Bank...</p>
              </div>
            )}
            {paymentStatus === 'success' && (
              <div className="py-24 text-center">
                <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-[3.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner">
                  <CheckCircle size={72} strokeWidth={3} />
                </div>
                <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-6">Order Success</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Welcome to the clowand community.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global CSS for Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </main>
  )
}