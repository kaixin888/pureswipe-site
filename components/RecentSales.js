'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const US_CITIES = [
  "Boston, MA", "Austin, TX", "Seattle, WA", "Chicago, IL", "Miami, FL", 
  "San Francisco, CA", "Portland, OR", "Denver, CO", "Atlanta, GA", "Phoenix, AZ",
  "Brooklyn, NY", "Charlotte, NC", "Nashville, TN", "San Diego, CA", "Columbus, OH"
];

export default function RecentSales() {
  const [orders, setOrders] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    async function fetchRecentOrders() {
      // Fetch 10 most recent orders
      const { data } = await supabase
        .from('orders')
        .select('id, product_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data && data.length > 0) {
        setOrders(data)
      }
    }
    fetchRecentOrders()
  }, [])

  useEffect(() => {
    if (orders.length === 0) return

    const interval = setInterval(() => {
      setVisible(false) // Hide current
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % orders.length)
        setVisible(true) // Show next
      }, 1000)
    }, 15000) // Every 15 seconds

    // Show first one after 5s
    const initialDelay = setTimeout(() => setVisible(true), 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(initialDelay)
    }
  }, [orders])

  if (orders.length === 0) return null

  const order = orders[currentIndex]
  const city = US_CITIES[order.id % US_CITIES.length]
  const productName = (order.product_name || 'Clowand Kit').split('|')[0].trim()
  
  // Calculate relative time (max 120 mins for "recent" feel, or use actual)
  const diffMs = Date.now() - new Date(order.created_at).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const timeText = diffMins < 60 ? `${diffMins + 2} minutes ago` : `${Math.floor(diffMins/60)} hours ago`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, x: -50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-24 left-6 z-[100] hidden md:flex items-center gap-4 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 max-w-[320px]"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <span className="text-xl">🛍️</span>
          </div>
          <div className="pr-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic mb-0.5 leading-none">Verified Purchase</p>
            <p className="text-[11px] text-slate-900 leading-tight">
              Someone in <span className="font-black italic text-slate-950">{city}</span> just purchased a <span className="font-black text-blue-600 italic uppercase tracking-tighter">{productName.slice(0, 40)}{productName.length > 40 ? '...' : ''}</span>
            </p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{timeText}</p>
          </div>
          <button 
            onClick={() => setVisible(false)}
            className="absolute top-2 right-2 text-slate-300 hover:text-slate-950 transition-colors"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
