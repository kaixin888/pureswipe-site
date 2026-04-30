// 产品详情交互 Actions 工厂函数
// 将所有业务逻辑（加购、立即购买、规格选择等）集中管理，与 UI 解耦

import React, { useState, useMemo } from 'react';
import { getEffectivePrice } from './getEffectivePrice';

const GA4_EVENT = (event, params) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  }
};

/**
 * createProductActions — 工厂函数
 * 接收产品数据 + cart/store hooks，返回所有可用 action 方法
 *
 * @param {Object} product    — 产品对象（id, name, price, sale_price, stock, image_url 等）
 * @param {Object} cartHooks  — { addItem } from react-use-cart
 * @param {Function} openCheckout — () => setIsCheckoutOpen(true)
 * @returns {Object} { buyNow, addToCart, setQty, qty, setPurchaseType, purchaseType, effectivePrice, finalPrice, isOnSale, isOutOfStock, strikethroughPrice }
 */
export function createProductActions(product, cartHooks, openCheckout) {
  const { addItem } = cartHooks;

  // ----- 状态变量（由调用方通过 useState 传入）-----
  // 这些会由 useProductActions hook 管理，工厂函数只提供逻辑
  let _qty = 1;
  let _purchaseType = 'one-time';
  let _setQty = () => {};
  let _setPurchaseType = () => {};
  let _setAdded = () => {};

  const isOutOfStock = product.stock <= 0;

  const { price: effectivePrice, originalPrice: trueOriginalPrice, isOnSale } = getEffectivePrice(product);
  const finalPrice = _purchaseType === 'subscribe' ? effectivePrice * 0.85 : effectivePrice;
  const strikethroughPrice = isOnSale ? trueOriginalPrice : effectivePrice * 1.3;

  return {
    // ----- 读写状态 -----
    get qty() { return _qty; },
    set qty(v) { _qty = v; _setQty(v); },

    get purchaseType() { return _purchaseType; },
    set purchaseType(v) { _purchaseType = v; _setPurchaseType(v); },

    // ----- 计算属性 -----
    isOutOfStock,
    effectivePrice,
    finalPrice,
    isOnSale,
    strikethroughPrice,

    // ----- 绑定 setter（由 hook 调用）-----
    _bindSetters(setters) {
      _setQty = setters.setQty;
      _setPurchaseType = setters.setPurchaseType;
      _setAdded = setters.setAdded;
    },

    // ----- Actions -----
    buyNow() {
      if (isOutOfStock) return;
      addItem({
        id: product.id.toString(),
        name: product.name,
        price: finalPrice,
        image: product.image_url,
        quantity: _qty,
        purchase_type: _purchaseType,
      });
      openCheckout();
    },

    addToCart() {
      if (isOutOfStock) return;
      addItem({
        id: product.id.toString(),
        name: product.name,
        price: finalPrice,
        image: product.image_url,
        quantity: _qty,
        purchase_type: _purchaseType,
      });

      GA4_EVENT('add_to_cart', {
        currency: 'USD',
        value: finalPrice * _qty,
        items: [{
          item_id: product.id.toString(),
          item_name: product.name,
          price: finalPrice,
          quantity: _qty,
        }],
      });

      _setAdded(true);
      setTimeout(() => _setAdded(false), 2000);
    },
  };
}

/**
 * useProductActions — React hook 包装
 * 管理 qty / purchaseType / added 状态 + 返回所有 action
 *
 * @param {Object} product
 * @param {Object} cartHooks  — { addItem }
 * @param {Function} openCheckout
 * @returns {Object} { qty, setQty, purchaseType, setPurchaseType, effectivePrice, finalPrice, isOnSale, isOutOfStock, strikethroughPrice, buyNow, addToCart, added }
 */
export function useProductActions(product, cartHooks, openCheckout) {
  const [qty, setQty] = React.useState(1);
  const [purchaseType, setPurchaseType] = React.useState('one-time');
  const [added, setAdded] = React.useState(false);

  const actions = React.useMemo(() => {
    const factory = createProductActions(product, cartHooks, openCheckout);
    factory._bindSetters({ setQty, setPurchaseType, setAdded });
    return factory;
  }, [product, cartHooks, openCheckout]);

  return {
    qty, setQty,
    purchaseType, setPurchaseType,
    added,
    ...actions,
  };
}
