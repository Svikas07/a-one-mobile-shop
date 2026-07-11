'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db, Order } from '@/lib/db';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Search, MapPin, Truck, Calendar, Sparkles, Check, Hourglass, Box, Milestone } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  
  const initialOrder = searchParams.get('order') || '';
  const initialContact = searchParams.get('contact') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrder);
  const [contactInput, setContactInput] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !contactInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    const result = await db.trackOrder(orderIdInput.trim(), contactInput.trim());
    if (result) {
      setOrder(result);
    } else {
      setErrorMsg('No order matches the provided Order Number and Contact info. Please double check.');
    }
    setLoading(false);
  };

  // Run automatically if URL parameters are prefilled
  useEffect(() => {
    if (initialOrder && initialContact) {
      setLoading(true);
      db.trackOrder(initialOrder, initialContact).then(res => {
        if (res) setOrder(res);
        else setErrorMsg('No order matches the provided details.');
        setLoading(false);
      });
    }
  }, [initialOrder, initialContact]);

  // Order status steps definition
  const steps = [
    { label: 'Placed', status: 'Pending', desc: 'We have received your order details' },
    { label: 'Confirmed', status: 'Confirmed', desc: 'Order details verified and approved' },
    { label: 'Packed', status: 'Packed', desc: 'Items safely packed in warehouse' },
    { label: 'Shipped', status: 'Shipped', desc: 'Package handed over to delivery courier' },
    { label: 'Out for Delivery', status: 'Out For Delivery', desc: 'Courier driver delivering to your city' },
    { label: 'Delivered', status: 'Delivered', desc: 'Order safely delivered to recipient' }
  ];

  // Helper to determine active step indexes
  const getActiveStepIndex = (status: string) => {
    if (status === 'Cancelled' || status === 'Returned' || status === 'Refunded') return -1;
    return steps.findIndex(s => s.status === status);
  };

  const activeIndex = order ? getActiveStepIndex(order.order_status) : -1;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Delivery Status</span>
            <h1 className="text-3xl font-bold text-text-primary">Track Your Order</h1>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Enter your A-One order reference and email/phone to check real-time courier updates.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-modal p-6 shadow-soft">
            <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 text-left space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Order Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AO-2026-4592"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full p-3 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="md:col-span-5 text-left space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Phone Number or Email</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vikas@aonemobile.com"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="w-full p-3 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 w-full py-3 bg-primary text-white font-bold rounded-button text-xs hover:bg-primary/95 shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Search className="w-4 h-4" />
                <span>Track</span>
              </button>
            </form>
            {errorMsg && <p className="text-xs font-semibold text-danger mt-4 text-left">⚠️ {errorMsg}</p>}
          </div>

          {/* Timeline details output */}
          {loading && (
            <div className="p-8 bg-card border border-border rounded-modal flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
            </div>
          )}

          {order && (
            <div className="bg-card border border-border rounded-modal overflow-hidden p-6 md:p-8 space-y-8 text-left shadow-soft animate-fade-in">
              
              {/* Order Info Headers */}
              <div className="flex flex-col sm:flex-row justify-between border-b border-border pb-6 gap-4">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.order_number}</h3>
                  <p className="text-xs text-text-secondary mt-1">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="sm:text-right">
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    order.order_status === 'Delivered'
                      ? 'bg-accent/10 text-accent'
                      : order.order_status === 'Cancelled'
                      ? 'bg-danger/10 text-danger'
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    Status: {order.order_status}
                  </span>
                  <p className="text-xs text-text-secondary mt-1.5">Estimated delivery in 2-3 business days.</p>
                </div>
              </div>

              {/* SPECIAL CANCELLED OR RETURNED STATE */}
              {activeIndex === -1 && (
                <div className="p-4 bg-danger/5 border border-danger/20 text-danger rounded-modal text-xs font-semibold">
                  ⚠️ This order is marked as {order.order_status}. For refunds or claims, please contact A-One support.
                </div>
              )}

              {/* TIMELINE PROGRESS FLOW */}
              {activeIndex > -1 && (
                <div className="relative pl-6 sm:pl-0 pt-4 pb-2">
                  <div className="hidden sm:block absolute left-4 right-4 top-[24px] h-0.5 bg-border z-0" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 relative z-10 text-xs">
                    {steps.map((s, idx) => {
                      const done = idx <= activeIndex;
                      const active = idx === activeIndex;

                      return (
                        <div key={idx} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-4 sm:gap-0">
                          {/* Dot / Icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            done 
                              ? 'bg-secondary border-secondary text-white shadow-soft' 
                              : 'bg-card border-border text-text-secondary'
                          } ${active ? 'ring-4 ring-secondary/20 scale-110' : ''} mb-2`}>
                            {done ? <Check className="w-4 h-4" /> : <span className="font-semibold text-xs">{idx + 1}</span>}
                          </div>

                          {/* Labels */}
                          <div>
                            <h5 className={`font-bold ${done ? 'text-text-primary' : 'text-text-secondary'}`}>{s.label}</h5>
                            <p className="text-[10px] text-text-secondary mt-0.5 max-w-[120px] hidden sm:block mx-auto leading-normal">
                              {s.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Courier info card details */}
              {order.tracking_number && (
                <div className="p-4 bg-background border border-border rounded-modal grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-[9px] text-text-secondary uppercase">Courier Partner</p>
                      <p className="text-text-primary font-bold">{order.courier_name || 'Delivery Fast'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-[9px] text-text-secondary uppercase">Tracking ID</p>
                      <p className="text-text-primary font-bold">{order.tracking_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-[9px] text-text-secondary uppercase">Shipping Route</p>
                      <p className="text-text-primary font-bold">Standard PD Ground</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address & Items snapshot summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/60">
                <div className="text-xs space-y-2">
                  <h5 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Recipient Details</h5>
                  <p className="font-bold">{order.address_snapshot.full_name}</p>
                  <p className="text-text-secondary leading-relaxed">
                    {order.address_snapshot.house_no}, {order.address_snapshot.street}, {order.address_snapshot.city}, {order.address_snapshot.state} - {order.address_snapshot.pincode}
                  </p>
                  <p className="text-text-secondary">📞 Contact: {order.address_snapshot.phone_number}</p>
                </div>

                <div className="text-xs space-y-2">
                  <h5 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Package Items</h5>
                  <div className="space-y-2.5">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-background p-2 rounded border border-border/40">
                        <span className="font-medium truncate max-w-[200px]">{item.product_name}</span>
                        <span className="text-text-secondary text-[10px] font-bold">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
