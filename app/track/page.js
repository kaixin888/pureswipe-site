'use client';

import { Suspense } from 'react';
import TrackPageInner from './TrackPageInner';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#f2efe8]">
      <div className="bg-white border-b border-[#e5e0da]">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <span className="text-xl font-black italic tracking-tighter uppercase text-slate-950">CLO<span className="text-blue-600">WAND</span></span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#1a3a5c] border-t-transparent rounded-full mx-auto mb-6" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading order tracker...</p>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrackPageInner />
    </Suspense>
  );
}
