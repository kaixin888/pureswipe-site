// StickyBuyBar — 移动端产品详情页底部粘性购买栏
// 固定在屏幕底部（移动端导航栏上方），显示价格 + 数量 + 加购

'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from './Providers';

export default function StickyBuyBar({ product, actions }) {
  const [visible, setVisible] = useState(true);
  const { setIsCheckoutOpen } = useStore();

  useEffect(() => {
    // 当产品加载后显示
    if (product) setVisible(true);
  }, [product]);

  // 未加载或无产品时不渲染
  if (!product || !actions) return null;

  const {
    qty, setQty,
    isOutOfStock, finalPrice, effectivePrice,
    addToCart, buyNow, added,
  } = actions;

  return (
    <div className="md:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-[75] bg-white/95 backdrop-blur-xl border-t border-black/5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* 价格 */}
        <div className="flex-shrink-0 min-w-[80px]">
          <p className="text-xs font-black uppercase tracking-widest text-[#8a9aa8]">Total</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-[#1a2935]">${(finalPrice * qty).toFixed(2)}</span>
            {qty > 1 && <span className="text-[10px] text-[#b0bcc8]">({qty}x)</span>}
          </div>
        </div>

        {/* 数量选择器 */}
        <div className="flex-shrink-0">
          <div className="flex items-center border border-[#e5e0da] rounded-full overflow-hidden h-9">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="px-3 h-full text-[#1a2935] hover:bg-[#efece8] font-bold text-sm"
              aria-label="Decrease quantity"
            >-</button>
            <span className="px-2 h-full flex items-center text-[#1a2935] font-bold text-sm min-w-[24px] justify-center">
              {qty}
            </span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="px-3 h-full text-[#1a2935] hover:bg-[#efece8] font-bold text-sm"
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        {/* 加购按钮 */}
        <button
          onClick={addToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-2.5 rounded-full font-bold text-xs tracking-wider transition-all ${
            isOutOfStock
              ? 'bg-[#e5e0da] text-[#b0bcc8]'
              : added
                ? 'bg-[#2ecc71] text-white'
                : 'bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90 active:scale-[0.98]'
          }`}
        >
          {isOutOfStock ? 'OUT OF STOCK' : added ? '✓ ADDED' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
}
