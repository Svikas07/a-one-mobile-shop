'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, db } from '@/lib/db';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedModel?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedModel?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  couponCode: string;
  couponDiscount: number;
  couponError: string;
  couponSuccess: string;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  gstAmount: number;
  shippingCharges: number;
  grandTotal: number;
  freeShippingTarget: number;
  freeShippingProgress: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aone_cart');
      if (stored) {
        try {
          setCartItems(JSON.parse(stored));
        } catch (e) {
          console.error('Error loading cart:', e);
        }
      }
      const storedCoupon = localStorage.getItem('aone_coupon_code');
      const storedDiscount = localStorage.getItem('aone_coupon_discount');
      if (storedCoupon && storedDiscount) {
        setCouponCode(storedCoupon);
        setCouponDiscount(Number(storedDiscount));
      }
    }
  }, []);

  // Save cart to localStorage when changed
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aone_cart', JSON.stringify(items));
    }
  };

  const addToCart = (product: Product, quantity = 1, selectedModel?: string) => {
    const existingIndex = cartItems.findIndex(
      item => item.product.id === product.id && item.selectedModel === selectedModel
    );

    let newItems = [...cartItems];
    if (existingIndex > -1) {
      newItems[existingIndex].quantity = Math.min(product.stock, newItems[existingIndex].quantity + quantity);
    } else {
      newItems.push({ product, quantity, selectedModel });
    }
    
    saveCart(newItems);
    setCartOpen(true); // Open the drawer upon adding
  };

  const removeFromCart = (productId: string) => {
    const newItems = cartItems.filter(item => item.product.id !== productId);
    saveCart(newItems);
    // If cart becomes empty, remove coupon
    if (newItems.length === 0) {
      removeCoupon();
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const newItems = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(1, Math.min(item.product.stock, quantity)) };
      }
      return item;
    });
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError('');
    setCouponSuccess('');
    const currentSubtotal = cartItems.reduce((sum, item) => sum + (item.product.sale_price || item.product.price) * item.quantity, 0);
    
    const result = await db.validateCoupon(code, currentSubtotal);
    if (result.success) {
      setCouponCode(code);
      setCouponDiscount(result.discount);
      setCouponSuccess(result.message);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aone_coupon_code', code);
        localStorage.setItem('aone_coupon_discount', String(result.discount));
      }
      return true;
    } else {
      setCouponError(result.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
    setCouponSuccess('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aone_coupon_code');
      localStorage.removeItem('aone_coupon_discount');
    }
  };

  // CALCULATE COSTS
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.sale_price || item.product.price) * item.quantity,
    0
  );

  // Re-verify coupon discount if subtotal changes below minimum order value
  useEffect(() => {
    if (couponCode && subtotal > 0) {
      db.validateCoupon(couponCode, subtotal).then(res => {
        if (!res.success) {
          removeCoupon();
        } else {
          setCouponDiscount(res.discount);
          if (typeof window !== 'undefined') {
            localStorage.setItem('aone_coupon_discount', String(res.discount));
          }
        }
      });
    }
  }, [subtotal, couponCode]);

  // GST calculation (18% inclusive or exclusive, let's treat it as 18% of subtotal for clarity)
  const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
  
  // Free Shipping above Rs. 499
  const freeShippingTarget = 499;
  const shippingCharges = subtotal >= freeShippingTarget || subtotal === 0 ? 0 : 49;
  const grandTotal = Math.max(0, subtotal + shippingCharges - couponDiscount);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingTarget) * 100);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        couponCode,
        couponDiscount,
        couponError,
        couponSuccess,
        applyCoupon,
        removeCoupon,
        subtotal,
        gstAmount,
        shippingCharges,
        grandTotal,
        freeShippingTarget,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
