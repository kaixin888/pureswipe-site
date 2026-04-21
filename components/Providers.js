"use client";

import React, { createContext, useContext, useState } from 'react';
import { CartProvider } from "react-use-cart";

const StoreContext = createContext();

export function Providers({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('info');
  const [discountInfo, setDiscountInfo] = useState(null);

  return (
    <CartProvider>
      <StoreContext.Provider value={{ 
        isCartOpen, setIsCartOpen, 
        isCheckoutOpen, setIsCheckoutOpen,
        customerEmail, setCustomerEmail,
        customerName, setCustomerName,
        checkoutStep, setCheckoutStep,
        discountInfo, setDiscountInfo
      }}>
        {children}
      </StoreContext.Provider>
    </CartProvider>
  );
}

export const useStore = () => useContext(StoreContext);
