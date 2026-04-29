'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, ChevronRight, ExternalLink, Search } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

const STATUS_STEPS = ['Paid', 'Processing', 'Shipped', 'Delivered'];

const STATUS_STYLES = {
  Paid: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: Clock },
  Processing: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Package },
  Shipped: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: Truck },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-400', border: 'border-red-100', icon: XCircle },
};

function getUspstrackingUrl(trackingNumber) {
  if (!trackingNumber) return null;
  return 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' + encodeURIComponent(trackingNumber);
}

function TimelineStep({ label, active, done, isLast }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ' +
          (done ? 'bg-emerald-500 text-white' :
           active ? 'bg-[#1a3a5c] text-white ring-4 ring-[#1a3a5c]/20' :
           'bg-slate-100 text-slate-300')
        }>
          {done ? <CheckCircle size={16} /> : active ? '\u25CF' : '\u25CB'}
        </div>
        {!isLast && <div className={'w-0.5 h-10 ' + (done ? 'bg-emerald-300' : 'bg-slate-200')} />}
      </div>
      <div className={'pb-10 ' + (done || active ? 'text-slate-900' : 'text-slate-400')}>
        <p className="text-sm font-black uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function InputForm({ orderId, onSubmit }) {
  const [input, setInput] = useState(orderId || '');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(input.trim()); }} className="flex gap-4">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your order ID (e.g. CW-20260428-xxx)"
        className="flex-1 px-6 py-4 bg-white border border-[#e5e0da] rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
      />
      <button
        type="submit"
        className="flex items-center gap-2 px-8 py-4 bg-[#1a3a5c] text-white rounded-full text-[10px] font-black uppercase tracking-widest italic hover:bg-[#2a4a6c] transition-all"
      >
        <Search size={14} /> Track
      </button>
    </form>
  );
}

