"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Package, User, MapPin, LogOut, ChevronRight, ShoppingBag, Repeat, RotateCcw, Pause, Play, XCircle, Gift, Copy, Check, ExternalLink } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

const FREQ_LABELS = {
  'every_1_month': 'Every 1 Month',
  'every_2_months': 'Every 2 Months',
  'every_3_months': 'Every 3 Months',
  'every_6_months': 'Every 6 Months'
};

export default function Account() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState({ total: 0, pending: 0, converted: 0, earnings: 0 });
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const router = useRouter();

  // 订阅操作 loading 状态
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Fetch orders for this user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('email', session.user.email)
        .order('created_at', { ascending: false });

      if (!ordersError) {
        setOrders(ordersData);
      }

      // Fetch subscriptions for this user (via API for joined data)
      try {
        const res = await fetch(`/api/subscriptions?userId=${session.user.id}`);
        const json = await res.json();
        if (json.subscriptions) {
          setSubscriptions(json.subscriptions);
        }
      } catch (e) {
        console.error('Failed to fetch subscriptions:', e);
      }

      // Fetch referrals for this user
      try {
        const res = await fetch(`/api/referrals?userId=${session.user.id}`);
        const json = await res.json();
        if (json.referrals) {
          setReferrals(json.referrals);
          setReferralStats(json.stats || { total: 0, pending: 0, converted: 0, earnings: 0 });
          setReferralLink(json.referralLink || '');
        }
      } catch (e) {
        console.error('Failed to fetch referrals:', e);
      }

      setLoading(false);
    };

    fetchUserAndOrders();
  }, [router]);

  // 订阅操作处理
  const handleSubscriptionAction = async (subId, action) => {
    setActionLoading(subId);
    try {
      const res = await fetch(`/api/subscriptions?id=${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // pause -> paused, resume -> active, cancel -> cancelled
          status: action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'cancelled'
        })
      });
      const json = await res.json();
      if (json.subscription) {
        setSubscriptions(prev =>
          prev.map(s => s.id === subId ? { ...s, ...json.subscription } : s)
        );
      }
    } catch (e) {
      console.error('Subscription action failed:', e);
    }
    setActionLoading(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-40 px-6 bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div>
            <span className="text-[#1a3a5c] font-black uppercase tracking-[0.3em] text-[10px] italic">Your Profile</span>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase mt-6 text-slate-950">Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-[#e5e0da] rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-100 transition-all group shadow-sm"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 mb-16 border-b border-[#e5e0da] pb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic pb-2 transition-all ${
              activeTab === 'orders'
                ? 'text-[#1a3a5c] border-b-2 border-[#1a3a5c]'
                : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            <Package size={16} /> Order History
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic pb-2 transition-all ${
              activeTab === 'subscriptions'
                ? 'text-[#1a3a5c] border-b-2 border-[#1a3a5c]'
                : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            <Repeat size={16} /> My Subscriptions
            {subscriptions.filter(s => s.status === 'active').length > 0 && (
              <span className="bg-[#2ecc71] text-white text-[7px] px-2 py-0.5 rounded-full font-black tracking-wider">
                {subscriptions.filter(s => s.status === 'active').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic pb-2 transition-all ${
              activeTab === 'referrals'
                ? 'text-[#1a3a5c] border-b-2 border-[#1a3a5c]'
                : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            <Gift size={16} /> Refer & Earn
            {referralStats.converted > 0 && (
              <span className="bg-[#2ecc71] text-white text-[7px] px-2 py-0.5 rounded-full font-black tracking-wider">
                ${referralStats.earnings}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* ===== ORDERS TAB ===== */}
            {activeTab === 'orders' && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <Package size={24} className="text-[#1a3a5c]" />
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950">Order History</h2>
                </div>
                
                {orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-[4rem] border border-[#e5e0da] text-center shadow-sm">
                    <ShoppingBag size={48} className="mx-auto text-[#e5e0da] mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No orders found yet.</p>
                    <a href="/#bundles" className="mt-8 inline-block text-[#1a3a5c] text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">Start Shopping</a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white p-10 rounded-[4rem] border border-[#e5e0da] shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex gap-6 items-center">
                            <div className="w-16 h-16 bg-[#eef2f5] rounded-3xl flex items-center justify-center text-[#1a3a5c] font-black italic text-xl">CW</div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">#{order.order_id}</p>
                              <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{order.product_name}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Total</p>
                              <p className="text-2xl font-black italic tracking-tighter text-[#1a3a5c]">${order.amount?.toFixed(2)}</p>
                            </div>
                            <div className="px-6 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-widest italic animate-pulse">
                              {order.status || 'Processing'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ===== SUBSCRIPTIONS TAB ===== */}
            {activeTab === 'subscriptions' && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <Repeat size={24} className="text-[#1a3a5c]" />
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950">My Subscriptions</h2>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="bg-white p-12 rounded-[4rem] border border-[#e5e0da] text-center shadow-sm">
                    <RotateCcw size={48} className="mx-auto text-[#e5e0da] mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No active subscriptions.</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic mt-4">Subscribe & save 15% on every refill. Cancel anytime.</p>
                    <a href="/#bundles" className="mt-8 inline-block text-[#1a3a5c] text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">Browse Products</a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className={`bg-white p-10 rounded-[4rem] border shadow-sm transition-all group ${
                        sub.status === 'cancelled' ? 'border-red-100 opacity-60' :
                        sub.status === 'paused' ? 'border-amber-100' :
                        'border-[#e5e0da] hover:shadow-xl'
                      }`}>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                          <div className="flex gap-6 items-start flex-1">
                            <div className="w-20 h-20 bg-[#eef2f5] rounded-3xl flex-shrink-0 overflow-hidden flex items-center justify-center text-[#1a3a5c] font-black italic text-2xl">
                              {sub.products?.image_url ? (
                                <img src={sub.products.image_url} alt={sub.products.name} className="w-full h-full object-cover" />
                              ) : 'CW'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{sub.products?.name || 'Subscription'}</h4>
                              <div className="flex flex-wrap gap-4 mt-4">
                                <span className={`px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest italic border ${
                                  sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  sub.status === 'paused' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-red-50 text-red-400 border-red-100'
                                }`}>{sub.status}</span>
                                <span className="px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest italic bg-blue-50 text-[#1a3a5c] border border-blue-100">{FREQ_LABELS[sub.frequency] || sub.frequency}</span>
                              </div>
                              {sub.next_delivery && sub.status !== 'cancelled' && (
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 italic mt-4">
                                  Next delivery: <span className="text-[#1a3a5c]">{new Date(sub.next_delivery).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-4">
                            <p className="text-2xl font-black italic tracking-tighter text-[#1a3a5c]">
                              ${parseFloat(sub.price).toFixed(2)}
                              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 italic ml-2">/ delivery</span>
                            </p>
                            {sub.status === 'active' && (
                              <div className="flex gap-3">
                                <button onClick={() => handleSubscriptionAction(sub.id, 'pause')} disabled={actionLoading === sub.id}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-amber-200 rounded-full text-[8px] font-black uppercase tracking-widest italic text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50">
                                  <Pause size={12} /> Pause
                                </button>
                                <button onClick={() => handleSubscriptionAction(sub.id, 'cancel')} disabled={actionLoading === sub.id}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 rounded-full text-[8px] font-black uppercase tracking-widest italic text-red-400 hover:bg-red-50 transition-all disabled:opacity-50">
                                  <XCircle size={12} /> Cancel
                                </button>
                              </div>
                            )}
                            {sub.status === 'paused' && (
                              <button onClick={() => handleSubscriptionAction(sub.id, 'resume')} disabled={actionLoading === sub.id}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#2ecc71] text-white border border-[#2ecc71] rounded-full text-[8px] font-black uppercase tracking-widest italic hover:bg-emerald-600 transition-all disabled:opacity-50">
                                <Play size={12} /> Resume
                              </button>
                            )}
                            {sub.status === 'cancelled' && (
                              <p className="text-[7px] font-black uppercase tracking-widest text-slate-300 italic">Cancelled</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ===== REFERRALS TAB ===== */}
            {activeTab === 'referrals' && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <Gift size={24} className="text-[#1a3a5c]" />
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950">Refer & Earn</h2>
                </div>

                {/* Stats Dashboard */}
                {referralStats.total > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-[#e5e0da] text-center shadow-sm">
                      <p className="text-3xl font-black italic text-[#1a3a5c]">{referralStats.total}</p>
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 italic mt-1">Sent</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#e5e0da] text-center shadow-sm">
                      <p className="text-3xl font-black italic text-emerald-600">{referralStats.converted}</p>
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 italic mt-1">Signed Up</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#e5e0da] text-center shadow-sm">
                      <p className="text-3xl font-black italic text-emerald-600">${referralStats.earnings}</p>
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 italic mt-1">Earned</p>
                    </div>
                  </div>
                )}

                {/* Referral Link */}
                <div className="bg-white p-8 rounded-[2rem] border border-[#e5e0da] shadow-sm mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic mb-4">Your Referral Link</p>
                  <div className="flex gap-3">
                    <input
                      readOnly
                      value={referralLink}
                      className="flex-1 px-5 py-3 bg-slate-50 border border-[#e5e0da] rounded-full text-[11px] font-mono text-slate-700 focus:outline-none truncate"
                    />
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(referralLink);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1a3a5c] text-white rounded-full text-[9px] font-black uppercase tracking-widest italic hover:bg-[#2a4a6c] transition-all"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 italic mt-4">
                    Share this link — you and your friend each get <span className="text-emerald-600 font-black">$5 off</span>
                  </p>
                </div>

                {/* Referral List */}
                {referrals.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mb-2">History</p>
                    {referrals.map(ref => (
                      <div key={ref.id} className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#e5e0da] shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{ref.referred_email || 'Shared via link'}</p>
                          <p className="text-[9px] text-slate-400 italic mt-1">{new Date(ref.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest italic border ${
                          ref.status === 'converted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          ref.status === 'expired' ? 'bg-red-50 text-red-400 border-red-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {ref.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-[4rem] border border-[#e5e0da] text-center shadow-sm">
                    <Gift size={48} className="mx-auto text-[#e5e0da] mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No referrals yet.</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic mt-4">Share your link and earn $5 for every friend who buys.</p>
                    <div className="mt-8 flex justify-center gap-4">
                      <a href="https://twitter.com/intent/tweet?text=Get%20%245%20off%20Clowand%20-%20the%20no-touch%20toilet%20cleaning%20system!&url=' + encodeURIComponent(referralLink)"
                         target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-[#1a3a5c] text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">
                        Share on X <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Account Details Sidebar */}
          <div className="space-y-12">
            <div className="bg-slate-950 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#2ecc71] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-10">
                  <User size={24} className="text-[#5a7a9a]" />
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase">Account Info</h2>
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5a7a9a]/60 mb-2 italic">Full Name</p>
                    <p className="text-lg font-black italic uppercase tracking-tighter">{user?.user_metadata?.full_name || 'NOT SET'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5a7a9a]/60 mb-2 italic">Email</p>
                    <p className="text-lg font-black italic uppercase tracking-tighter truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-[#e5e0da] shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <MapPin size={24} className="text-[#1a3a5c]" />
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950">Shipping</h2>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-relaxed">Addresses are automatically saved from your last checkout.</p>
              <button className="mt-8 text-[#1a3a5c] text-[10px] font-black uppercase tracking-widest italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all flex items-center gap-2 group">
                Manage Addresses <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
