"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
    <div className="w-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 text-center z-[60] relative">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="opacity-30 hidden sm:inline">|</span>}
            {seg}
          </span>
        ))}
      </div>
    </div>
  );
}
