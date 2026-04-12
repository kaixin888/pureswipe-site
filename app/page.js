'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Play, ShieldCheck, Zap, Droplets, CheckCircle, Package, 
  CreditCard, Truck, Globe, X, Search, MapPin, Star, 
  ChevronDown, ArrowRight, Shield, RefreshCw, Sparkles, 
  Hand, Timer, Trash2, Heart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

const TRANSLATIONS = {
  en: {
    heroTitle: "Clean Smarter, Not Harder.",
    heroSub: "The 18-inch hygienic revolution for your bathroom. Triple action pads, zero-touch mechanism.",
    shopBundles: "Shop Bundles",
    freeShipping: "Free Shipping Across USA • 30-Day Money Back Guarantee • Secure Checkout",
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
    trackBtn: "Track",
    processStep1: "Click to Load",
    processStep2: "Scrub & Clean",
    processStep3: "One-Click Release",
    processStep4: "Flush or Trash"
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
    items: ['1x 18" Anti-Splash Wand', '1x Ventilated Caddy', '48x Mixed Scents Refills'],
    tag: 'Best Seller',
    popular: true
  },
  {
    id: 'eco-refill',
    name: 'Eco Refill Box',
    price: 24.99,
    description: 'Stock up & Save',
    items: ['64x Extra-Strength Refills', 'Recyclable Eco-Packaging', 'Compatible with all Wands'],
    tag: 'Eco Friendly'
  }
]

// Trust Bar Component
const TrustBar = ({ text }) => (
  <div className="bg-slate-950 text-white py-3 overflow-hidden whitespace-nowrap border-b border-white/5 relative z-50">
    <div className="flex animate-marquee gap-12 items-center">
      {[...Array(10)].map((_, i) => (
        <span key={i} className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic shrink-0">
          <ShieldCheck size={12} className="text-blue-500" /> {text}
        </span>
      ))}
    </div>
  </div>
)

// Bento Grid Feature Item
const BentoItem = ({ title, desc, icon: Icon, className, color = "blue" }) => (
  <div className={`p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-700 relative overflow-hidden ${className}`}>
    <div className={`w-16 h-16 bg-${color}-50 text-${color}-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
      <Icon size={32} strokeWidth={2.5} />
    </div>
    <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4 leading-none">{title}</h3>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">{desc}</p>
    <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${color}-50/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 opacity-0 group-hover:opacity-100`}></div>
  </div>
)

