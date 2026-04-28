"use client";

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      router.push('/account');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-40 px-6 bg-slate-50">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Join clowand</span>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mt-6 text-slate-950">Create Account</h1>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-6">Full Name</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="JOHN DOE"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all"
                />
              </div>
            </div>

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
                  className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all"
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
                  placeholder="MIN 6 CHARACTERS"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all"
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
              className="w-full py-6 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Enter Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-4">Already have an account?</p>
            <a href="/login" className="text-blue-600 text-[10px] font-black uppercase tracking-widest italic border-b-2 border-blue-600/10 hover:border-blue-600 transition-all">Sign In Here</a>
          </div>
        </div>
      </div>
    </div>
  );
}
