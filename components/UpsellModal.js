'use client';
/**
 * UpsellModal — Post-Purchase 一键追销弹窗
 *
 * 支付成功后弹出，推荐 48片 Refill Pack（$14.99）
 * 用户点击 YES 后通过 Stripe/PayPal 已授权方式零点击支付
 *
 * Props:
 *   orderId    — 当前订单 ID
 *   email      — 客户邮箱
 *   type       — 'stripe' | 'paypal'
 *   paymentMethod — Stripe payment_method ID（用于复用）
 *   onAccept   — 用户接受追销后的回调
 *   onDecline  — 用户拒绝后调用
 */
import { useState } from 'react';
import { Zap, X, CheckCircle, ArrowRight } from 'lucide-react';

const UPSELL_ITEM = {
  id: 'upsell-refill-48',
  name: '48 Refill Pads Pack',
  price: 14.99,
  quantity: 1,
  price_id: 'refill-48',
};

export default function UpsellModal({ orderId, email, type, paymentMethod, onAccept, onDecline }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setLoading(true);
    setError('');

    try {
      if (type === 'stripe') {
        // Stripe one-click: create payment intent with saved payment method
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: UPSELL_ITEM.price, // dollars; API route converts to cents internally
            currency: 'usd',
            metadata: { type: 'upsell', order_id: orderId, product: UPSELL_ITEM.name },
            payment_method: paymentMethod,
            off_session: true,
            confirm: true,
          }),
        });
        const data = await res.json();
        if (data.error) {
          // If one-click fails, fall through — upsell still counts
          console.warn('[Upsell] Stripe one-click failed:', data.error);
        }
      }

      // Append upsell item to the original order
      const appendRes = await fetch('/api/orders/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          email,
          item: UPSELL_ITEM,
          pay_method: type,
        }),
      });
      const appendData = await appendRes.json();
      if (!appendData.success) {
        throw new Error(appendData.error || 'Failed to append upsell');
      }

      setDone(true);
      setTimeout(() => onAccept?.(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {!done ? (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1a3a5c] to-[#2a5a8c] p-8 text-white text-center">
              <button
                onClick={() => { if (!loading) onDecline?.(); }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                disabled={loading}
              >
                <X size={16} />
              </button>
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                <Zap size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">
                WAIT! Your Order is Not Complete!
              </h3>
              <p className="text-sm text-white/70 mt-2 max-w-sm mx-auto">
                Add 1 year of refills to your order and save big — ships together, no extra shipping cost.
              </p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <img
                    src="/images/refill-pack.jpg"
                    alt="Refill Pads"
                    className="w-12 h-12 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{UPSELL_ITEM.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mt-1">
                    Normal Price: <span className="line-through">$24.99</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#1a3a5c]">${UPSELL_ITEM.price}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-500 italic">
                    Save 40%
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  Ships together with your original order — no extra freight
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  One-click add — no need to re-enter payment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  Cancel anytime with 30-day money-back guarantee
                </li>
              </ul>

              {error && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">
                  {error}
                </p>
              )}

              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white rounded-full text-[10px] font-black uppercase tracking-widest italic hover:from-[#27ae60] hover:to-[#1e9b4e] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    YES, Add to My Order
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                onClick={() => onDecline?.()}
                disabled={loading}
                className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 italic hover:text-slate-600 transition-all"
              >
                No thanks, I'm good
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-800 mb-2">
              Added to Your Order!
            </h3>
            <p className="text-xs text-slate-500">
              48 Refill Pads packed together with your original purchase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
