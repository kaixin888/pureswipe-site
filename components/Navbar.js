import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
        </a>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#bundles" className="hover:text-blue-600 transition-colors">Shop</a>
          <a href="#reviews" className="hover:text-blue-600 transition-colors">Reviews</a>
        </div>
        <button className="bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full hover:scale-105 transition-all shadow-xl">
          Buy Now
        </button>
      </div>
    </nav>
  );
}
