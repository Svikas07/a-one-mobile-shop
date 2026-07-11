'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/db';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ArrowRight, Trash2, Heart, Plus, Minus, Tag, Percent, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const {
    cartItems,
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
    window.dispatchEvent(new Event('aone_wishlist_update'));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center space-y-5 bg-card border border-border rounded-modal max-w-xl mx-auto shadow-soft">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto text-text-secondary">
              <Trash2 className="w-10 h-10 opacity-30" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Your Cart is Empty</h3>
              <p className="text-sm text-text-secondary mt-1">
                Looks like you haven't added any premium mobile accessories yet.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-secondary text-white font-bold rounded-button shadow hover:bg-secondary/95 transition-all text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Accessories</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT COLUMN: Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Free Shipping bar */}
              <div className="p-4 bg-card border border-border rounded-modal text-xs">
                {subtotal >= freeShippingTarget ? (
                  <p className="text-accent font-semibold">🎉 You have qualified for free delivery!</p>
                ) : (
                  <div>
                    <p className="text-text-secondary font-medium mb-2">
                      Add <span className="font-semibold text-text-primary">₹{freeShippingTarget - subtotal}</span> more for <span className="font-semibold text-text-primary">Free Delivery</span>
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

              {/* Items List */}
              <div className="bg-card border border-border rounded-modal overflow-hidden">
                <div className="p-6 divide-y divide-border/60">
                  {cartItems.map((item) => (
                    <div key={`${item.product.id}-${item.selectedModel}`} className="flex flex-col sm:flex-row gap-6 py-6 first:pt-0 last:pb-0">
                      
                      {/* Thumbnail */}
                      <div className="w-24 h-24 bg-background rounded-image overflow-hidden flex-shrink-0 border border-border">
                        <img src={item.product.images[0]} alt={item.product.product_name} className="w-full h-full object-cover" />
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-base text-text-primary hover:text-secondary transition-colors">
                              <Link href={`/product/${item.product.slug}`}>{item.product.product_name}</Link>
                            </h4>
                            {item.selectedModel && (
                              <p className="text-xs text-text-secondary mt-1">
                                Fits Model: <span className="font-semibold text-text-primary">{item.selectedModel}</span>
                              </p>
                            )}
                            <p className="text-xs text-text-secondary mt-0.5">SKU: {item.product.sku}</p>
                          </div>
                          <span className="font-bold text-base text-text-primary">
                            ₹{(item.product.sale_price || item.product.price) * item.quantity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity selectors */}
                          <div className="flex items-center border border-border rounded-button overflow-hidden bg-background">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-3 py-1.5 hover:bg-border/30 transition-colors focus:outline-none"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-3 py-1.5 hover:bg-border/30 transition-colors focus:outline-none"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMoveToWishlist(item.product.id)}
                              className="p-2 hover:bg-background text-text-secondary hover:text-danger rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <Heart className="w-4 h-4" />
                              <span className="hidden sm:inline">Move Wishlist</span>
                            </button>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-2 hover:bg-background text-text-secondary hover:text-danger rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-card border border-border rounded-modal p-6 shadow-soft space-y-6">
                <h3 className="font-bold text-lg text-text-primary pb-3 border-b border-border">Order Summary</h3>
                
                {/* Coupon form */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                      disabled={!!couponCode}
                    />
                  </div>
                  {couponCode ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="px-4 py-2.5 border border-danger text-danger text-xs font-bold rounded-button hover:bg-danger/5"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loadingPromo}
                      className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-button hover:bg-primary/95"
                    >
                      Apply
                    </button>
                  )}
                </form>

                {couponError && <p className="text-xs font-medium text-danger">{couponError}</p>}
                {couponSuccess && (
                  <p className="text-xs font-bold text-accent flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{couponSuccess}</span>
                  </p>
                )}

                {/* Subtotals detail */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-semibold text-text-primary">₹{subtotal}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-accent font-semibold">
                      <span>Discount ({couponCode})</span>
                      <span>- ₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>GST (18% Incl.)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping Charges</span>
                    <span className="font-semibold text-text-primary">
                      {shippingCharges === 0 ? (
                        <span className="text-accent">FREE</span>
                      ) : (
                        `₹${shippingCharges}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm font-bold text-text-primary pt-4 border-t border-border">
                    <span>Grand Total</span>
                    <span className="text-base text-secondary">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-secondary text-white font-bold rounded-button flex items-center justify-center gap-2 hover:bg-secondary/95 shadow-medium transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[10px] text-center text-text-secondary pt-2">
                  Tax invoice will be generated upon checkout. Secure payments processed via Razorpay.
                </p>
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}
