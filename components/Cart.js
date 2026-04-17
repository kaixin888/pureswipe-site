"use client";

import React from 'react';
import { useCart } from "react-use-cart";
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

export default function Cart({ isOpen, onClose, onCheckout }) {
  const {
    isEmpty,
    items,
    cartTotal,
    updateItemQuantity,
    removeItem,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer — full viewport height, flex column */}
      <div className="relative w-full max-w-md bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-blue-600" size={22} />
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-950">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-300 hover:text-slate-950"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable item list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                <ShoppingBag className="text-slate-200" size={28} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Your cart is empty.</p>
              <button
                onClick={onClose}
                className="mt-6 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/20 hover:border-blue-600 transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group py-3 border-b border-slate-50 last:border-0">
                  {/* Product image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  </div>
                  {/* Product info */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="text-sm font-black italic uppercase tracking-tight text-slate-900 leading-snug line-clamp-2">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-blue-600 font-black italic tracking-tighter text-base mb-3">${item.price}</p>
                    {/* Quantity control */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-50 rounded-full border border-slate-100">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:text-blue-600 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:text-blue-600 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        = ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — checkout area */}
        {!isEmpty && (
          <div className="px-5 py-5 bg-slate-50 border-t border-slate-100 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Subtotal</p>
              <p className="text-2xl font-black italic tracking-tighter text-slate-950">${cartTotal.toFixed(2)}</p>
            </div>
            <p className="text-[10px] text-slate-400 text-center mb-3">Free shipping on orders over $30</p>
            <button
              className="w-full py-4 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              onClick={onCheckout}
            >
              Continue to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
