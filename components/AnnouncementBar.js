"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

const DEFAULT_TEXT = 'Free shipping on orders over $30 | 100% Satisfaction Guarantee';

export default function AnnouncementBar() {
  const [text, setText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_bar')
      .single()
      .then(({ data }) => {
        if (data?.value) setText(data.value);
      });
  }, []);

  const segments = text.split('|').map(s => s.trim()).filter(Boolean);

  return (
    // h-8 on mobile (32px), h-10 on desktop (40px) + safe-area notch padding
    <div className="w-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest px-4 text-center z-40 fixed top-0 left-0 right-0 flex items-center justify-center"
         style={{ height: 'calc(32px + env(safe-area-inset-top, 0px))', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Mobile: show first segment only, truncate to single line */}
      <span className="md:hidden truncate max-w-full">
        {segments[0] || DEFAULT_TEXT.split('|')[0].trim()}
      </span>
      {/* Desktop: show all segments */}
      <div className="hidden md:flex items-center justify-center gap-6">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="opacity-30">|</span>}
            {seg}
          </span>
        ))}
      </div>
    </div>
  );
}
