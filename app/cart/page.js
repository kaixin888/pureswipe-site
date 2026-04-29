"use client";

import React from 'react';
import { useCart } from "react-use-cart";
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { useStore } from '../../components/Providers';
import UpsellCards from '../../components/UpsellCards';

export default function CartPage() {
  const { isEmpty, items, cartTotal, updateItemQuantity, removeItem } = useCart();
  const { setIsCartOpen, setIsCheckoutOpen } = useStore();
  const router = useRouter();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 bg-[#faf9f7]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft size={18} className="text-[#5a6978]" />
          </button>
          <div>
            <h1 className="text-3xl font-display tracking-tight text-[#1a2935]">
              Shopping Cart
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#5a6978] italic mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter text-slate-400 mb-2">
              Your cart is empty
            </h2>
            <p className="text-xs font-black uppercase tracking-widest text-slate-300 italic mb-8">
              Looks like you haven&apos;t added anything yet
            </p>
            <button
              onClick={() => router.push('/products')}
              className="px-10 py-4 bg-[#1a3a5c] text-white rounded-full text-[10px] font-black uppercase tracking-widest italic hover:bg-[#2a4a6c] transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 truncate">{item.name}</h3>
                  {item.variant && (
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 italic mt-0.5">
                      {item.variant}
                    </p>
                  )}
                  <p className="text-sm font-bold text-[#2ecc71] mt-1">
                    ${(item.price * item.quantity).toFixed(2)}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      (${item.price.toFixed(2)} each)
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 rounded-full border border-slate-100">
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Upsell Section */}
            <div className="pt-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-6 text-center">
                Complete your routine
              </p>
              <UpsellCards />
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mt-8">
              {(() => {
                var threshold = 30;
                var total = cartTotal;
                if (total >= threshold) {
                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                          <Truck size={20} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-600">Free Shipping Unlocked!</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 italic">
                            Your order qualifies for free shipping
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-emerald-400 rounded-full" />
                      </div>
                    </div>
                  );
                } else {
                  var remaining = (threshold - total);
                  var pct = Math.min((total / threshold) * 100, 99);
                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                          <Gift size={20} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-amber-700">
                            Add <span className="text-amber-500">${remaining.toFixed(2)}</span> more for free shipping!
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 italic">
                            Free shipping on orders over ${threshold}
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Summary */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                  Subtotal
                </span>
                <span className="text-lg font-black text-slate-800">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic mb-8">
                Shipping & taxes calculated at checkout
              </p>
              <button
                onClick={handleCheckout}
                className="w-full py-5 bg-[#2ecc71] text-white rounded-full text-[10px] font-black uppercase tracking-widest italic hover:bg-[#27ae60] transition-all flex items-center justify-center gap-3"
              >
                <ShoppingBag size={16} />
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
