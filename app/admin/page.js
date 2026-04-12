// Build Time: 2026-04-12 14:20:00 (v2.1 Admin Upgrade - Clean Sync)
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Shield, Package, DollarSign, Truck, Save, RefreshCw, LogOut, 
  ExternalLink, TrendingUp, Users, MousePointer2, Activity, 
  Download, Search, Filter, ChevronRight, Eye, ShoppingCart, 
  Plus, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'

// 初始化 Supabase 客户端
const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  
  // 筛选与搜索状态
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // 模拟商品数据
  const [products, setProducts] = useState([
    { id: 'starter', name: 'Starter Kit', price: 19.99, stock: 150, status: 'Active' },
    { id: 'family', name: 'Family Value Pack', price: 34.99, stock: 85, status: 'Active' },
    { id: 'eco-refill', name: 'Eco Refill Box', price: 24.99, stock: 12, status: 'Active' }
  ])

  const handleLogin = () => {
    if (password === 'clowand888') {
      setIsLoggedIn(true)
      setActiveTab('dashboard')
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

  // 数据看板核心指标计算
  const stats = useMemo(() => {
    const totalGMV = orders.reduce((sum, order) => sum + (order.amount || 0), 0)
    const totalOrders = orders.length
    const uniqueCustomers = new Set(orders.map(o => o.email)).size
    const avgOrderValue = totalOrders > 0 ? (totalGMV / totalOrders).toFixed(2) : 0
    const mockVisitors = 1250 
    const conversionRate = mockVisitors > 0 ? ((totalOrders / mockVisitors) * 100).toFixed(2) : 0

    return { totalGMV, totalOrders, uniqueCustomers, avgOrderValue, mockVisitors, conversionRate }
  }, [orders])

  // 筛选后的订单列表
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Product', 'Amount', 'Status', 'Tracking', 'Date']
    const rows = filteredOrders.map(o => [
      o.order_id,
      o.customer_name,
      o.email,
      o.product_name,
      o.amount,
      o.status,
      o.tracking_number || 'N/A',
      new Date(o.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `clowand_orders_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const updateTracking = async (id, num) => {
    const newNum = prompt('Enter Tracking Number:', num || '')
    if (newNum !== null) {
      await supabase
        .from('orders')
        .update({ tracking_number: newNum, status: 'Shipped' })
        .eq('order_id', id)
      fetchOrders()
      if (selectedOrder && selectedOrder.order_id === id) {
        setSelectedOrder(prev => ({ ...prev, tracking_number: newNum, status: 'Shipped' }))
      }
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
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-center text-xl font-black mb-8 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
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
              <h1 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none mb-2">clowand OS</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Merchant Command Center v2.1</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="/" target="_blank" className="px-8 py-4 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3">
              <ExternalLink size={14} /> View Site
            </a>
            <button onClick={() => setIsLoggedIn(false)} className="px-8 py-4 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-12 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'users', label: 'Customers', icon: Users },
            { id: 'settings', label: 'Settings', icon: Shield }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === tab.id ? 'bg-slate-950 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-950'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Total Revenue (GMV)</p>
                <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">${stats.totalGMV.toLocaleString()}</h3>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-black">
                  <TrendingUp size={12} /> +12.5% vs Last Week
                </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShoppingCart size={80} /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Total Orders</p>
                <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">{stats.totalOrders}</h3>
                <div className="mt-4 flex items-center gap-2 text-blue-500 text-[10px] font-black">
                  <Activity size={12} /> Processing: {orders.filter(o => o.status !== 'Shipped').length}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><MousePointer2 size={80} /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Conversion Rate</p>
                <h3 className="text-4xl font-black italic tracking-tighter text-blue-600">{stats.conversionRate}%</h3>
                <div className="mt-4 flex items-center gap-2 text-slate-400 text-[10px] font-black">
                  <Users size={12} /> Unique Visitors: {stats.mockVisitors}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><DollarSign size={80} /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Avg Order Value</p>
                <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">${stats.avgOrderValue}</h3>
                <div className="mt-4 flex items-center gap-2 text-blue-500 text-[10px] font-black">
                  <Activity size={12} /> Target: $25.00
                </div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm mb-12">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">7-Day Sales Trend</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Daily Performance Snapshot</p>
                </div>
                <button className="px-6 py-3 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-all">Last 30 Days</button>
              </div>
              <div className="h-64 w-full relative flex items-end justify-between px-4 pb-8">
                {[45, 60, 55, 80, 70, 95, 85].map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-4 group cursor-pointer">
                    <div className="relative w-12 flex flex-col items-center">
                      <div className="absolute -top-8 bg-slate-950 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${val * 10}
                      </div>
                      <div 
                        className="w-8 bg-blue-600 rounded-2xl group-hover:bg-blue-500 transition-all duration-500 ease-out"
                        style={{ height: `${val * 2}px` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase italic">Day {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
              <div className="flex flex-1 w-full gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by ID, Name or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-12 pr-12 py-5 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Shipped">Shipped</option>
                  </select>
                  <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                </div>
              </div>
              <button 
                onClick={exportToCSV}
                className="w-full lg:w-auto px-10 py-5 bg-emerald-50 text-emerald-600 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-3"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>

            <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                      <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                      <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                      <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
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
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all active:scale-95"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => updateTracking(order.order_id, order.tracking_number)}
                              className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                            >
                              <Truck size={18} />
                            </button>
                          </div>
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
              {!loading && filteredOrders.length === 0 && (
                <div className="py-32 text-center">
                  <Package className="mx-auto text-slate-100 mb-6" size={80} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No orders match your filter</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">Live Inventory</h2>
              <button className="px-10 py-5 bg-slate-950 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <Plus size={16} /> Add New Product
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-300 mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <Package size={28} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2 text-slate-900">{p.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 italic">Price: ${p.price}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Inventory Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${p.stock < 20 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        <span className="text-lg font-black italic">{p.stock} units</span>
                      </div>
                    </div>
                    {p.stock < 20 && (
                      <AlertCircle className="text-red-500" size={24} />
                    )}
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-slate-50 flex gap-4">
                    <button className="flex-1 py-4 bg-slate-50 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950">Edit Specs</button>
                    <button className="px-6 py-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-32 rounded-[4rem] text-center border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
            <Users size={80} className="mx-auto text-slate-100 mb-8" />
            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Customer Insights Hub</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic mb-12">Building profiles for your {stats.uniqueCustomers} unique customers...</p>
            <div className="inline-block px-10 py-5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              Syncing Profiles from Supabase Auth
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6">
            <div className="bg-white rounded-[4rem] p-16 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 -mr-32 -mt-32 rounded-full -z-10"></div>
              
              <button onClick={() => setSelectedOrder(null)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-950 transition-colors">
                <ChevronRight size={40} className="rotate-180" />
              </button>

              <div className="mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 italic">Order Manifest</span>
                <h2 className="text-5xl font-black uppercase tracking-tighter italic text-slate-900 mt-4">Order #{selectedOrder.order_id}</h2>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-16">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-4">Customer Details</p>
                  <p className="text-xl font-black italic text-slate-900">{selectedOrder.customer_name}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-4">Logistics Status</p>
                  <div className="flex items-center gap-3">
                    {selectedOrder.status === 'Shipped' ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Clock className="text-orange-500" size={24} />}
                    <span className="text-xl font-black italic uppercase">{selectedOrder.status}</span>
                  </div>
                  {selectedOrder.tracking_number && (
                    <p className="text-xs font-bold text-blue-600 mt-2 tracking-widest uppercase">ID: {selectedOrder.tracking_number}</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-10 rounded-[2.5rem] mb-16">
                <div className="flex justify-between items-center pb-6 border-b border-white">
                  <span className="text-[10px] font-black uppercase tracking-widest">Item</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Price</span>
                </div>
                <div className="flex justify-between items-center pt-8">
                  <span className="text-lg font-black italic">{selectedOrder.product_name}</span>
                  <span className="text-2xl font-black italic">${selectedOrder.amount}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => updateTracking(selectedOrder.order_id, selectedOrder.tracking_number)}
                  className="flex-1 py-6 bg-slate-950 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all"
                >
                  Update Tracking
                </button>
                <button className="px-10 py-6 bg-slate-100 text-slate-400 rounded-[2rem] text-xs font-black uppercase tracking-widest">Print Label</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 p-12 bg-blue-600 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl animate-in slide-in-from-bottom duration-700">
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
            className="px-16 py-6 bg-white text-blue-600 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 active:scale-95 transition-all"
          >
            Refresh Global Data
          </button>
        </div>
      </div>
    </div>
  )
}
