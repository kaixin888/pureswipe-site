"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Package, User, MapPin, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

export default function Account() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      setLoading(false);
    };

    fetchUserAndOrders();
  }, [router]);

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
    <div className="min-h-screen pt-32 pb-40 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div>
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Your Profile</span>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase mt-6 text-slate-950">Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-100 transition-all group shadow-sm"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <Package size={24} className="text-blue-600" />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950">Order History</h2>
            </div>
            
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 text-center shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-slate-100 mb-6" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No orders found yet.</p>
                <a href="/#bundles" className="mt-8 inline-block text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">Start Shopping</a>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 font-black italic text-xl">CW</div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">#{order.order_id}</p>
                          <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{order.product_name}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Total</p>
                          <p className="text-2xl font-black italic tracking-tighter text-blue-600">${order.amount.toFixed(2)}</p>
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
          </div>

          {/* Account Details */}
          <div className="space-y-12">
            <div className="bg-slate-950 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-10">
                  <User size={24} className="text-blue-400" />
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase">Account Info</h2>
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400/60 mb-2 italic">Full Name</p>
                    <p className="text-lg font-black italic uppercase tracking-tighter">{user?.user_metadata?.full_name || 'NOT SET'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400/60 mb-2 italic">Email</p>
                    <p className="text-lg font-black italic uppercase tracking-tighter truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <MapPin size={24} className="text-blue-600" />
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950">Shipping</h2>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-relaxed">Addresses are automatically saved from your last checkout.</p>
              <button className="mt-8 text-blue-600 text-[10px] font-black uppercase tracking-widest italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all flex items-center gap-2 group">
                Manage Addresses <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