export default function Home() {
  const [lang, setLang] = useState('en')
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [trackId, setTrackId] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

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
            
            // 提取详细收货地址 (用于物流导出)
            const shipping = order.purchase_units[0].shipping
            const address = shipping.address
            
            await supabase.from('orders').insert([{
              order_id: `CW-${order.id.slice(-6)}`,
              customer_name: order.payer.name.given_name + ' ' + order.payer.name.surname,
              email: order.payer.email_address,
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
    else alert('Order ID not found. Please check your confirmation email.')
  }

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-blue-100 pt-20 overflow-x-hidden font-sans">
      <TrustBar text={t.freeShipping} />

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-32 pb-40 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-12 italic">
            The #1 Choice for US Bathrooms
          </span>
          <h1 className="text-8xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.8] italic mb-12 text-slate-900">
            {t.heroTitle.split(',')[0]}<br/>
            <span className="text-blue-600 drop-shadow-2xl">{t.heroTitle.split(',')[1]}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-16 italic leading-relaxed">
            {t.heroSub}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => document.getElementById('bundles').scrollIntoView({ behavior: 'smooth' })} 
              className="group px-16 py-8 bg-slate-950 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-widest shadow-3xl hover:bg-blue-600 transition-all flex items-center gap-4 active:scale-95"
            >
              {t.shopBundles} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/40?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">50k+ Happy Homes</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
          <BentoItem 
            className="md:col-span-8 md:row-span-2 flex flex-col justify-end bg-slate-950 text-white border-none"
            title="18\" Safety Handle"
            desc="Industry-leading length keeps you 2x further from the 'grime zone' than standard brushes. Ergonomically designed for no-bend cleaning."
            icon={Hand}
          />
          <BentoItem 
            className="md:col-span-4 md:row-span-1"
            title="Zero Touch"
            desc="One-click attach and release. Never touch a dirty brush again."
            icon={Zap}
            color="emerald"
          />
          <BentoItem 
            className="md:col-span-4 md:row-span-2 flex flex-col justify-center"
            title="Triple Action"
            desc="Our multi-layer pads scrub, disinfect, and protect in one pass. Infused with fresh ocean scents."
            icon={Sparkles}
            color="blue"
          />
          <BentoItem 
            className="md:col-span-4 md:row-span-1"
            title="US Certified"
            desc="Eco-friendly pads, 100% septic safe and US home compliant."
            icon={ShieldCheck}
            color="orange"
          />
          <BentoItem 
            className="md:col-span-4 md:row-span-1 flex items-center gap-6"
            title="Ventilated"
            desc="Quick-dry caddy."
            icon={Droplets}
          />
        </div>
      </section>

      {/* Comparison Section (Stop Touching the Grime) */}
      <section className="py-40 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-100 rounded-full blur-[100px] opacity-30"></div>
              <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-12 text-slate-900 leading-[0.9]">
                Stop Touching <br/><span className="text-red-600">The Grime.</span>
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-16 italic max-w-lg">
                Traditional brushes breed bacteria in dripping containers. Clowand's 100% disposable system ensures a fresh clean every time without the germ-fest.
              </p>
              <ul className="space-y-8">
                {[
                  { label: "Old Way", desc: "Dripping water, dirty bristles, bad smell.", bad: true },
                  { label: "Clowand Way", desc: "Fresh pads, long handle, zero-germ.", bad: false }
                ].map((item, i) => (
                  <li key={i} className={`p-8 rounded-[2.5rem] border ${item.bad ? 'border-red-50/50 bg-white/50' : 'border-blue-100 bg-white shadow-xl'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bad ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                        {item.bad ? <Trash2 size={24} /> : <Heart size={24} />}
                      </div>
                      <div>
                        <h4 className={`text-xs font-black uppercase tracking-widest italic mb-1 ${item.bad ? 'text-red-500' : 'text-blue-600'}`}>{item.label}</h4>
                        <p className="text-lg font-black italic tracking-tighter text-slate-900 uppercase">{item.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-square bg-slate-200 rounded-[5rem] overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/20 to-transparent"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Play size={100} className="text-white drop-shadow-2xl opacity-50 group-hover:scale-125 transition-transform cursor-pointer" />
               </div>
               <img src="https://sc01.alicdn.com/kf/Hdfd892a42b1d4b8ba87ea17a9c9d41c9q.png" alt="Usage" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* Step Guide */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
             { step: "01", label: t.processStep1, icon: Plus },
             { step: "02", label: t.processStep2, icon: Sparkles },
             { step: "03", label: t.processStep3, icon: Zap },
             { step: "04", label: t.processStep4, icon: Trash2 }
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <item.icon size={32} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-2 italic">Step {item.step}</h4>
              <p className="text-xl font-black italic tracking-tighter uppercase text-slate-900">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bundle Selection */}
      <section id="bundles" className="py-40 max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-[100px] -z-10"></div>
        <div className="text-center mb-32">
          <h2 className="text-7xl font-black uppercase tracking-tighter italic mb-8 drop-shadow-sm">{t.bundles}</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 italic px-8 py-3 bg-blue-50/50 inline-block rounded-full">{t.saveUpTo}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {BUNDLES.map(bundle => (
            <div key={bundle.id} className={`p-16 rounded-[5rem] border-4 transition-all duration-700 relative group overflow-hidden ${bundle.popular ? 'border-blue-600 bg-slate-950 text-white shadow-3xl scale-105 z-10' : 'border-slate-50 hover:border-blue-100 bg-white shadow-sm'}`}>
              {bundle.popular && (
                <div className="absolute top-10 right-10 px-6 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full italic animate-bounce">
                  Best Seller
                </div>
              )}
              <h3 className="text-5xl font-black uppercase tracking-tighter italic mb-2 leading-none">{bundle.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest italic mb-12 ${bundle.popular ? 'text-blue-400' : 'text-slate-400'}`}>{bundle.description}</p>
              <div className="text-8xl font-black italic tracking-tighter mb-12 leading-none">
                <span className="text-4xl font-bold align-top mt-2 mr-1 opacity-50">$</span>{bundle.price}
              </div>
              <ul className="space-y-6 mb-16">
                {bundle.items.map(item => (
                  <li key={item} className="flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
                    <CheckCircle size={20} className={bundle.popular ? 'text-blue-400' : 'text-emerald-500'} />
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setSelectedBundle(bundle)}
                className={`w-full py-8 rounded-[3rem] text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-4 ${bundle.popular ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-700' : 'bg-slate-950 text-white hover:bg-blue-600'}`}
              >
                Checkout Now <CreditCard size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Reviews Section */}
      <section id="reviews" className="py-40 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
             <div>
               <h2 className="text-7xl font-black uppercase tracking-tighter italic mb-12 leading-[0.9]">Trusted by <br/>American <br/><span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Households.</span></h2>
               <div className="flex items-center gap-6">
                 <div className="flex -space-x-4">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-16 h-16 rounded-full border-4 border-slate-950 overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user"/></div>)}
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">"Join 50,000+ happy homes across the USA."</p>
               </div>
             </div>
             <div className="grid grid-cols-1 gap-6">
                {[
                  { text: "The 18-inch handle is a back-saver. Best hygienic system I've used.", author: "Sarah M., LA", rating: 5 },
                  { text: "Zero touch actually works. The pads scrub better than regular brushes.", author: "Michael R., NY", rating: 5 }
                ].map((rev, i) => (
                  <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-colors cursor-default group">
                    <div className="flex gap-2 mb-6 text-blue-500">
                       {[...Array(rev.rating)].map((_, j) => <Star key={j} fill="currentColor" size={16} />)}
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter uppercase mb-6 leading-tight group-hover:text-blue-400 transition-colors">"{rev.text}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">— {rev.author}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-40 max-w-4xl mx-auto px-6">
        <div className="text-center mb-24">
           <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-4">Common Questions</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 italic">Clear Answers for Clear Bathrooms</p>
        </div>
        <div className="space-y-4">
          {[
            { q: "Are the cleaning pads biodegradable?", a: "Yes! Our triple-action pads are made from reinforced cellulose fibers that are 100% eco-friendly and safe for septic systems." },
            { q: "Does the handle fit standard caddies?", a: "Each starter kit comes with a ventilated custom-designed caddy that perfectly fits the 18-inch handle for ergonomic storage." },
            { q: "Is the cleaner solution safe for pets?", a: "Absolutely. The formula infused in the pads is non-toxic to pets and children once diluted in water." }
          ].map((item, i) => (
            <div key={i} className="border border-slate-100 rounded-[2rem] overflow-hidden">
              <button 
                onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                className="w-full flex items-center justify-between p-10 bg-white hover:bg-slate-50 transition-colors"
              >
                <span className="text-lg font-black italic uppercase tracking-tighter text-slate-900">{item.q}</span>
                <ChevronDown className={`text-slate-300 transition-transform duration-500 ${expandedFAQ === i ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedFAQ === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50"
                  >
                    <div className="p-10 text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed italic">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Tracking Section */}
      <section className="bg-slate-950 py-40">
        <div className="max-w-xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-12">{t.trackTitle}</h2>
          <div className="flex gap-4 p-4 bg-white/5 rounded-[3rem] border border-white/10">
            <input 
              type="text" 
              placeholder={t.trackInput} 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="flex-1 bg-transparent border-none text-white px-8 font-black focus:ring-0 uppercase tracking-widest text-sm outline-none"
            />
            <button onClick={handleTrack} className="px-10 py-5 bg-white text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center gap-3">
              <Search size={14} /> {t.trackBtn}
            </button>
          </div>
          {trackResult && (
            <div className="mt-16 p-12 bg-blue-600 rounded-[3rem] text-left shadow-2xl animate-in zoom-in-95 duration-500">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Order Manifest ID: #{trackResult.order_id}</span>
              <p className="text-3xl font-black italic tracking-tighter text-white uppercase mt-4 flex items-center gap-4">
                <Truck /> {trackResult.status}
              </p>
              {trackResult.tracking_number && (
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/70">Carrier ID: {trackResult.tracking_number}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedBundle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[5rem] p-16 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 -mr-32 -mt-32 rounded-full -z-10"></div>
              <button onClick={() => setSelectedBundle(null)} className="absolute top-12 right-12 w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-950 active:scale-95 transition-all"><X size={32} /></button>
              
              {paymentStatus === 'idle' && (
                <>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 italic mb-4 inline-block">Secure Checkout</span>
                  <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-12">{t.checkout}</h2>
                  <div className="bg-slate-50 p-10 rounded-[3rem] space-y-8 mb-12">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400 italic">Selected Pack</span>
                      <span className="text-slate-900">{selectedBundle.name}</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-2">Total (incl. Free Shipping)</span>
                       <span className="text-5xl font-black italic tracking-tighter text-blue-600">${selectedBundle.price}</span>
                    </div>
                  </div>
                  <div id="paypal-button-container" className="w-full min-h-[150px]"></div>
                  <p className="mt-8 text-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
                    <Shield size={10} className="inline mr-2" /> Encrypted by PayPal Secure API
                  </p>
                </>
              )}
              
              {paymentStatus === 'processing' && (
                <div className="py-32 text-center">
                  <div className="w-24 h-24 bg-blue-50 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-10 shadow-2xl"></div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Authenticating...</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Global Vault Synchronizing</p>
                </div>
              )}
              
              {paymentStatus === 'success' && (
                <div className="py-24 text-center">
                  <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-[3.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner">
                    <CheckCircle size={72} strokeWidth={3} className="animate-in zoom-in duration-500" />
                  </div>
                  <h2 className="text-7xl font-black uppercase tracking-tighter italic mb-6">{t.success}</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] italic">Order Confirmed. Welcome to the clowand family.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Footer */}
      <footer className="bg-slate-950 py-32 text-white border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20 border-b border-white/5 pb-20 mb-20 text-center md:text-left">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-5xl font-black mb-8 italic uppercase tracking-tighter text-blue-600">clowand</h2>
              <p className="text-slate-500 max-w-sm mb-12 font-bold italic text-xs uppercase tracking-widest leading-relaxed">
                Elevating American bathroom hygiene with smarter, cleaner, and better tools. From Los Angeles to NYC.
              </p>
              <div className="flex justify-center md:justify-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Shield size={20}/></div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><CreditCard size={20}/></div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Globe size={20}/></div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-slate-300 italic">Shop Wands</h3>
              <ul className="space-y-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                <li><a href="#bundles" className="hover:text-white transition-colors">Starter Kit</a></li>
                <li><a href="#bundles" className="hover:text-white transition-colors">Value Pack</a></li>
                <li><a href="#bundles" className="hover:text-white transition-colors">Refill Box</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-slate-300 italic">Legal & Compliance</h3>
              <ul className="space-y-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refund" className="hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/compliance" className="hover:text-white transition-colors underline decoration-blue-500 underline-offset-8">ADA Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-600 text-[9px] font-black uppercase tracking-[0.5em] italic">
            © 2026 clowand. All Rights Reserved. US Patent Pending.
          </div>
      </footer>

      {/* Styles for Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .shadow-3xl {
          box-shadow: 0 40px 100px -20px rgba(37, 99, 235, 0.3);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}
