'use client'

import React, { useState, useEffect, Fragment } from 'react'
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
  { q: "What is your return policy?", a: "We offer a 100% Satisfaction Guarantee. If you're not happy with clowand, we'll provide a full refund—no need to ship used products back. Your hygiene and convenience are our priority." },
  { q: "Are the refill pads environmentally friendly?", a: "Yes! Our refills are made from biodegradable materials and the packaging is 100% recyclable. Clean your home without the guilt." },
  { q: "Will the pads work on my toilet?", a: "Clowand is designed to reach deep under the rim and into the trap, making it effective for 99% of toilet designs including low-flow models." },
  { q: "How many uses do I get per pad?", a: "Each pad is single-use for maximum hygiene. It contains enough concentrated cleaning agent for one thorough, deep clean." }
]

function TrustBar() {
  return (
    <div className="flex flex-wrap justify-center gap-12 py-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
      <div className="flex items-center gap-2"><Shield size={24} /> <span className="font-black italic uppercase tracking-tighter">Certified Hygienic</span></div>
      <div className="flex items-center gap-2"><Globe size={24} /> <span className="font-black italic uppercase tracking-tighter">Ships USA</span></div>
      <div className="flex items-center gap-2"><Droplets size={24} /> <span className="font-black italic uppercase tracking-tighter">Zero Splash</span></div>
      <div className="flex items-center gap-2"><CheckCircle size={24} /> <span className="font-black italic uppercase tracking-tighter">FDA Standard</span></div>
    </div>
  )
}

