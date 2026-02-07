'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface QuotationItem {
  id: string;
  productId: string;
  name: string;
  code: string;
  brand?: string;
  imageUrl?: string;
  measurementQuantity?: number;
  measurementUnit?: string;
  quantity: number;
}

interface QuotationContextType {
  items: QuotationItem[];
  isCartOpen: boolean;
  addItem: (product: Omit<QuotationItem, 'id' | 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  getTotalItems: () => number;
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

const STORAGE_KEY = 'ospina_quotation_cart';

export function QuotationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored quotation:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = useCallback((product: Omit<QuotationItem, 'id' | 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.productId);
      
      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }
      
      // Add new item
      return [...prev, {
        ...product,
        id: `${product.productId}-${Date.now()}`,
        quantity
      }];
    });
    
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsCartOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <QuotationContext.Provider value={{
      items,
      isCartOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      closeCart,
      openCart,
      getTotalItems
    }}>
      {children}
    </QuotationContext.Provider>
  );
}

export function useQuotation() {
  const context = useContext(QuotationContext);
  if (context === undefined) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
}
