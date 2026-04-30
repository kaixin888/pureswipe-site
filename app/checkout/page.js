"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, CreditCard, ChevronDown, CheckCircle, AlertCircle, Trash2, Mail, ShieldCheck, Zap } from 'lucide-react';
import { useCart } from 'react-use-cart';
import { useStore } from '../../components/Providers';
import StripeCheckout from '../../components/StripeCheckout';
import { createClient } from '@supabase/supabase-js';
import DeliveryCountdown from '../../components/DeliveryCountdown';
import { useSearchParams } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import UpsellModal from '../../components/UpsellModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY',
);

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { items, cartTotal, emptyCart, updateItemQuantity, removeItem } = useCart();
  const {
    isCheckoutOpen, setIsCheckoutOpen,
    customerEmail, setCustomerEmail,
    customerName, setCustomerName,
    checkoutStep, setCheckoutStep,
    discountInfo, setDiscountInfo,
  } = useStore();

  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paymentTab, setPaymentTab] = useState('card');
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [upsellPaymentMethod, setUpsellPaymentMethod] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  // Apply coupon from URL (abandoned cart recovery)
  useEffect(() => {
    const coupon = searchParams.get('coupon');
    if (coupon && mounted) {
      setDiscountCode(coupon);
      applyDiscountCode(coupon);
    }
  }, [mounted, searchParams]);

  const finalTotal = discountInfo
    ? cartTotal * (1 - discountInfo.discountPercent / 100)
    : cartTotal;

  const applyDiscountCode = async (code) => {
    if (!code) return;
    setIsApplyingDiscount(true);
    setDiscountError('');
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', code.toUpperCase())
      .gte('valid_until', new Date().toISOString())
      .single();
    if (data && data.is_active) {
      setDiscountInfo({ code: data.code, discountPercent: data.discount_percent });
    } else {
      setDiscountError(error ? 'Invalid code' : 'Code expired or inactive');
    }
    setIsApplyingDiscount(false);
  };

  // Step 1: Email/Name form
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    // Create Pending order for abandonment tracking
    const orderId = 'ORD-' + Date.now();
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          customer_name: customerName,
          email: customerEmail,
          amount: finalTotal.toFixed(2),
          product_name: items.map((i) => i.name).join(', '),
          status: 'Pending',
        }),
      });
    } catch {
      // non-blocking — proceed to payment
    }
    setCheckoutStep('payment');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 bg-[#faf9f7]">
      <div className="max-w-4xl mx-auto">
        {/* Back + Title row */}
        <div className="flex items-center gap-4 mb-12">
          <Link
            href="/cart"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft size={18} className="text-[#5a6978]" />
          </Link>
          <div>
            <h1 className="text-3xl font-display tracking-tight text-[#1a2935]">
              Checkout
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#5a6978] italic mt-1">
              Secure checkout powered by Stripe
            </p>
          </div>

          <div className="ml-auto hidden md:block">
            <DeliveryCountdown />
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Main — Info/Payment */}
          <div className="md:col-span-3 space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic ${
                  checkoutStep === 'info'
                    ? 'bg-[#1a3a5c] text-white'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {checkoutStep !== 'info' && <CheckCircle size={12} />}
                1. Information
              </div>
              <div className="w-8 h-px bg-slate-200" />
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic ${
                  checkoutStep === 'payment'
                    ? 'bg-[#1a3a5c] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {checkoutStep === 'payment' && paymentStatus === 'success' ? (
                  <CheckCircle size={12} />
                ) : (
                  <CreditCard size={12} />
                )}
                2. Payment
              </div>
            </div>

            {/* Step 1: Contact Info */}
            {checkoutStep === 'info' && (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h2 className="text-lg font-black italic tracking-tighter uppercase text-slate-950 mb-8">
                  Contact Information
                </h2>
                <form onSubmit={handleInfoSubmit} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-2 block ml-4">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-2 block ml-4">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!customerName || !customerEmail}
                    className="w-full py-5 bg-[#2ecc71] text-white rounded-full text-[10px] font-black uppercase tracking-widest italic hover:bg-[#27ae60] transition-all disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {checkoutStep === 'payment' && (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h2 className="text-lg font-black italic tracking-tighter uppercase text-slate-950 mb-6">
                  Payment Method
                </h2>

                {/* Payment Tab Toggle */}
                <div className="flex bg-slate-50 rounded-full p-1 mb-8">
                  <button
                    onClick={() => setPaymentTab('card')}
                    className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest italic transition-all ${
                      paymentTab === 'card'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CreditCard size={14} className="inline mr-2" />
                    Credit Card
                  </button>
                  <button
                    onClick={() => setPaymentTab('paypal')}
                    className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest italic transition-all ${
                      paymentTab === 'paypal'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CreditCard size={14} className="inline mr-2" />
                    PayPal
                  </button>
                </div>

                {/* Credit Card — Stripe */}
                {paymentTab === 'card' && (
                  <div>
                    <StripeCheckout
                      amount={Math.round(finalTotal * 100)}
                      customerName={customerName}
                      customerEmail={customerEmail}
                      onSuccess={(paymentIntent) => {
                        setPaymentStatus('success');
                        // Capture payment_method for one-click upsell
                        if (paymentIntent?.payment_method) {
                          setUpsellPaymentMethod(paymentIntent.payment_method);
                        }
                        const orderId = 'ORD-' + Date.now();
                        // Save order to Supabase
                        fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            order_id: orderId,
                            customer_name: customerName,
                            email: customerEmail,
                            amount: finalTotal.toFixed(2),
                            product_name: items.map(i => i.name).join(', '),
                            items: items,
                            status: 'Paid',
                            payment_method: 'stripe',
                          }),
                        }).catch(() => {});
                        setCurrentOrderId(orderId);
                        // Show upsell before emptying cart
                        setShowUpsell(true);
                      }}
                      onError={(msg) => setPaymentStatus('error')}
                    />
                  </div>
                )}

                {/* PayPal */}
                {paymentTab === 'paypal' && (
                  <div className="min-h-[200px]">
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                        currency: 'USD',
                        intent: 'capture',
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{
                              amount: { value: finalTotal.toFixed(2) },
                              description: items.map(i => i.name).join(', '),
                            }],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const capture = await actions.order.capture();
                          if (capture.status === 'COMPLETED') {
                            setPaymentStatus('success');
                            const orderId = 'ORD-' + Date.now() + '-PP';
                            await fetch('/api/orders', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                order_id: orderId,
                                customer_name: customerName,
                                email: customerEmail,
                                amount: finalTotal.toFixed(2),
                                product_name: items.map(i => i.name).join(', '),
                                items: items,
                                status: 'Paid',
                                payment_method: 'paypal',
                              }),
                            });
                            setCurrentOrderId(orderId);
                            setShowUpsell(true);
                          }
                        }}
                        onError={(err) => {
                          setPaymentStatus('error');
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}

                {paymentStatus === 'success' && (
                  <div className="mt-6 p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-green-700">Payment Successful!</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-500 italic mt-1">
                      Your order is being processed
                    </p>
                  </div>
                )}

                {paymentStatus === 'error' && (
                  <div className="mt-6 p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
                    <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-red-700">Payment Failed</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 italic mt-1">
                      Please try another payment method
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar — Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm sticky top-28">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag size={18} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                  Order Summary ({items.length})
                </span>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                  />
                  <button
                    onClick={() => applyDiscountCode(discountCode)}
                    disabled={isApplyingDiscount || !discountCode}
                    className="px-5 py-3 bg-[#1a3a5c] text-white rounded-full text-[9px] font-black uppercase tracking-widest italic hover:bg-[#2a4a6c] transition-all disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {discountInfo && (
                  <p className="text-[9px] font-black text-green-500 uppercase tracking-wider mt-2 text-center">
                    {discountInfo.code}: {discountInfo.discountPercent}% OFF
                  </p>
                )}
                {discountError && (
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-wider mt-2 text-center">
                    {discountError}
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-slate-50 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    Subtotal
                  </span>
                  <span className="text-sm font-black text-slate-800">${cartTotal.toFixed(2)}</span>
                </div>
                {discountInfo && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500 italic">
                      Discount ({discountInfo.discountPercent}%)
                    </span>
                    <span className="text-sm font-black text-green-500">
                      -${(cartTotal * (discountInfo.discountPercent / 100)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">
                    Total
                  </span>
                  <span className="text-xl font-black text-slate-800">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 text-[9px] font-black uppercase tracking-widest text-slate-300 italic">
                <ShieldCheck size={12} />
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Purchase Upsell Modal */}
      {showUpsell && (
        <UpsellModal
          orderId={currentOrderId}
          email={customerEmail}
          type={paymentTab === 'card' ? 'stripe' : 'paypal'}
          paymentMethod={upsellPaymentMethod} // Stripe pm_xxx for one-click upsell
          onAccept={() => {
            setShowUpsell(false);
            emptyCart();
          }}
          onDecline={() => {
            setShowUpsell(false);
            emptyCart();
          }}
        />
      )}
    </div>
  );
}
