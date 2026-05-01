"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from 'react-use-cart';
import { createClient } from '@supabase/supabase-js';
import { Plus, Check } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

const UPSELL_DISCOUNT_PERCENT = 15;

export default function UpsellCards() {
  const { items, addItem } = useCart();
  const [upsellProducts, setUpsellProducts] = useState([]);
  const [addedIds, setAddedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products not already in cart
  useEffect(() => {
    const fetchUpsellProducts = async () => {
      const cartIds = items.map(i => i.id);

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, sale_price, image_url, stock')
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (!error && data) {
        // Filter out items already in cart, take top 2
        const available = data
          .filter(p => !cartIds.includes(String(p.id)) && (p.stock === null || p.stock > 0))
          .slice(0, 2)
          .map(p => ({
            id: String(p.id),
            name: p.name,
            price: Number(p.price),
            sale_price: p.sale_price != null ? Number(p.sale_price) : null,
            image: p.image_url || '/images/hero-banner.jpg',
            stock: p.stock != null ? p.stock : 999,
            discountedPrice: Number((Number(p.price) * (1 - UPSELL_DISCOUNT_PERCENT / 100)).toFixed(2)),
          }));
        setUpsellProducts(available);
      }
      setLoading(false);
    };

    if (items.length > 0) {
      fetchUpsellProducts();
    } else {
      setUpsellProducts([]);
      setLoading(false);
    }
  }, [items]);

  // Update addedIds when cart changes (item was successfully added)
  useEffect(() => {
    const currentCartIds = items.map(i => i.id);
    setAddedIds(prev => prev.filter(id => !currentCartIds.includes(id)));
  }, [items]);

  const handleAddUpsell = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice,
      image: product.image,
      alt_text: `Bundle Deal: ${product.name} (Save ${UPSELL_DISCOUNT_PERCENT}%)`,
    });

    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: product.discountedPrice,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.discountedPrice,
          quantity: 1,
          item_variant: 'upsell_bundle',
        }],
      });
    }

    setAddedIds(prev => [...prev, product.id]);
  };

  if (loading || upsellProducts.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
          Complete Your Clean Routine
        </span>
        <span className="bg-orange-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
          Save {UPSELL_DISCOUNT_PERCENT}%
        </span>
      </div>

      <div className="space-y-3">
        {upsellProducts.map((product) => {
          const isAdded = addedIds.includes(product.id);
          const alreadyInCart = items.some(i => i.id === product.id);

          if (alreadyInCart) return null;

          return (
            <div
              key={product.id}
              className="bg-gradient-to-r from-orange-50/80 to-amber-50/50 rounded-2xl p-3 border border-orange-200/40 flex items-center gap-3 group transition-all duration-300 hover:border-orange-300/60 hover:shadow-sm"
            >
              {/* Product thumbnail */}
              <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-orange-100 shrink-0">
                <img
                  src={product.image.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com')}
                  alt={product.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Product info + pricing */}
              <div className="flex-1 min-w-0">
                <h5 className="text-[11px] font-black uppercase tracking-tight text-slate-900 line-clamp-1 mb-1">
                  {product.name}
                </h5>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 font-black italic tracking-tighter text-sm">
                    ${product.discountedPrice}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium line-through">
                    ${product.price}
                  </span>
                </div>
              </div>

              {/* Add button */}
              <button
                onClick={() => handleAddUpsell(product)}
                disabled={isAdded}
                className={`${
                  isAdded
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                    : 'bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20 active:scale-90'
                } w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0`}
              >
                {isAdded ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust hint */}
      <p className="text-[9px] text-slate-400 text-center mt-3 font-medium">
        Add & Save — discount applied at checkout
      </p>
    </div>
  );
}