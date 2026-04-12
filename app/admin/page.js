'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Shield, Package, DollarSign, Truck, Save, RefreshCw, LogOut, ExternalLink } from 'lucide-react'

// 初始化 Supabase 客户端 (云账本)
const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [prices, setPrices] = useState({
    starter: 19.99,
    family: 34.99,
    'eco-refill': 24.99
  })
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (password === 'clowand888') {
      setIsLoggedIn(true)
    } else {
      alert('Incorrect Password')
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    if (isLoggedIn) fetchOrders()
  }, [isLoggedIn])

  const updateTracking = async (id, num) => {
    const newNum = prompt('Enter Tracking Number:', num || '')
    if (newNum !== null) {
      await supabase
        .from('orders')
        .update({ tracking_number: newNum, status: 'Shipped' })
        .eq('order_id', id)
      fetchOrders()
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[4rem] p-16 max-w-md w-full shadow-2xl text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-10 shadow-xl">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Merchant Login</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-12 italic">Secure Admin Access Only</p>
          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-center text-xl font-black mb-8 focus:ring-4 focus:ring-blue-100 transition-all"
          />
          <button 
            onClick={handleLogin}
            className="w-full py-6 bg-blue-600 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl active:scale-95 transition-all"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-20 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none mb-2">Clowand Dashboard</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Global Logistics & Revenue Control</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="/" className="px-8 py-4 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3">
              <ExternalLink size={14} /> View Site
            </a>
            <button onClick={() => setIsLoggedIn(false)} className="px-8 py-4 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-12 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-slate-950 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-950'}`}
          >
            Live Orders
          </button>
          <button 
            onClick={() => setActiveTab('prices')}
            className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'prices' ? 'bg-slate-950 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-950'}`}
          >
            Pricing & Stock
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Logistics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-12 py-8 text-sm font-black text-blue-600">#{order.order_id}</td>
                      <td className="px-12 py-8">
                        <p className="text-sm font-black text-slate-900 italic leading-none mb-1">{order.customer_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 italic lowercase">{order.email}</p>
                      </td>
                      <td className="px-12 py-8 text-xs font-bold text-slate-500 uppercase tracking-tighter">{order.product_name}</td>
                      <td className="px-12 py-8 text-lg font-black text-slate-900 italic tracking-tighter">${order.amount}</td>
                      <td className="px-12 py-8">
                        <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Shipped' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-12 py-8">
                        <button 
                          onClick={() => updateTracking(order.order_id, order.tracking_number)}
                          className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                        >
                          <Truck size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loading && (
              <div className="py-32 flex flex-col items-center gap-6">
                <RefreshCw className="animate-spin text-blue-600" size={40} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Syncing with Cloud Vault...</p>
              </div>
            )}
            {!loading && orders.length === 0 && (
              <div className="py-32 text-center">
                <Package className="mx-auto text-slate-100 mb-6" size={80} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active orders found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {Object.entries(prices).map(([key, price]) => (
              <div key={key} className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-300 mb-10 relative z-10">
                  <DollarSign size={28} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2 text-slate-900 relative z-10">{key.replace('-', ' ')}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 italic">Global Sale Price (USD)</p>
                <div className="flex gap-4 relative z-10">
                  <input 
                    type="number" 
                    defaultValue={price} 
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-2xl font-black italic text-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                  <button className="w-16 h-16 bg-slate-950 text-white rounded-3xl flex items-center justify-center shadow-2xl hover:bg-black active:scale-95 transition-all">
                    <Save size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-12 bg-blue-600 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl animate-in slide-in-from-bottom duration-700">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center">
              <RefreshCw size={40} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-2">Cloud Synced</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 italic underline underline-offset-4 decoration-white/30">Secure Connection: Supabase Enterprise-Grade DB</p>
            </div>
          </div>
          <button 
            onClick={fetchOrders}
            className="px-16 py-6 bg-white text-
