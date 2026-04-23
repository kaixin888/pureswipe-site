'use client'

import React, { useState, useEffect } from 'react'
import { X, CreditCard, ChevronDown, CheckCircle, AlertCircle, Trash2, Mail, Phone, MapPin, Zap, ShieldCheck } from 'lucide-react'
import { useCart } from 'react-use-cart'
import { useStore } from './Providers'
import StripeCheckout from './StripeCheckout'
import { createClient } from '@supabase/supabase-js'
import DeliveryCountdown from './DeliveryCountdown'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY')

export default function GlobalCheckout() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { 
    setMounted(true)
    console.log('[GlobalCheckout] Mounted')
  }, [])

  const { items, cartTotal, emptyCart, updateItemQuantity, removeItem } = useCart()
  const { 
    isCheckoutOpen, setIsCheckoutOpen,
    customerEmail, setCustomerEmail,
    customerName, setCustomerName,
    checkoutStep, setCheckoutStep,
    discountInfo, setDiscountInfo
  } = useStore()

  useEffect(() => {
    console.log('[GlobalCheckout] isCheckoutOpen:', isCheckoutOpen)
  }, [isCheckoutOpen])

  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [paymentTab, setPaymentTab] = useState('card') // 'paypal' | 'card'
  const [discountCode, setDiscountCode] = useState('')
  const [discountError, setDiscountError] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)

  const finalTotal = discountInfo ? (cartTotal * (1 - discountInfo.discountPercent / 100)) : cartTotal

  // Hide Chatwoot during checkout
  useEffect(() => {
    if (!mounted) return
    const bubble = document.querySelector('#cw-bubble-holder');
    const widget = document.querySelector('#cw-widget-holder');
    if (isCheckoutOpen) {
      if (bubble) bubble.style.setProperty('display', 'none', 'important');
      if (widget) widget.style.setProperty('display', 'none', 'important');
      window.$chatwoot?.toggleBubbleVisibility?.('hide');
    } else {
      if (bubble) bubble.style.removeProperty('display');
      if (widget) widget.style.removeProperty('display');
      window.$chatwoot?.toggleBubbleVisibility?.('show');
    }
  }, [isCheckoutOpen, mounted])

  // PayPal SDK loading
  useEffect(() => {
    if (!mounted || !isCheckoutOpen) return
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&disable-funding=credit,card`
    script.addEventListener('load', () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: finalTotal.toFixed(2) },
                description: items.map(i => `${i.quantity}x ${i.name}`).join(', ')
              }]
            })
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture()
            handlePayPalSuccess(order)
          },
          onError: (err) => {
            console.error('PayPal Error:', err)
            setPaymentStatus('error')
          }
        }).render('#paypal-button-container-global')
      }
    })
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [isCheckoutOpen, finalTotal])

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    setIsApplyingDiscount(true)
    setDiscountError('')
    
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setDiscountError('Invalid or expired discount code.')
      } else {
        setDiscountInfo({
          code: data.code,
          discountPercent: data.discount_percent
        })
      }
    } catch (e) {
      setDiscountError('Error applying discount.')
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const handleNextStep = async () => {
    if (!customerEmail || !customerName) return
    setCheckoutStep('payment')

    // GA4: begin_checkout
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: finalTotal,
        items: items.map(item => ({
          item_id: item.id.toString(),
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      })
    }
    
    // Insert pending order
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: `PENDING-${Math.random().toString(36).slice(-6).toUpperCase()}`,
        customer_name: customerName,
        email: customerEmail,
        status: 'Pending',
        amount: finalTotal,
        product_name: items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
        items: items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
        discount_code: discountInfo ? discountInfo.code : null
      })
    }).catch(() => {})
  }

  const handlePayPalSuccess = async (details) => {
    setPaymentStatus('processing')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: details.id,
          customer_name: customerName,
          email: customerEmail,
          status: 'Paid',
          amount: finalTotal,
          product_name: items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
          discount_code: discountInfo ? discountInfo.code : null
        })
      })
      if (res.ok) {
        setPaymentStatus('success')
        emptyCart()
        setTimeout(() => { setIsCheckoutOpen(false); setPaymentStatus('idle'); setCheckoutStep('info'); }, 5000)
      } else {
        setPaymentStatus('error')
      }
    } catch (e) {
      setPaymentStatus('error')
    }
  }

  if (!mounted || !isCheckoutOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[130] animate-in fade-in duration-300"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={() => { setIsCheckoutOpen(false); setCheckoutStep('info'); }}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-[140] bg-white rounded-t-3xl md:rounded-3xl md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl animate-in slide-in-from-bottom md:zoom-in duration-300 flex flex-col overflow-hidden shadow-2xl"
        style={{ maxHeight: '92vh' }}
      >
        <div className="shrink-0 pt-3 pb-1 md:hidden flex justify-center">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <button
          onClick={() => { setIsCheckoutOpen(false); setCheckoutStep('info'); }}
          className="absolute top-3 right-4 p-2 hover:bg-slate-50 rounded-full transition-all text-slate-300 hover:text-slate-950 z-[150]"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-10 md:py-10">
          <div className="mb-8">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Securing Order</span>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mt-2 text-slate-950">Checkout</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left: Summary */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 flex justify-between items-center group">
                    <div className="min-w-0 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5 bg-white rounded-lg border border-slate-200 p-0.5">
                          <button 
                            onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors text-[10px]"
                          >
                            -
                          </button>
                          <span className="text-[9px] font-black text-slate-950 w-3 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors text-[10px]"
                          >
                            +
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors ml-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <h4 className="text-xs font-black italic uppercase tracking-tight text-slate-900 truncate">{item.name}</h4>
                    </div>
                    <p className="text-sm font-black italic tracking-tighter text-blue-600 shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Discount */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(''); setDiscountInfo(null); }}
                    placeholder="Discount code"
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isApplyingDiscount || !discountCode.trim()}
                    className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-blue-600 transition-colors"
                  >
                    {isApplyingDiscount ? '...' : 'Apply'}
                  </button>
                </div>
                {discountError && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{discountError}</p>}
                {discountInfo && <p className="text-[10px] text-emerald-600 font-bold mt-2 ml-1">✓ {discountInfo.code} applied (-{discountInfo.discountPercent}%)</p>}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {discountInfo && (
                  <div className="flex justify-between text-xs font-medium text-emerald-600">
                    <span>Discount ({discountInfo.code})</span>
                    <span>-${(cartTotal - finalTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Shipping</span>
                  <span className="text-blue-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-black italic uppercase tracking-widest text-slate-950">Total</span>
                  <span className="text-2xl font-black italic tracking-tighter text-blue-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8">
                <DeliveryCountdown />
              </div>
            </div>

            {/* Right: Payment */}
            <div>
              {checkoutStep === 'info' ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Contact Information</h3>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full border border-slate-200 rounded-xl px-5 py-4 text-sm font-black italic uppercase tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full border border-slate-200 rounded-xl px-5 py-4 text-sm font-black italic uppercase tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                    />
                  </div>
                  <button
                    onClick={handleNextStep}
                    disabled={!customerEmail || !customerName}
                    className="w-full py-5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-40 active:scale-95"
                  >
                    Continue to Payment
                  </button>
                  <p className="text-[9px] text-slate-400 text-center flex items-center justify-center gap-1.5 font-medium italic">
                    <ShieldCheck size={12} className="text-emerald-500" /> All data is encrypted and secure.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                   <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-2">
                    <button
                      onClick={() => setPaymentTab('card')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentTab === 'card' ? 'bg-white shadow-sm text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <CreditCard size={14} /> Card / GPay
                    </button>
                    <button
                      onClick={() => setPaymentTab('paypal')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentTab === 'paypal' ? 'bg-white shadow-sm text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      PayPal
                    </button>
                  </div>

                  {paymentStatus === 'idle' ? (
                    <>
                      {paymentTab === 'card' ? (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-[300px]">
                          <StripeCheckout 
                            amount={finalTotal} 
                            customerName={customerName} 
                            customerEmail={customerEmail}
                            items={items.map(i => `${i.quantity}x ${i.name}`).join(' | ')}
                            onSuccess={() => {
                              setPaymentStatus('success');
                              emptyCart();
                              setTimeout(() => { setIsCheckoutOpen(false); setPaymentStatus('idle'); setCheckoutStep('info'); }, 5000);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                          <div id="paypal-button-container-global" className="w-full" />
                        </div>
                      )}
                    </>
                  ) : paymentStatus === 'processing' ? (
                    <div className="py-20 text-center animate-in zoom-in duration-300">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      <p className="text-sm font-black italic tracking-tighter text-slate-950 uppercase">Finalizing your hygiene upgrade...</p>
                    </div>
                  ) : paymentStatus === 'success' ? (
                    <div className="py-16 text-center animate-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                      </div>
                      <h3 className="text-2xl font-black italic tracking-tighter text-emerald-600 uppercase mb-2">Success!</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Check your email for confirmation.</p>
                    </div>
                  ) : (
                    <div className="py-16 text-center animate-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} />
                      </div>
                      <h3 className="text-xl font-black italic tracking-tighter text-red-600 uppercase mb-2">Payment Failed</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400 italic mb-6">Please try again or contact support.</p>
                      <button onClick={() => setPaymentStatus('idle')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 underline">Try Again</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