export default function TrackPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get('orderId') || searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderIdParam) {
      fetchOrder(orderIdParam);
    }
  }, [orderIdParam]);

  async function fetchOrder(orderId) {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (err) throw err;

      if (!data) {
        setError('Order not found. Double-check your order ID.');
      } else {
        setOrder(data);
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(input) {
    if (!input) return;
    router.push('/track?orderId=' + encodeURIComponent(input));
  }

  var statusIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;
  var statusStyle = order ? (STATUS_STYLES[order.status] || STATUS_STYLES.Processing) : null;
  var StatusIcon = statusStyle ? statusStyle.icon : Package;
  var uspsUrl = order && order.tracking_number ? getUspstrackingUrl(order.tracking_number) : null;

  if (!orderIdParam && !order) {
    return (
      <div className="min-h-screen bg-[#f2efe8]">
        <div className="bg-white border-b border-[#e5e0da]">
          <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
            <a href="/" className="text-xl font-black italic tracking-tighter uppercase text-slate-950">CLO<span className="text-blue-600">WAND</span></a>
            <a href="/account" className="text-[9px] font-black uppercase tracking-widest italic text-slate-400 hover:text-slate-600 transition-all">My Account</a>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-16 text-center">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-[#e5e0da]">
            <Truck size={36} className="text-[#1a3a5c]" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-950 mb-4">Track Your Order</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
            Enter the order ID from your shipping confirmation email to see real-time status.
          </p>
          <div className="max-w-lg mx-auto"><InputForm orderId="" onSubmit={handleSearch} /></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2efe8]">
        <div className="bg-white border-b border-[#e5e0da]">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <span className="text-xl font-black italic tracking-tighter uppercase text-slate-950">CLO<span className="text-blue-600">WAND</span></span>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-24 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#1a3a5c] border-t-transparent rounded-full mx-auto mb-6" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Looking up your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f2efe8]">
        <div className="bg-white border-b border-[#e5e0da]">
          <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
            <a href="/" className="text-xl font-black italic tracking-tighter uppercase text-slate-950">CLO<span className="text-blue-600">WAND</span></a>
            <a href="/account" className="text-[9px] font-black uppercase tracking-widest italic text-slate-400 hover:text-slate-600 transition-all">My Account</a>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-8 py-16 text-center">
          <div className="bg-white p-12 rounded-[4rem] border border-[#e5e0da] shadow-sm mb-8">
            <Search size={48} className="mx-auto text-[#e5e0da] mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-8">{error}</p>
            <InputForm orderId="" onSubmit={handleSearch} />
          </div>
          <a href="/" className="text-[#1a3a5c] text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">Back to Home</a>
        </div>
      </div>
    );
  }

  // Order found — full detail view
  return (
    <div className="min-h-screen bg-[#f2efe8]">
      <div className="bg-white border-b border-[#e5e0da]">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <a href="/" className="text-xl font-black italic tracking-tighter uppercase text-slate-950">CLO<span className="text-blue-600">WAND</span></a>
          <a href="/account" className="text-[9px] font-black uppercase tracking-widest italic text-slate-400 hover:text-slate-600 transition-all">My Account</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16 grid md:grid-cols-5 gap-12">
        {/* Left column */}
        <div className="md:col-span-3 space-y-10">

          {/* Status header */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0da] shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <StatusIcon size={28} className={statusStyle ? statusStyle.text : ''} />
              <div>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950">{order.status}</h1>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mt-1">#{order.order_id}</p>
              </div>
            </div>
            {uspsUrl && (
              <a href={uspsUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a3a5c] text-white rounded-full text-[10px] font-black uppercase tracking-widest italic hover:bg-[#2a4a6c] transition-all group">
                <Truck size={16} /> Track on USPS <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0da] shadow-sm">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mb-8">Order Progress</h3>
            {STATUS_STEPS.map(function(step, i) {
              return <TimelineStep key={step} label={step} active={statusIdx === i} done={statusIdx > i} isLast={i === STATUS_STEPS.length - 1} />;
            })}
            {order.status === 'Cancelled' && (
              <div className="mt-4 flex items-center gap-3 bg-red-50 p-4 rounded-xl text-red-400 text-[9px] font-black uppercase tracking-widest italic">
                <XCircle size={16} /> This order has been cancelled
              </div>
            )}
          </div>

          {/* Shipping address */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0da] shadow-sm">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mb-6 flex items-center gap-2">
              <MapPin size={14} /> Shipping To
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="font-bold text-slate-900">{order.customer_name}</p>
              <p>{order.shipping_address || '\u2014'}</p>
              <p>{[order.shipping_city, order.shipping_state, order.shipping_zip].filter(Boolean).join(', ') || '\u2014'}</p>
              <p>{order.shipping_country || 'US'}</p>
            </div>
            {order.shipped_at && (
              <p className="text-[9px] text-slate-400 italic mt-6">
                Shipped on {new Date(order.shipped_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>

          {/* Track another */}
          <div className="pt-4">
            <details className="group">
              <summary className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic cursor-pointer hover:text-slate-600 transition-all list-none flex items-center gap-2">
                Track another order <ChevronRight size={12} className="group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-6"><InputForm orderId="" onSubmit={handleSearch} /></div>
            </details>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-8">

          {/* Product card */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0da] shadow-sm">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mb-6">Product</h3>
            <div className="w-full aspect-square bg-[#eef2f5] rounded-2xl flex items-center justify-center mb-6">
              <Package size={48} className="text-[#1a3a5c]/30" />
            </div>
            <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">{order.product_name}</h4>
            <p className="text-3xl font-black italic tracking-tighter text-[#1a3a5c] mb-4">${parseFloat(order.amount).toFixed(2)}</p>
            {order.tracking_number && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 italic mb-2">Tracking #</p>
                <p className="text-sm font-mono font-bold text-slate-900 break-all">{order.tracking_number}</p>
              </div>
            )}
          </div>

          {/* Order meta */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0da] shadow-sm">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mb-6">Details</h3>
            <div className="space-y-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <div className="flex justify-between">
                <span className="text-slate-400 italic">Order ID</span>
                <span className="text-slate-900">{order.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 italic">Status</span>
                <span className={statusStyle ? statusStyle.text : ''}>{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 italic">Payment</span>
                <span className="text-slate-900">{order.payment_method || 'PayPal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 italic">Ordered</span>
                <span className="text-slate-900">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 italic mb-2">Need Help?</p>
            <a href="mailto:support@clowand.com" className="text-[10px] text-[#1a3a5c] font-black uppercase tracking-wider italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">support@clowand.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
