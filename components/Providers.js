"use client";

import React, { createContext, useContext, useState } from 'react';
import { CartProvider } from "react-use-cart";

const StoreContext = createContext();

export function Providers({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <CartProvider>
      <StoreContext.Provider value={{ 
        isCartOpen, setIsCartOpen, 
        isCheckoutOpen, setIsCheckoutOpen 
      }}>
        {children}
      </StoreContext.Provider>
    </CartProvider>
  );
}

export const useStore = () => useContext(StoreContext);
