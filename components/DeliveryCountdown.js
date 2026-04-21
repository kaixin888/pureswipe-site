'use client'

import React, { useState, useEffect } from 'react'
import { Truck } from 'lucide-react'

export default function DeliveryCountdown() {
  const [timeLeft, setTimeLeft] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      // Cutoff at 4 PM (16:00)
      const cutoff = new Date()
      cutoff.setHours(16, 0, 0, 0)
      
      let target = cutoff
      if (now > cutoff) {
        target = new Date(cutoff.getTime() + 24 * 60 * 60 * 1000)
      }

      const diff = target.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeLeft(`${hours}h ${minutes}m`)

      // Delivery date = Now + 4 days
      const del = new Date()
      del.setDate(del.getDate() + 4)
      setDeliveryDate(del.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' }))
    }

    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
      <Truck size={18} className="text-blue-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-[13px] font-bold text-slate-900 leading-snug">
          FREE Shipping. Order in the next <span className="text-blue-600">{timeLeft}</span> to get it by <span className="underline decoration-blue-200 underline-offset-4">{deliveryDate}</span>.
        </p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">FAST US WAREHOUSE DISPATCH</p>
      </div>
    </div>
  )
}
