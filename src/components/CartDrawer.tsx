'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Heart, Plus, Minus, ArrowRight, Tag, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/db';
import Link from 'next/link';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    gstAmount,
    shippingCharges,
    grandTotal,
    couponCode,
    couponDiscount,
    couponError,
    couponSuccess,
    applyCoupon,
    removeCoupon,
    freeShippingTarget,
    freeShippingProgress
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [loadingPromo, setLoadingPromo] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setLoadingPromo(true);
    await applyCoupon(promoInput.trim());
    setLoadingPromo(false);
  };

  const handleMoveToWishlist = async (productId: string) => {
    await db.toggleWishlist(productId);
    removeFromCart(productId);
    // Raise a custom event to notify other components to refresh wishlist
    window.dispatchEvent(new Event('aone_wishlist_update'));
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-card shadow-large z-50 flex flex-col border-l border-border"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Shopping Cart</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-background rounded-full transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {cartItems.length > 0 && (
              <div className="px-6 py-4 bg-background/50 border-b border-border text-xs">
                {subtotal >= freeShippingTarget ? (
                  <p className="text-accent font-semibold flex items-center gap-1.5">
                    🎉 You qualify for Free Express Shipping!
                  </p>
                ) : (
                  <div>
                    <p className="text-text-secondary font-medium mb-2">
                      Spend <span className="font-semibold text-text-primary">₹{freeShippingTarget - subtotal}</span> more for <span className="font-semibold text-text-primary">Free Delivery</span>
                    </p>
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-secondary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Items list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-text-secondary">
                    <Trash2 className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Your Cart is Empty</h4>
                    <p className="text-sm text-text-secondary mt-1 max-w-[240px] mx-auto">
                      Add some premium accessories to get started.
                    </p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-button shadow-soft hover:bg-primary/95 scale-95 hover:scale-100 transition-all duration-300"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.selectedModel}`} className="flex gap-4 pb-6 border-b border-border/60 last:border-b-0">
                    <div className="w-20 h-20 bg-background rounded-image overflow-hidden flex-shrink-0 relative border border-border">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-bold text-sm text-text-primary truncate">{item.product.product_name}</h5>
                          <span className="font-bold text-sm text-text-primary">
                            ₹{(item.product.sale_price || item.product.price) * item.quantity}
                          </span>
                        </div>
                        {item.selectedModel && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            Model: {item.selectedModel}
                          </p>
                        )}
                        <p className="text-xs text-text-secondary mt-0.5 italic">
                          {item.product.sku}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-border rounded-button overflow-hidden bg-background">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-border/40 transition-colors focus:outline-none"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-border/40 transition-colors focus:outline-none"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveToWishlist(item.product.id)}
                            className="p-2 hover:bg-background text-text-secondary hover:text-danger rounded-full transition-colors focus:outline-none"
                            title="Move to Wishlist"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 hover:bg-background text-text-secondary hover:text-danger rounded-full transition-colors focus:outline-none"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Pricing & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-background/30 space-y-4">
                {/* Coupon field */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Coupon Code (AONE20)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-input text-sm bg-card focus:outline-none focus:border-secondary transition-colors"
                      disabled={!!couponCode}
                    />
                  </div>
                  {couponCode ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="px-4 py-2 border border-danger text-danger text-sm font-semibold rounded-button hover:bg-danger/5 transition-colors focus:outline-none"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loadingPromo}
                      className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary/90 transition-all focus:outline-none"
                    >
                      Apply
                    </button>
                  )}
                </form>

                {couponError && <p className="text-xs font-medium text-danger">{couponError}</p>}
                {couponSuccess && (
                  <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" /> {couponSuccess}
                  </p>
                )}

                {/* Subtotals */}
                <div className="space-y-2.5 text-sm pt-2 border-t border-border/40">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-medium text-text-primary">₹{subtotal}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-accent font-medium">
                      <span>Coupon Discount ({couponCode})</span>
                      <span>- ₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>GST (18% Incl.)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Delivery Charges</span>
                    <span className="font-medium text-text-primary">
                      {shippingCharges === 0 ? (
                        <span className="text-accent font-semibold">FREE</span>
                      ) : (
                        `₹${shippingCharges}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-text-primary pt-2 border-t border-border/60">
                    <span>Grand Total</span>
                    <span className="text-lg">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Checkout Actions */}
                <div className="pt-2">
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="w-full py-4 bg-secondary text-white font-bold rounded-button flex items-center justify-center gap-2 hover:bg-secondary/95 active:scale-98 transition-all shadow-medium"
                  >
                    <span>Checkout Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[10px] text-center text-text-secondary mt-2.5">
                    Secure checkout powered by Razorpay. Cash on Delivery (COD) available.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
