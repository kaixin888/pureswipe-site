'use client';

// 全站退出意图弹窗组件
// - 桌面端: mouseleave 触发
// - 移动端: 30s 定时器
// - 博客页: 移动端 45s，桌面端 mouseleave + 2s 延迟（避免干扰阅读）
// - 每浏览器生命周期只弹一次（localStorage）

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { X, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co',
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
);

export default function ExitPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const shown = localStorage.getItem('clowand_exit_popup_shown');
    if (shown) return;

    // 博客页使用更长延迟，避免打断阅读
    const isBlog = pathname?.startsWith('/blog');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const delay = isBlog ? 45000 : 30000;
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('clowand_exit_popup_shown', 'true');
      }, delay);
      return () => clearTimeout(timer);
    }

    // 桌面端: mouseleave
    if (isBlog) {
      // 博客页: mouseleave 后延迟 2s 才弹
      let leaveTimer = null;
      const handler = (e) => {
        if (e.clientY <= 0) {
          leaveTimer = setTimeout(() => {
            setIsOpen(true);
            localStorage.setItem('clowand_exit_popup_shown', 'true');
          }, 2000);
        } else if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }
      };
      window.addEventListener('mouseleave', handler);
      return () => {
        window.removeEventListener('mouseleave', handler);
        if (leaveTimer) clearTimeout(leaveTimer);
      };
    }

    // 普通页: 直接 mouseleave
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setIsOpen(true);
        localStorage.setItem('clowand_exit_popup_shown', 'true');
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => window.removeEventListener('mouseleave', handleMouseLeave);
  }, [pathname]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email }]);
    setIsSubmitting(false);
    if (!error) {
      setIsSubscribed(true);
      // 保存邮箱供弃单捕获（Cart.js 的 beforeunload 使用）
      localStorage.setItem('clowand_exit_email', email);
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'welcome', email }),
      }).catch(() => {});
      setTimeout(() => setIsOpen(false), 3000);
    } else if (error.code === '23505') {
      setIsSubscribed(true);
      localStorage.setItem('clowand_exit_email', email);
      setTimeout(() => setIsOpen(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-slate-950/70 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[680px] rounded-[2rem] overflow-hidden shadow-2xl relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 hover:bg-slate-50 rounded-full transition-all text-slate-300 hover:text-slate-950 z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* 左侧: 产品图 */}
          <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-blue-50 to-slate-50 items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent" />
            <Image
              src="/images/products/starter-kit-main.jpg"
              width={320}
              height={320}
              className="object-contain drop-shadow-2xl rounded-2xl max-h-[280px] w-auto"
              alt="Clowand Toilet Wand Starter Kit"
              priority={false}
            />
          </div>

          {/* 移动端: 紧凑产品条 */}
          <div className="md:hidden bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center py-4 px-6">
            <Image
              src="/images/products/starter-kit-main.jpg"
              width={100}
              height={100}
              className="object-contain drop-shadow-xl max-h-[80px] w-auto"
              alt="Clowand Toilet Wand Starter Kit"
              priority={false}
            />
            <div className="ml-4">
              <span className="text-blue-600 font-black uppercase tracking-[0.15em] text-[8px] italic">Welcome to Cleaner Living</span>
              <p className="text-slate-900 font-black italic tracking-tight text-sm mt-1">10% OFF + Free Guide</p>
            </div>
          </div>

          {/* 右侧: 表单区域 */}
          <div className="md:w-[55%] p-6 md:p-10 flex flex-col items-center justify-center text-center">
            {!isSubscribed ? (
              <>
                <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] italic mb-3 md:mb-4">Welcome to Cleaner Living</span>
                <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-slate-950 leading-tight mb-3 md:mb-4">
                  Get 10% OFF<br/>
                  <span className="text-blue-600">+ A Free Hygiene Guide</span>
                </h2>
                <p className="text-slate-500 text-[10px] md:text-[11px] font-semibold leading-relaxed mb-6 md:mb-8">
                  Join 5,000+ households choosing zero-touch cleaning. Your discount code &amp; guide arrive instantly.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3 md:space-y-4 w-full">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-full text-[12px] md:text-[13px] font-semibold tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-center placeholder:text-slate-400 placeholder:font-medium placeholder:tracking-normal"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 md:py-5 bg-[#2ecc71] text-white rounded-full text-[11px] md:text-[12px] font-black uppercase tracking-[0.15em] hover:bg-[#27ae60] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'GET MY DISCOUNT →'}
                  </button>
                </form>
                <p className="text-slate-400 text-[9px] md:text-[10px] font-medium mt-4 md:mt-6 tracking-wide">
                  Email only. No spam ever. Unsubscribe anytime.
                </p>
              </>
            ) : (
              <div className="animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="text-emerald-500" size={28} />
                </div>
                <p className="text-2xl font-black italic tracking-tighter text-emerald-600 uppercase mb-2">You&apos;re In!</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 italic mb-4">Your code: <span className="bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">CLOWAND10</span></p>
                <p className="text-[10px] font-medium text-slate-400 mb-2">Check your inbox for the discount code + Bathroom Hygiene Guide.</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] italic border-b-2 border-blue-600/20 hover:border-blue-600 transition-all"
                >
                  Start Shopping →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
