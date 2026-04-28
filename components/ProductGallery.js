'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import { X } from 'lucide-react';

const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com');
};

export default function ProductGallery({ images = [], tag, altText, productName }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktopThumbsSwiper, setDesktopThumbsSwiper] = useState(null);
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) return null;

  const resolvedImages = images.map(normalizeUrl);

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () => setLightboxIndex((i) => (i > 0 ? i - 1 : resolvedImages.length - 1));
  const nextLightbox = () => setLightboxIndex((i) => (i < resolvedImages.length - 1 ? i + 1 : 0));

  return (
    <>
      {/* Mobile: Swiper carousel - Apple Store style */}
      <div className="block md:hidden overflow-hidden">
        {/* Main carousel: slidesPerView=1, auto-play, pagination dots */}
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay, Thumbs]}
            slidesPerView={1}
            spaceBetween={0}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            thumbs={{
              swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            className="product-gallery-main"
            style={{ aspectRatio: '1' }}
          >
            {resolvedImages.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div
                  className="relative w-full aspect-square bg-white overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(idx)}
                >
                  {tag && idx === 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg">
                      {tag}
                    </div>
                  )}
                  <Image
                    src={src}
                    alt={altText || `${productName || 'Product'} View ${idx + 1}`}
                    fill
                    className="object-contain p-6"
                    priority={idx === 0}
                    sizes="100vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Page number badge: bottom-right corner */}
          <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full pointer-events-none select-none">
            {activeIndex + 1} / {resolvedImages.length}
          </div>
        </div>

        {/* Thumbnail strip: 4.5 slides visible, clickable */}
        {resolvedImages.length > 1 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[FreeMode, Thumbs]}
            spaceBetween={8}
            slidesPerView={4.5}
            freeMode={true}
            watchSlidesProgress={true}
            className="product-gallery-thumbs mt-3"
          >
            {resolvedImages.map((src, idx) => (
              <SwiperSlide key={idx} className="cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-transparent bg-white">
                  <Image
                    src={src}
                    alt={`${altText || productName || 'Product'} thumb ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Desktop: Swiper carousel — same behaviour as mobile */}
      <div className="hidden md:block overflow-hidden">
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay, Thumbs]}
            slidesPerView={1}
            spaceBetween={0}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            thumbs={{
              swiper: desktopThumbsSwiper && !desktopThumbsSwiper.destroyed ? desktopThumbsSwiper : null,
            }}
            onSlideChange={(s) => setDesktopActiveIndex(s.realIndex)}
            className="product-gallery-main-desktop"
            style={{ aspectRatio: '1' }}
          >
            {resolvedImages.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div
                  className="relative w-full aspect-square bg-white overflow-hidden cursor-pointer rounded-2xl"
                  onClick={() => openLightbox(idx)}
                >
                  {tag && idx === 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-[#1a3a5c] text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg">
                      {tag}
                    </div>
                  )}
                  <Image
                    src={src}
                    alt={altText || `${productName || 'Product'} View ${idx + 1}`}
                    fill
                    className="object-contain p-8"
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Page number badge */}
          <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full pointer-events-none select-none">
            {desktopActiveIndex + 1} / {resolvedImages.length}
          </div>
        </div>

        {/* Thumbnail strip — single row, no wrap */}
        {resolvedImages.length > 1 && (
          <Swiper
            onSwiper={setDesktopThumbsSwiper}
            modules={[FreeMode, Thumbs]}
            spaceBetween={8}
            slidesPerView={4.5}
            freeMode={true}
            watchSlidesProgress={true}
            className="product-gallery-thumbs-desktop mt-3"
          >
            {resolvedImages.map((src, idx) => (
              <SwiperSlide key={idx} className="cursor-pointer">
                <div className={`aspect-square rounded-lg overflow-hidden border-2 bg-white transition-all ${
                  desktopActiveIndex === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-400'
                }`}>
                  <Image
                    src={src}
                    alt={`${altText || productName || 'Product'} thumb ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Lightbox Modal (shared by mobile + desktop) */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-blue-400 transition-colors z-10">
            <X size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl font-bold z-10 px-4"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl font-bold z-10 px-4"
          >
            &#8250;
          </button>
          <div className="relative max-w-4xl max-h-full aspect-square w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={resolvedImages[lightboxIndex]}
              fill
              className="object-contain"
              alt={altText || `${productName} View ${lightboxIndex + 1}`}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {resolvedImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  lightboxIndex === idx ? 'bg-blue-400 scale-1.5' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
