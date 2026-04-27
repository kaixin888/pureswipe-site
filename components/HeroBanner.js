'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com');
};

function HeroSlide({ slide, normalizeUrl, heroTitle, heroBadge, heroSub, shopLabel, onShopClick }) {
  return (
    <div className="relative w-full h-full">
      {slide.type === 'video' ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={slide.poster || '/images/hero.jpg'}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={normalizeUrl(slide.src)} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={normalizeUrl(slide.src)}
          alt={slide.alt || heroTitle || 'Clowand'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 w-fit border border-white/30">
          {heroBadge || '2026 Hygiene Revolution'}
        </div>
        <h1 className="text-4xl font-medium tracking-tight leading-tight text-white mb-3">
          {heroTitle || 'The End of the Dirty Toilet Brush.'}
        </h1>
        <p className="text-sm text-white/80 mb-6 leading-relaxed">
          {heroSub || 'The 18-inch hygienic revolution for your bathroom.'}
        </p>
        <button
          onClick={onShopClick}
          className="w-full bg-walmart-navy text-white rounded-full py-4 text-sm font-semibold tracking-wide active:scale-[0.98] transition-transform hover:opacity-90"
        >
          {shopLabel || 'Shop Bundles'}
        </button>
      </div>
    </div>
  );
}

export default function HeroBanner({ slides = [], heroTitle, heroSub, heroBadge, shopLabel, onShopClick }) {
  if (!slides || slides.length === 0) return null;

  // Single slide (mobile Hero): render directly, no Swiper wrapper
  if (slides.length === 1) {
    return (
      <div className="md:hidden relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '480px' }}>
        <HeroSlide slide={slides[0]} normalizeUrl={normalizeUrl} heroTitle={heroTitle} heroBadge={heroBadge} heroSub={heroSub} shopLabel={shopLabel} onShopClick={onShopClick} />
      </div>
    );
  }

  // Multiple slides: use Swiper
  return (
    <div className="md:hidden relative w-full overflow-hidden" style={{ minHeight: '480px' }}>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="hero-swiper"
        style={{ height: '70vh', minHeight: '480px' }}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <HeroSlide slide={slide} normalizeUrl={normalizeUrl} heroTitle={heroTitle} heroBadge={heroBadge} heroSub={heroSub} shopLabel={shopLabel} onShopClick={onShopClick} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}