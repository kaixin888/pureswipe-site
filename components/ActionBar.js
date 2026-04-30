// ActionBar — 产品详情页操作按钮组件
// 接收从 useProductActions hook 返回的 actions，只负责 UI 渲染

'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import DeliveryCountdown from './DeliveryCountdown';

/**
 * @param {Object} props
 * @param {Object} props.product              — 完整产品数据
 * @param {Object} props.actions              — useProductActions() 返回值
 * @param {number} props.actions.qty
 * @param {(v:number) => void} props.actions.setQty
 * @param {string} props.actions.purchaseType
 * @param {(v:string) => void} props.actions.setPurchaseType
 * @param {boolean} props.actions.isOutOfStock
 * @param {number} props.actions.effectivePrice
 * @param {number} props.actions.finalPrice
 * @param {number} props.actions.strikethroughPrice
 * @param {boolean} props.actions.isOnSale
 * @param {() => void} props.actions.addToCart
 * @param {() => void} props.actions.buyNow
 * @param {boolean} props.actions.added
 */
export default function ActionBar({ product, actions }) {
  const {
    qty, setQty,
    purchaseType, setPurchaseType,
    isOutOfStock, effectivePrice, finalPrice, strikethroughPrice, isOnSale,
    addToCart, buyNow, added,
  } = actions;

  return (
    <div className="flex flex-col gap-6">
      {/* Subscribe & Save UI */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setPurchaseType('one-time')}
          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
            purchaseType === 'one-time'
              ? 'border-[#1a3a5c] bg-[#1a3a5c]/5'
              : 'border-[#e5e0da] hover:border-[#c5c0ba]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              purchaseType === 'one-time' ? 'border-[#1a3a5c]' : 'border-[#c5c0ba]'
            }`}>
              {purchaseType === 'one-time' && <div className="w-2 h-2 rounded-full bg-[#1a3a5c]" />}
            </div>
            <span className="text-sm font-bold text-[#1a2935]">One-time purchase</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#5a6978]">${effectivePrice.toFixed(2)}</span>
        </button>

        <button
          onClick={() => setPurchaseType('subscribe')}
          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
            purchaseType === 'subscribe'
              ? 'border-[#1a3a5c] bg-[#1a3a5c]/5'
              : 'border-[#e5e0da] hover:border-[#c5c0ba]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              purchaseType === 'subscribe' ? 'border-[#1a3a5c]' : 'border-[#c5c0ba]'
            }`}>
              {purchaseType === 'subscribe' && <div className="w-2 h-2 rounded-full bg-[#1a3a5c]" />}
            </div>
            <div>
              <span className="text-sm font-bold block text-left text-[#1a2935]">Subscribe & Save</span>
              <span className="text-[10px] text-[#1a3a5c] font-semibold tracking-[0.18em] block text-left">Deliver every 3 months</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold tracking-tight text-[#1a2935]">${(effectivePrice * 0.85).toFixed(2)}</span>
            <span className="text-[10px] text-[#b0bcc8] block line-through tracking-tighter">${effectivePrice.toFixed(2)}</span>
          </div>
        </button>
      </div>

      {/* Delivery Countdown */}
      <DeliveryCountdown />

      {/* Qty + Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-[#e5e0da] rounded-full overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-[#1a2935] hover:bg-[#efece8] font-bold">-</button>
            <span className="px-4 py-3 text-[#1a2935] font-bold min-w-[40px] text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-[#1a2935] hover:bg-[#efece8] font-bold">+</button>
          </div>
          <button
            onClick={addToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-4 rounded-full font-semibold tracking-wide text-sm transition-all ${
              isOutOfStock
                ? 'bg-[#e5e0da] text-[#b0bcc8]'
                : added
                  ? 'bg-[#2ecc71] text-white'
                  : 'bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90'
            }`}
          >
            {isOutOfStock ? 'OUT OF STOCK' : added ? '✓ ADDED TO CART' : 'ADD TO CART'}
          </button>
        </div>

        <button
          onClick={buyNow}
          disabled={isOutOfStock}
          className={`w-full py-4 rounded-full font-semibold tracking-wide text-sm transition-all bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90 flex items-center justify-center gap-2 ${
            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Zap size={16} fill="currentColor" />
          BUY IT NOW
        </button>

        {/* Payment Trust Badges */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0bcc8]">Guaranteed Safe Checkout</p>
          <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
            <img src="/images/trust/paypal.svg" alt="PayPal" className="h-5 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/images/trust/stripe.svg" alt="Stripe" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/images/trust/visa.svg" alt="Visa" className="h-4 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/images/trust/mastercard.svg" alt="Mastercard" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}
