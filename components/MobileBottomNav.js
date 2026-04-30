// MobileBottomNav — 移动端底部导航栏（仅在 md 以下显示）
// 4 个 Tab：Home / Shop / Cart / Account
// 固定在屏幕底部，自动避开安全区域（iPhone 横条）

'use client';

import React, { useState, useEffect } from 'react';
import { Home, Tag, ShoppingCart, User } from 'lucide-react';
import { useCart } from 'react-use-cart';
import { useStore } from './Providers';
import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  { key: 'home', icon: Home, label: 'Home', href: '/' },
  { key: 'shop', icon: Tag, label: 'Shop', href: '/#bundles' },
  { key: 'cart', icon: ShoppingCart, label: 'Cart', isCart: true },
  { key: 'account', icon: User, label: 'Account', href: '/login' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { setIsCartOpen } = useStore();
  const { totalItems } = useCart();

  useEffect(() => { setMounted(true); }, []);

  // 不在 admin/api 路由显示
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
    return null;
  }

  const isActive = (tab) => {
    if (tab.key === 'home') return pathname === '/';
    if (tab.key === 'shop') return pathname === '/' || pathname.startsWith('/products');
    if (tab.key === 'cart') return false;
    if (tab.key === 'account') return pathname.startsWith('/account') || pathname.startsWith('/login');
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white/95 backdrop-blur-xl border-t border-black/5 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.isCart) {
                  setIsCartOpen(true);
                } else {
                  router.push(tab.href);
                }
              }}
              className={`relative flex flex-col items-center justify-center gap-0.5 h-full px-4 transition-colors min-w-[64px] min-h-[44px] ${
                active ? 'text-[#1a3a5c]' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {/* 购物车角标 */}
                {tab.isCart && mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${
                active ? 'text-[#1a3a5c]' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
              {/* 激活指示器 */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#1a3a5c] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
