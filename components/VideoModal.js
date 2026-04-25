"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function VideoModal({ videoUrl, posterUrl, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white z-10"
        >
          <X size={20} />
        </button>

        {/* Video player */}
        <video
          src={videoUrl.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com')}
          poster={posterUrl ? posterUrl.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com') : undefined}
          autoPlay
          playsInline
          controls
          className="w-full max-h-[70vh] object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          Your browser does not support video playback.
        </video>
      </div>
    </div>
  );
}