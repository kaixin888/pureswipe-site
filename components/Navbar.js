"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from 'react-use-cart';
import { useStore } from './Providers';
import { createClient } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import Cart from './Cart';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { isCartOpen, setIsCartOpen, setIsCheckoutOpen } = useStore();
  const { totalItems } = useCart();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const pathname = usePathname();

  const scrollTo = (id) => {
    setIsOpen(false);
    setSearchOpen(false);
    if (pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <nav className="fixed top-8 md:top-10 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
      {/* Mobile Navbar: hamburger | logo center | search + cart */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <button onClick={() => { setIsOpen(!isOpen); setSearchOpen(false); }} className="text-slate-950 p-1">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">C</div>
          <span className="text-lg font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
        </a>
        <div className="flex items-center gap-2">
          {/* Search icon — toggles search overlay */}
          <button
            onClick={() => { setSearchOpen(!searchOpen); setIsOpen(false); }}
            className="text-slate-950 p-1"
            aria-label="Search"
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-slate-950 relative p-1"
          >
            <ShoppingCart size={22} />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay — only shown when searchOpen */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 bg-gray-50">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              autoFocus
              readOnly
              onClick={() => scrollTo('bundles')}
            />
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
        </a>
        <div className="flex items-center gap-10 text-base font-medium uppercase tracking-widest text-slate-400">
          <button onClick={() => scrollTo('features')} className="hover:text-blue-600 transition-colors">Features</button>
          <button onClick={() => scrollTo('bundles')} className="hover:text-blue-600 transition-colors">Shop</button>
          <button onClick={() => scrollTo('reviews')} className="hover:text-blue-600 transition-colors">Reviews</button>
          <button onClick={() => scrollTo('faq')} className="hover:text-blue-600 transition-colors">FAQ</button>
        </div>
        <div className="flex items-center gap-6">
          <a href="/blog" className="text-slate-400 hover:text-blue-600 transition-all text-base font-medium uppercase tracking-widest">Blog</a>
          <a href="/about" className="text-slate-400 hover:text-blue-600 transition-all text-base font-medium uppercase tracking-widest">About</a>
          <a href={user ? "/account" : "/login"} className="text-slate-400 hover:text-blue-600 transition-all flex items-center gap-2 group">
            <User size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-base font-medium uppercase tracking-widest">{user ? 'Account' : 'Login'}</span>
          </a>
          <button onClick={() => setIsCartOpen(true)} className="text-slate-400 hover:text-blue-600 relative transition-all hover:scale-110 active:scale-90">
            <ShoppingCart size={20} />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => scrollTo('bundles')} className="bg-slate-950 text-white text-base font-bold uppercase tracking-widest px-8 py-3 rounded-full hover:scale-105 transition-all shadow-xl">
            Buy Now
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 px-6 py-6 flex flex-col gap-5 text-sm font-bold uppercase tracking-widest text-slate-600 shadow-lg animate-in slide-in-from-top duration-200">
          <button onClick={() => scrollTo('features')} className="text-left hover:text-blue-600">Features</button>
          <button onClick={() => scrollTo('bundles')} className="text-left hover:text-blue-600">Shop</button>
          <button onClick={() => scrollTo('reviews')} className="text-left hover:text-blue-600">Reviews</button>
          <button onClick={() => scrollTo('faq')} className="text-left hover:text-blue-600">FAQ</button>
          <a href="/blog" className="hover:text-blue-600">Blog</a>
          <a href="/about" className="hover:text-blue-600">About</a>
          <a href={user ? "/account" : "/login"} className="hover:text-blue-600">{user ? 'Account' : 'Login'}</a>
          <button onClick={() => { setIsOpen(false); scrollTo('bundles'); }} className="bg-black text-white py-4 rounded-full text-center mt-2">Shop Now</button>
        </div>
      )}

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          console.log('[Navbar] onCheckout triggered');
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
    </nav>
  );
}
