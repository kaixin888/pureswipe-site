"use client";

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      // 记录失败登录
      fetch('/api/auth-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status: 'failed', failed_reason: loginError.message }),
      }).catch(() => {});
    } else {
      // 记录成功登录
      fetch('/api/auth-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status: 'success' }),
      }).catch(() => {});
      router.push('/account');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-40 px-6 bg-slate-50">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Welcome Back</span>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mt-6 text-slate-950">Log In</h1>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-6">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-6">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-red-500 italic bg-red-50 py-3 rounded-full border border-red-100">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-[#2ecc71] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#27ae60] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Enter Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-4">New to clowand?</p>
            <a href="/register" className="text-[#1a3a5c] text-[10px] font-black uppercase tracking-widest italic border-b-2 border-[#1a3a5c]/10 hover:border-[#1a3a5c] transition-all">Create your account</a>
          </div>
        </div>
      </div>
    </div>
  );
}
