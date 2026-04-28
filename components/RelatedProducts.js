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

export default function RelatedProducts({ products = [], onProductClick }) {
  if (!products || products.length === 0) return null;

  return (
    <>
      {/* Mobile: horizontal swipe */}
      <div className="block md:hidden overflow-hidden">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, dynamicBullets: true }}
          spaceBetween={12}
          slidesPerView={1.3}
          freeMode={{ enabled: true, sticky: false }}
          grabCursor
          className="related-products-swiper"
        >
          {products.map((product, idx) => (
            <SwiperSlide key={product.id || idx}>
              <button
                onClick={() => onProductClick?.(product.id)}
                className="w-full bg-slate-900 rounded-[2rem] border border-slate-800 p-6 text-left hover:border-slate-700 transition-all"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800 mb-4">
                  {product.image_url && (
                    <Image
                      src={normalizeUrl(product.image_url)}
                      fill
                      className="object-contain p-4"
                      alt={product.alt_text || product.name}
                      sizes="250px"
                    />
                  )}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight truncate">{product.name}</h3>
                <p className="text-lg font-semibold text-white mt-1">${(product.sale_price || product.price)?.toFixed(2)}</p>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <button
            key={product.id || idx}
            onClick={() => onProductClick?.(product.id)}
            className="bg-slate-900 rounded-[2rem] border border-slate-800 p-6 text-left hover:border-slate-700 transition-all group"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800 mb-4">
              {product.image_url && (
                <Image
                  src={normalizeUrl(product.image_url)}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform"
                  alt={product.alt_text || product.name}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              )}
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight truncate">{product.name}</h3>
            <p className="text-lg font-semibold text-white mt-1">${(product.sale_price || product.price)?.toFixed(2)}</p>
          </button>
        ))}
      </div>
    </>
  );
}