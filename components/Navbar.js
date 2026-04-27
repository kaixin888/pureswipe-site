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
    <nav className="fixed top-8 z-50 w-full h-14 md:h-16 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border-b border-black/5 transition-all duration-200">
      {/* Mobile Navbar: hamburger | logo center | search + cart */}
      <div className="md:hidden flex items-center justify-between px-4 h-full">
        <button onClick={() => { setIsOpen(!isOpen); setSearchOpen(false); }} className="text-slate-950 p-2.5" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {isOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            ) : (
              <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>
            )}
          </svg>
        </button>
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">C</div>
          <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
        </a>
        <div className="flex items-center gap-2">
          {/* Search icon — toggles search overlay */}
          <button
            onClick={() => { setSearchOpen(!searchOpen); setIsOpen(false); }}
            className="text-slate-950 p-2.5"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-slate-950 relative p-2.5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
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

      {/* Mobile Menu Drawer — APP-style full-height side panel */}
      {/* Backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
      {/* Side drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 z-[70] h-full w-[80vw] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">C</div>
            <span className="text-lg font-black tracking-tighter uppercase italic text-slate-900">clowand</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-950 p-1">
            <X size={20} />
          </button>
        </div>
        {/* Drawer body */}
        <div className="flex flex-col px-6 py-6 gap-1">
          <button onClick={() => scrollTo('features')} className="text-left py-4 text-base font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 transition-all">Features</button>
          <button onClick={() => scrollTo('bundles')} className="text-left py-4 text-base font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 transition-all">Shop</button>
          <button onClick={() => scrollTo('reviews')} className="text-left py-4 text-base font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 transition-all">Reviews</button>
          <button onClick={() => scrollTo('faq')} className="text-left py-4 text-base font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 transition-all">FAQ</button>
          <div className="border-t border-gray-100 my-2" />
          <a href="/blog" onClick={() => setIsOpen(false)} className="py-4 text-base font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 transition-all">Blog</a>
          <a href="/about" onClick={() => setIsOpen(false)} className="py-4 text-base font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 transition-all">About</a>
          <a href={user ? "/account" : "/login"} onClick={() => setIsOpen(false)} className="py-4 text-base font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 transition-all flex items-center gap-2">
            <User size={16} />
            {user ? 'Account' : 'Login'}
          </a>
          <div className="border-t border-gray-100 my-2" />
          <button onClick={() => { setIsOpen(false); scrollTo('bundles'); }} className="bg-blue-600 text-white py-4 rounded-full text-center text-sm font-bold uppercase tracking-widest mt-4 active:scale-[0.98] transition-transform">Shop Now</button>
        </div>
      </div>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
    </nav>
  );
}
