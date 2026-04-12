'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Play, ShieldCheck, Zap, Droplets, CheckCircle, Package, CreditCard, Truck, Globe, X, Search, MapPin, Star } from 'lucide-react'

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
  },
  es: {
    heroTitle: "Limpia más inteligente, no más fuerte.",
    heroSub: "La revolución higiénica de 18 pulgadas para su baño. Almohadillas de triple acción, mecanismo sin contacto.",
    shopBundles: "Comprar Paquetes",
    freeShipping: "Envío Gratis en Todo EE. UU.",
    features: "Características",
    bundles: "Elija su Paquete",
    saveUpTo: "Ahorre hasta un 40% con paquetes a granel",
    zeroTouchTitle: "Cero Contacto",
    zeroTouchDesc: "Coloque y suelte con un solo clic. Sus manos nunca touch el agua sucia.",
    handleTitle: "Alcance Largo de 18\"",
    handleDesc: "La longitud líder en la industria lo mantiene a una distancia segura. No más agacharse.",
    padTitle: "Almohadilla de Poder de 3 Capas",
    padDesc: "Frote, desinfecte y proteja con nuestra tecnología de estropajo reforzado de 3 capas.",
    mostPopular: "Más Popular",
    checkout: "Pagar",
    payNow: "Pagar Ahora",
    success: "¡Éxito!",
    trackTitle: "Seguir Pedido",
    trackInput: "ID de Pedido",
    trackBtn: "Seguir"
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

export default function Home() {
  const [lang, setLang] = useState('en')
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [trackId, setTrackId] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [paypalLoaded, setPaypalLoaded] = useState(false)

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
            await supabase.from('orders').insert([{
              order_id: `CW-${order.id.slice(-6)}`,
              customer_name: order.payer.name.given_name + ' ' + order.payer.name.surname,
              email: order.payer.email_address,
              amount: selectedBundle.price,
              product_name: selectedBundle.name,
              status: 'Paid'
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
    <main className="min-h-screen bg-white text-slate-950 selection:bg-blue-100 pt-20">
      <div className="bg-slate-950 text-white py-3 text-[10px] font-black uppercase tracking-[0.3em] text-center italic">
        {t.freeShipping}
      </div>

      <section id="features" className="max-w-7xl mx-auto px-6 pt-20 pb-40 text-center relative overflow-hidden">
        <h1 className="text-8xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] italic mb-12">
          {t.heroTitle.split(',')[0]}<br/>
          <span className="text-blue-600">{t.heroTitle.split(',')[1]}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-16 italic">
          {t.heroSub}
        </p>
        <button onClick={() => document.getElementById('bundles').scrollIntoView({ behavior: 'smooth' })} className="px-16 py-8 bg-slate-950 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
          {t.shopBundles}
        </button>
      </section>

      <section id="bundles" className="py-40 max-w-7xl mx-auto px-6">
        <div className="text-center mb-32">
          <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-8">{t.bundles}</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 italic underline underline-offset-8 decoration-blue-100">{t.saveUpTo}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {BUNDLES.map(bundle => (
            <div key={bundle.id} className={`p-16 rounded-[4rem] border-4 transition-all duration-500 relative group overflow-hidden ${bundle.popular ? 'border-blue-600 bg-slate-950 text-white shadow-3xl scale-105 z-10' : 'border-slate-100 hover:border-blue-200'}`}>
              <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-2 leading-none">{bundle.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest italic mb-12 ${bundle.popular ? 'text-blue-400' : 'text-slate-400'}`}>{bundle.description}</p>
              <div className="text-7xl font-black italic tracking-tighter mb-12 leading-none">
                <span className="text-3xl font-bold align-top mt-2 mr-1">$</span>{bundle.price}
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
                className={`w-full py-8 rounded-[2.5rem] text-xs font-black uppercase tracking-widest transition-all ${bundle.popular ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-950 text-white'}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="py-40 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-8">What People Say</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 italic">Join 50,000+ Clean Bathrooms</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-12 rounded-[3rem] shadow-sm">
              <div className="flex gap-2 mb-6 text-yellow-400">
                <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} />
              </div>
              <p className="text-xl font-bold italic text-slate-900 mb-6 uppercase tracking-tighter">"The 18-inch handle is a back-saver. Best hygienic system I've used."</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">— Sarah M., Los Angeles</p>
            </div>
            <div className="bg-white p-12 rounded-[3rem] shadow-sm">
              <div className="flex gap-2 mb-6 text-yellow-400">
                <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} /> <Star fill="currentColor" size={16} />
              </div>
              <p className="text-xl font-bold italic text-slate-900 mb-6 uppercase tracking-tighter">"Zero touch actually works. The pads scrub better than regular brushes."</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">— Michael R., New York</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-40">
        <div className="max-w-xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-12">{t.trackTitle}</h2>
          <div className="flex gap-4 p-4 bg-white/5 rounded-[3rem] border border-white/10">
            <input 
              type="text" 
              placeholder={t.trackInput} 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="flex-1 bg-transparent border-none text-white px-8 font-black focus:ring-0 uppercase tracking-widest text-sm"
            />
            <button onClick={handleTrack} className="px-10 py-5 bg-white text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              {t.trackBtn}
            </button>
          </div>
          {trackResult && (
            <div className="mt-16 p-12 bg-white/5 border border-white/10 rounded-[3rem] text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID: #{trackResult.order_id}</span>
              <p className="text-2xl font-black italic tracking-tighter text-white uppercase mt-4">{trackResult.status}</p>
            </div>
          )}
        </div>
      </section>

      {selectedBundle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6">
          <div className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-2xl relative">
            <button onClick={() => setSelectedBundle(null)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-950"><X size={40} /></button>
            {paymentStatus === 'idle' && (
              <>
                <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-12">{t.checkout}</h2>
                <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-slate-400 italic">Product</span>
                    <span className="text-slate-900">{selectedBundle.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-slate-400 italic">Total</span>
                    <span className="text-blue-600 font-black">${selectedBundle.price}</span>
                  </div>
                </div>
                <div id="paypal-button-container" className="w-full min-h-[150px]"></div>
              </>
            )}
            {paymentStatus === 'processing' && (
              <div className="py-32 text-center">
                <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Authorizing Transaction...</p>
              </div>
            )}
            {paymentStatus === 'success' && (
              <div className="py-24 text-center">
                <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-12">
                  <CheckCircle size={64} strokeWidth={3} />
                </div>
                <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-6">{t.success}</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Order Confirmed.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}