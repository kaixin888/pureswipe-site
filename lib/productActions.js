// 产品详情交互 Actions 工厂函数
// 将所有业务逻辑（加购、立即购买、规格选择等）集中管理，与 UI 解耦
// 
// 重要：只使用 React state 管理数量/订阅状态，避免 getter/setter 双状态不同步问题

import React from 'react';
import { getEffectivePrice } from './getEffectivePrice';

const GA4_EVENT = (event, params) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  }
};

/**
 * useProductActions — React hook
 * 管理 qty / purchaseType / added 状态 + 返回所有 action
 *
 * @param {Object} product    — 产品对象（id, name, price, sale_price, stock, image_url 等）
 * @param {Object} cartHooks  — { addItem } from react-use-cart
 * @param {Function} openCheckout — () => setIsCheckoutOpen(true)
 * @returns {Object} { qty, setQty, purchaseType, setPurchaseType, effectivePrice, finalPrice, isOnSale, isOutOfStock, strikethroughPrice, buyNow, addToCart, added }
 */
export function useProductActions(product, cartHooks, openCheckout) {
  const [qty, setQty] = React.useState(1);
  const [purchaseType, setPurchaseType] = React.useState('one-time');
  const [added, setAdded] = React.useState(false);

  // 推导属性：使用 React state 值，而非闭包变量
  const isOutOfStock = product.stock <= 0;
  const { price: effectivePrice, originalPrice: trueOriginalPrice, isOnSale } = getEffectivePrice(product);
  const finalPrice = purchaseType === 'subscribe' ? effectivePrice * 0.85 : effectivePrice;
  const strikethroughPrice = isOnSale ? trueOriginalPrice : effectivePrice * 1.3;

  // 加购
  const addToCart = React.useCallback(() => {
    if (isOutOfStock) return;
    cartHooks.addItem({
      id: product.id.toString(),
      name: product.name,
      price: finalPrice,
      image: product.image_url,
      quantity: qty,
      purchase_type: purchaseType,
    });

    GA4_EVENT('add_to_cart', {
      currency: 'USD',
      value: finalPrice * qty,
      items: [{
        item_id: product.id.toString(),
        item_name: product.name,
        price: finalPrice,
        quantity: qty,
      }],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [product, qty, purchaseType, isOutOfStock, finalPrice, cartHooks]);

  // 立即购买
  const buyNow = React.useCallback(() => {
    if (isOutOfStock) return;
    cartHooks.addItem({
      id: product.id.toString(),
      name: product.name,
      price: finalPrice,
      image: product.image_url,
      quantity: qty,
      purchase_type: purchaseType,
    });
    openCheckout();
  }, [product, qty, purchaseType, isOutOfStock, finalPrice, cartHooks, openCheckout]);

  return {
    qty, setQty,
    purchaseType, setPurchaseType,
    added,
    isOutOfStock,
    effectivePrice,
    finalPrice,
    isOnSale,
    strikethroughPrice,
    addToCart,
    buyNow,
  };
}
