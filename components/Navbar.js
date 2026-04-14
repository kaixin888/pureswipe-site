"use client";

import React, { useState } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <button onClick={() => scrollTo('features')} className="hover:text-blue-600 transition-colors uppercase">Features</button>
          <button onClick={() => scrollTo('bundles')} className="hover:text-blue-600 transition-colors uppercase">Shop</button>
          <button onClick={() => scrollTo('reviews')} className="hover:text-blue-600 transition-colors uppercase">Reviews</button>
          <button onClick={() => scrollTo('faq')} className="hover:text-blue-600 transition-colors uppercase">FAQ</button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            <button className="text-slate-400 hover:text-blue-600 relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>
            <button 
              onClick={() => scrollTo('bundles')} 
              className="bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full hover:scale-105 transition-all shadow-xl"
            >
              Buy Now
            </button>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-950">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-8 flex flex-col gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 animate-in slide-in-from-top duration-300">
          <button onClick={() => scrollTo('features')} className="text-left hover:text-blue-600 uppercase">Features</button>
          <button onClick={() => scrollTo('bundles')} className="text-left hover:text-blue-600 uppercase">Shop</button>
          <button onClick={() => scrollTo('reviews')} className="text-left hover:text-blue-600 uppercase">Reviews</button>
          <button onClick={() => scrollTo('faq')} className="text-left hover:text-blue-600 uppercase">FAQ</button>
          <button onClick={() => scrollTo('bundles')} className="bg-slate-950 text-white p-4 rounded-full text-center uppercase">Buy Now</button>
        </div>
      )}
    </nav>
  );
}
