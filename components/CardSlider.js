'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com');
};

export default function CardSlider({ cards = [], type = 'review' }) {
  if (!cards || cards.length === 0) return null;

  const slidesPerViewDesktop = type === 'feature' ? 3 : 2;

  return (
    <div className="block md:hidden overflow-hidden">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true, dynamicBullets: true }}
        spaceBetween={12}
        slidesPerView={1}
        freeMode={{ enabled: true, sticky: false }}
        grabCursor
        className={`card-slider card-slider-${type}`}
      >
        {cards.map((card, idx) => (
          <SwiperSlide key={card.id || idx}>
            {type === 'review' ? (
              <div className="p-8 bg-white rounded-[12px] border border-[#e5e0da] shadow-[0_2px_12px_rgba(0,0,0,0.06)] min-h-[220px]">
                <div className="flex gap-1 text-blue-600 mb-4">
                  {[...Array(card.rating || 5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 15.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-base text-slate-700 italic font-medium leading-relaxed mb-4">"{card.content || card.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-blue-600 border border-slate-200 uppercase">
                    {(card.author_name || card.name || 'U')[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{card.author_name || card.name || 'Verified Buyer'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.author_location || card.location || 'United States'}</p>
                  </div>
                </div>
              </div>
            ) : type === 'feature' ? (
              <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[160px] flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-4 text-blue-600">
                  {card.icon || null}
                </div>
                <h3 className="text-lg font-black italic tracking-tight uppercase text-slate-950 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
              </div>
            ) : type === 'bundle' ? (
              <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[200px] flex flex-col">
                {card.tag && (
                  <span className="inline-block bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">{card.tag}</span>
                )}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-4">
                  {card.image && (
                    <Image src={normalizeUrl(card.image)} fill className="object-contain p-4" alt={card.name} sizes="100vw" />
                  )}
                </div>
                <h3 className="text-base font-black italic tracking-tight uppercase text-slate-950 mb-1">{card.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{card.description}</p>
                <p className="text-2xl font-semibold text-slate-950 tracking-tight">${card.price?.toFixed(2)}</p>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[160px]">
                {card.title && <h3 className="text-base font-black italic tracking-tight uppercase text-slate-950 mb-2">{card.title}</h3>}
                {card.content && <p className="text-sm text-slate-500 leading-relaxed">{card.content}</p>}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}