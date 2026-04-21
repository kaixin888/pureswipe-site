'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { useCart } from 'react-use-cart'
import { useStore } from './Providers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)

export default function BlogProducts() {
  const [products, setProducts] = useState([])
  const { addItem } = useCart()
  const { setIsCheckoutOpen, setCheckoutStep } = useStore()

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('popular', true)
        .limit(2)
      if (data) setProducts(data)
    }
    fetchProducts()
  }, [])

  if (products.length === 0) return null

  const handleBuyNow = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      description: product.description.substring(0, 50) + '...',
    })
    setCheckoutStep('info')
    setIsCheckoutOpen(true)
  }

  return (
    <div className="mt-16 bg-slate-900/50 rounded-3xl p-8 border border-slate-800">
      <div className="text-center mb-8">
        <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">Recommended Gear</span>
        <h3 className="text-2xl font-black mt-2">Elevate Your Hygiene Routine</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
            <div className="w-full h-40 relative mb-4">
              <Image 
                src={product.image_url} 
                alt={product.alt_text || product.name}
                fill
                className="object-contain"
              />
            </div>
            <h4 className="text-sm font-black text-center uppercase tracking-tight mb-2 h-10 overflow-hidden">{product.name}</h4>
            <p className="text-xl font-black text-blue-400 mb-6">${product.price}</p>
            <button
              onClick={() => handleBuyNow(product)}
              className="w-full bg-blue-600 text-white font-black text-[10px] tracking-widest py-4 rounded-xl hover:bg-blue-500 transition-colors uppercase"
            >
              Buy It Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
