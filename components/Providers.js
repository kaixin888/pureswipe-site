"use client";
 
 import React, { createContext, useContext, useState, useEffect } from 'react';
 import { CartProvider, useCart } from "react-use-cart";
 
 const StoreContext = createContext();
 
 // Auto-clear stale test/dev cart data on mount
 // Only 3 bundles exist; carts with >10 items are clearly test residue
 function CartGuard({ children }) {
   const { totalItems, emptyCart } = useCart();
   useEffect(() => {
     if (totalItems > 10) {
       emptyCart();
     }
   }, []); // once on mount
   return children;
 }
 
 export function Providers({ children }) {
   const [isCartOpen, setIsCartOpen] = useState(false);
   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
   const [customerEmail, setCustomerEmail] = useState('');
   const [customerName, setCustomerName] = useState('');
   const [checkoutStep, setCheckoutStep] = useState('info');
   const [discountInfo, setDiscountInfo] = useState(null);
   // Cookie consent: null = not yet chosen, true = analytics accepted, false = analytics rejected
   const [cookieConsent, setCookieConsent] = useState(null);
 
    return (
      <CartProvider>
        <CartGuard>
          <StoreContext.Provider value={{
            isCartOpen, setIsCartOpen,
            isCheckoutOpen, setIsCheckoutOpen,
            customerEmail, setCustomerEmail,
            customerName, setCustomerName,
            checkoutStep, setCheckoutStep,
            discountInfo, setDiscountInfo,
            cookieConsent, setCookieConsent
          }}>
            {children}
          </StoreContext.Provider>
        </CartGuard>
      </CartProvider>
    );
 }
 
 export const useStore = () => useContext(StoreContext);
