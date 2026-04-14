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
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-blue-600" size={24} />
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950">Your Cart</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-full transition-all text-slate-300 hover:text-slate-950"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="text-slate-200" size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Your cart is empty.</p>
              <button 
                onClick={onClose}
                className="mt-8 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/20 hover:border-blue-600 transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-none">{item.name}</h4>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-blue-600 font-black italic tracking-tighter mb-6">${item.price}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-slate-50 rounded-full border border-slate-100">
                        <button 
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:text-blue-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-[10px] font-black w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:text-blue-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isEmpty && (
          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Subtotal</p>
              <p className="text-3xl font-black italic tracking-tighter text-slate-950">${cartTotal.toFixed(2)}</p>
            </div>
            <button 
              className="w-full py-6 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
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