function ProductModal({ product, onClose, onPurchase }) {
  const [step, setStep] = useState('details')
  const [formData, setFormData] = useState({ name: '', email: '', address: '', zip: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const orderId = 'CW-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    
    const { error } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        customer_name: formData.name,
        customer_email: formData.email,
        shipping_address: formData.address,
        shipping_zip: formData.zip,
        product_name: product.name,
        amount: product.price,
        status: 'Processing'
      }])

    if (!error) {
      setStep('success')
      onPurchase(orderId)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0f172a]/95 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl bg-white text-slate-950 rounded-[3rem] overflow-hidden shadow-2xl border border-white/20">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-all"><X size={24}/></button>
        
        <div className="p-12 md:p-16">
          {step === 'details' && (
            <div className="space-y-12">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary italic">{product.tag}</span>
                <h3 className="text-5xl font-black italic tracking-tighter leading-none uppercase">{product.name}</h3>
                <p className="text-4xl font-black italic tracking-tighter text-slate-400 leading-none mt-2">${product.price}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-slate-50">
                {product.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                    <CheckCircle className="text-brand-primary" size={16} /> {item}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep('shipping')}
                className="w-full py-8 bg-brand-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl shadow-brand-primary/20"
              >
                Proceed to Checkout
              </button>
            </div>
          )}

          {step === 'shipping' && (
            <div className="space-y-10">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase">Shipping Details</h3>
              <div className="space-y-6">
                <input 
                  type="text" placeholder="Full Name" 
                  className="w-full p-8 bg-slate-50 border-none rounded-[2rem] font-black focus:ring-2 focus:ring-brand-primary uppercase tracking-widest text-[10px]"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" placeholder="Email Address" 
                  className="w-full p-8 bg-slate-50 border-none rounded-[2rem] font-black focus:ring-2 focus:ring-brand-primary uppercase tracking-widest text-[10px]"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="text" placeholder="Shipping Address" 
                  className="w-full p-8 bg-slate-50 border-none rounded-[2rem] font-black focus:ring-2 focus:ring-brand-primary uppercase tracking-widest text-[10px]"
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <input 
                  type="text" placeholder="ZIP Code (US)" 
                  className="w-full p-8 bg-slate-50 border-none rounded-[2rem] font-black focus:ring-2 focus:ring-brand-primary uppercase tracking-widest text-[10px]"
                  value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSubmit} disabled={loading}
                className="w-full py-8 bg-brand-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-orange transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-20 space-y-8">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-green-500/20"><CheckCircle size={48} /></div>
              <h3 className="text-5xl font-black italic tracking-tighter uppercase">Order Success!</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmation sent to {formData.email}</p>
              <button onClick={onClose} className="px-12 py-6 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Back to Store</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClowandPage() {
  const [lang] = useState('en')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [trackId, setTrackId] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [activeFaq, setActiveFaq] = useState(null)
  const t = TRANSLATIONS[lang]

  const handleTrack = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', trackId.startsWith('#') ? trackId.slice(1) : trackId)
      .single()

    if (!error && data) setTrackResult(data)
  }

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans selection:bg-brand-primary selection:text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-slate-50 -skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-12">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-brand-primary/5 rounded-full border border-brand-primary/10">
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary italic">Now Shipping Across USA</span>
            </div>
            <h1 className="text-8xl md:text-[9rem] font-black italic tracking-tighter leading-[0.85] uppercase">
              {t.heroTitle.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? 'text-brand-primary block ml-8' : 'block'}>{word}</span>
              ))}
            </h1>
            <p className="max-w-lg text-lg font-bold uppercase tracking-widest text-slate-400 leading-relaxed italic">
              {t.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-8">
              <a href="#bundles" className="px-12 py-8 bg-slate-950 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-2xl shadow-slate-950/20 text-center">
                {t.shopBundles}
              </a>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary italic">Zero-Contact Guard</span>
                <span className="text-xs font-black italic tracking-tighter uppercase text-slate-400">Professional Grade</span>
              </div>
            </div>
          </div>
          <div className="relative group">
             <div className="absolute -inset-10 bg-brand-primary/20 blur-[120px] rounded-full group-hover:bg-brand-orange/30 transition-all duration-1000" />
             <div className="relative bg-white p-4 rounded-[4rem] shadow-2xl border border-slate-50">
               <img 
                 src="https://sc02.alicdn.com/kf/S7f766100cc8b4b738198f32145e1284a1.jpg" 
                 alt="Clowand 18-inch Wand" 
                 className="rounded-[3rem] w-full h-auto grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 max-w-[240px]">
                 <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white"><Shield size={20} /></div>
                   <span className="text-[10px] font-black uppercase tracking-widest italic">Industry First</span>
                 </div>
                 <p className="text-sm font-black italic tracking-tighter leading-tight uppercase">Manual Isolation Mechanism v2.0</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <TrustBar />
      </div>

      {/* Bento Features */}
      <section className="py-40" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-slate-950 p-16 rounded-[4rem] text-white flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 blur-[100px] bg-brand-primary" />
              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center"><Ruler size={32} /></div>
                <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{t.handleTitle}</h3>
                <p className="text-lg font-bold uppercase tracking-widest text-slate-400 italic leading-relaxed max-w-md">{t.handleDesc}</p>
              </div>
              <div className="mt-12 flex gap-8">
                 <div className="text-center">
                    <p className="text-4xl font-black italic tracking-tighter leading-none text-brand-primary">18"</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-2 opacity-40">Safety Reach</p>
                 </div>
                 <div className="text-center border-l border-white/10 pl-8">
                    <p className="text-4xl font-black italic tracking-tighter leading-none">ZERO</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-2 opacity-40">Contact Risk</p>
                 </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-16 rounded-[4rem] flex flex-col justify-between border border-slate-100">
               <div className="space-y-6">
                 <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center text-brand-primary"><Recycle size={32} /></div>
                 <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{t.zeroTouchTitle}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-loose">{t.zeroTouchDesc}</p>
               </div>
            </div>

            <div className="bg-slate-50 p-16 rounded-[4rem] border border-slate-100 flex flex-col justify-between group overflow-hidden">
               <div className="space-y-6 relative z-10">
                 <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center text-brand-primary"><Droplet size={32} /></div>
                 <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{t.padTitle}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-loose">{t.padDesc}</p>
               </div>
               <div className="mt-10 h-1 bg-slate-200 rounded-full relative overflow-hidden">
                 <div className="absolute inset-0 bg-brand-primary w-2/3 group-hover:w-full transition-all duration-1000" />
               </div>
            </div>

            <div className="md:col-span-2 bg-brand-primary p-16 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="space-y-6">
                 <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Bio-Safety Standard</h3>
                 <p className="text-lg font-bold uppercase tracking-widest italic opacity-80 max-w-md leading-relaxed">Engineered for US residential standards. High-strength polymers, ergonomic grip, instant pad release.</p>
               </div>
               <div className="shrink-0 w-32 h-32 border-4 border-white/20 rounded-full flex items-center justify-center">
                 <Shield size={64} className="opacity-40" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section className="py-40 bg-slate-50" id="bundles">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6 mb-32">
             <h2 className="text-7xl font-black italic tracking-tighter leading-none uppercase">{t.bundles}</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">{t.saveUpTo}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {BUNDLES.map((bundle) => (
              <div key={bundle.id} className={`relative p-2 bg-white rounded-[4rem] transition-all duration-700 hover:-translate-y-4 shadow-xl shadow-slate-200/50 ${bundle.popular ? 'border-4 border-brand-primary' : 'border border-slate-100'}`}>
                {bundle.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {t.mostPopular}
                  </div>
                )}
                <div className="p-12 space-y-12">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary italic">{bundle.tag}</span>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{bundle.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black italic tracking-tighter leading-none">${bundle.price}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">USD</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {bundle.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic text-slate-400">
                        <CheckCircle size={16} className="text-brand-primary" /> {item}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(bundle)}
                    className={`w-full py-8 rounded-full text-xs font-black uppercase tracking-widest transition-all ${bundle.popular ? 'bg-brand-primary text-white hover:bg-brand-orange shadow-xl shadow-brand-primary/20' : 'bg-slate-950 text-white hover:bg-brand-primary'}`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-40">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-6xl font-black italic tracking-tighter uppercase text-center mb-24">Common Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
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
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">
            © 2026 clowand. All Rights Reserved.
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onPurchase={(id) => console.log('Order created:', id)}
        />
      )}
    </div>
  )
}
