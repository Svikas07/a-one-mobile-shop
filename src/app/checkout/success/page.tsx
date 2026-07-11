'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, Order } from '@/lib/db';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CheckCircle2, FileText, ArrowRight, Printer, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('order') || '';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      db.getOrderDetails(orderNumber).then((o) => {
        if (o) setOrder(o);
      });
    }
  }, [orderNumber]);

  if (!orderNumber) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="text-danger flex justify-center"><AlertTriangle className="w-12 h-12" /></div>
        <h2 className="text-xl font-bold">Invalid Order Reference</h2>
        <Link href="/" className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-button">Go Home</Link>
      </div>
    );
  }

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-16">
        
        {/* Success Card */}
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-modal p-8 md:p-10 shadow-medium text-center space-y-6">
          <div className="flex justify-center text-accent">
            <CheckCircle2 className="w-20 h-20 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Order Confirmed!</h1>
            <p className="text-sm text-text-secondary mt-2">
              Thank you for shopping at A-One Mobile Store. Your order has been placed successfully.
            </p>
          </div>

          <div className="p-4 bg-background border border-border rounded-modal divide-y divide-border/60 text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-text-secondary">Order Number</span>
              <span className="font-bold text-text-primary">{order?.order_number || orderNumber}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-text-secondary">Payment Method</span>
              <span className="font-bold text-text-primary">{order?.payment_method || 'Razorpay Online'}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-text-secondary">Delivery Address</span>
              <span className="font-bold text-text-primary text-right max-w-[200px] truncate">
                {order?.address_snapshot.full_name}, {order?.address_snapshot.city}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-text-secondary">Estimated Delivery Date</span>
              <span className="font-bold text-accent">
                {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-6 py-3.5 bg-card border border-border hover:border-text-primary text-text-primary font-bold rounded-button text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-text-secondary" />
              <span>Download Tax Invoice</span>
            </button>

            <Link
              href={`/track?order=${order?.order_number || orderNumber}&contact=${encodeURIComponent(order?.address_snapshot.phone_number || '')}`}
              className="px-6 py-3.5 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 transition-all flex items-center justify-center gap-2"
            >
              <span>Track Delivery Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-[10px] text-text-secondary">
            A confirmation email and SMS containing shipping details will be sent shortly.
          </p>
        </div>

      </main>

      {/* PRINT-OPTIMIZED INVOICE GENERATOR VIEW MODAL */}
      {showInvoiceModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:bg-white print:backdrop-blur-none">
          <div className="relative bg-card border border-border rounded-modal shadow-large w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 p-6 md:p-8 print:p-0 print:border-none print:shadow-none print:w-full print:max-h-full">
            
            {/* Modal Controls (hidden during print) */}
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-border print:hidden">
              <span className="font-bold text-sm">Tax Invoice Preview</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-button flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border border-border hover:bg-background text-xs font-bold rounded-button"
                >
                  Close
                </button>
              </div>
            </div>

            {/* INVOICE BILLING WRAPPER (Print-optimized structure) */}
            <div className="space-y-6 text-left text-xs text-text-primary print:text-black">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold font-playfair tracking-tight">A-One Mobile Store</h2>
                  <p className="text-[10px] text-text-secondary print:text-gray-500 mt-1">Premium Mobile Accessories Shop</p>
                  <p className="text-[10px] text-text-secondary print:text-gray-500">GSTIN: 09AONE1234F1Z9</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-text-secondary print:text-gray-600">Tax Invoice</h3>
                  <p className="mt-1"><span className="font-semibold">Invoice No:</span> {order.order_number}</p>
                  <p><span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Addresses details */}
              <div className="grid grid-cols-2 gap-8 border-t border-border pt-4 print:border-gray-300">
                <div>
                  <h5 className="font-bold text-[10px] uppercase text-text-secondary print:text-gray-500 mb-2">Sold By</h5>
                  <p className="font-bold">A-One Mobile Store Retailer</p>
                  <p className="text-text-secondary print:text-gray-600 mt-1 leading-relaxed">
                    Shop 12, Ground Floor, Aggarwal Plaza<br />
                    Sector 12, Noida, Uttar Pradesh, 201301<br />
                    Contact: +91 98765 43210
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-[10px] uppercase text-text-secondary print:text-gray-500 mb-2">Billing & Shipping To</h5>
                  <p className="font-bold">{order.address_snapshot.full_name}</p>
                  <p className="text-text-secondary print:text-gray-600 mt-1 leading-relaxed">
                    {order.address_snapshot.house_no}, {order.address_snapshot.street}<br />
                    {order.address_snapshot.area && `${order.address_snapshot.area}, `}{order.address_snapshot.city}<br />
                    {order.address_snapshot.state} - {order.address_snapshot.pincode}<br />
                    Phone: {order.address_snapshot.phone_number}
                  </p>
                </div>
              </div>

              {/* Table details */}
              <div className="border border-border rounded-image overflow-hidden print:border-gray-300">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-background print:bg-gray-100 border-b border-border print:border-gray-300">
                      <th className="p-3 font-bold w-12">No.</th>
                      <th className="p-3 font-bold">Accessory Item / Details</th>
                      <th className="p-3 font-bold text-center w-20">Price</th>
                      <th className="p-3 font-bold text-center w-16">Qty</th>
                      <th className="p-3 font-bold text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-border last:border-b-0 print:border-gray-200">
                        <td className="p-3 text-text-secondary print:text-gray-600">{idx + 1}</td>
                        <td className="p-3">
                          <p className="font-bold">{item.product_name}</p>
                          <p className="text-[9px] text-text-secondary print:text-gray-500 mt-0.5">
                            SKU: {item.sku} {item.compatibility_snapshot && `| Model: ${item.compatibility_snapshot}`}
                          </p>
                        </td>
                        <td className="p-3 text-center">₹{item.price}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right font-bold">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice calculation values */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2.5 text-[11px] border-t border-border pt-3 print:border-gray-350">
                  <div className="flex justify-between text-text-secondary print:text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-accent font-semibold print:text-green-600">
                      <span>Discount ({order.coupon_code})</span>
                      <span>- ₹{order.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary print:text-gray-500">
                    <span>GST (18% Incl.)</span>
                    <span>₹{order.gst_amount}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary print:text-gray-500">
                    <span>Shipping Charges</span>
                    <span>{order.shipping_charges === 0 ? 'FREE' : `₹${order.shipping_charges}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-border print:border-gray-300">
                    <span>Grand Total</span>
                    <span>₹{order.grand_total}</span>
                  </div>
                </div>
              </div>

              {/* Invoice footer message */}
              <div className="pt-8 border-t border-border/60 text-center text-[10px] text-text-secondary print:border-gray-200 print:text-gray-500">
                <p>This is a computer-generated tax invoice and requires no signature.</p>
                <p className="mt-1">For warranty queries, please email support@aonemobile.com with invoice number.</p>
              </div>

            </div>

          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
