'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { db, Address, Order, OrderItem } from '@/lib/db';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ShieldCheck, ArrowRight, ArrowLeft, Check, AlertCircle, Sparkles, CreditCard, Landmark, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, gstAmount, shippingCharges, couponCode, couponDiscount, grandTotal, clearCart } = useCart();

  // Checkout Steps: 1 = Address, 2 = Shipping Speed, 3 = Payment Method & Place Order
  const [step, setStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // New Address Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Other'>('Home');

  // Shipping Speed Option
  const [shippingOption, setShippingOption] = useState<'standard' | 'express'>('standard');
  const activeShippingCharge = shippingOption === 'express' ? shippingCharges + 99 : shippingCharges;

  // Payment Option
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('Razorpay');

  // Processing indicators
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState<'upi' | 'card' | 'wallet'>('upi');

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
    // Load profile saved addresses
    db.getAddresses().then((addrs) => {
      setSavedAddresses(addrs);
      const def = addrs.find(a => a.is_default);
      if (def) {
        setSelectedAddressId(def.id);
        fillAddressForm(def);
      }
    });
  }, [cartItems, router]);

  const fillAddressForm = (addr: Address) => {
    setFullName(addr.full_name);
    setPhone(addr.phone_number);
    setEmail(addr.email || '');
    setHouseNo(addr.house_no);
    setStreet(addr.street);
    setArea(addr.area || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setAddressType(addr.address_type);
  };

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
    const addr = savedAddresses.find(a => a.id === id);
    if (addr) fillAddressForm(addr);
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate shipping address
      if (!fullName || !phone || !houseNo || !street || !city || !state || !pincode) {
        alert('Please fill out all required address fields.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(Math.max(1, step - 1));
  };

  const handleCheckoutSubmit = async () => {
    setIsProcessing(true);

    const activeAddress: Address = {
      id: selectedAddressId || 'addr_' + Math.random().toString(36).substr(2, 9),
      full_name: fullName,
      phone_number: phone,
      email: email || undefined,
      house_no: houseNo,
      street: street,
      area: area || undefined,
      landmark: landmark || undefined,
      city: city,
      state: state,
      pincode: pincode,
      country: 'India',
      address_type: addressType,
      is_default: false
    };

    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: 'oi_' + Math.random().toString(36).substr(2, 9),
      order_id: '', // set during order creation
      product_id: item.product.id,
      product_name: item.product.product_name,
      sku: item.product.sku,
      price: item.product.sale_price || item.product.price,
      quantity: item.quantity,
      compatibility_snapshot: item.selectedModel,
      image: item.product.images[0]
    }));

    const finalTotal = subtotal + activeShippingCharge - couponDiscount;

    if (paymentMethod === 'COD') {
      // Create order immediately
      const newOrder = await db.createOrder({
        guest_email: email || undefined,
        guest_phone: phone,
        address_snapshot: activeAddress,
        subtotal,
        gst_amount: gstAmount,
        shipping_charges: activeShippingCharge,
        discount_amount: couponDiscount,
        coupon_code: couponCode || undefined,
        grand_total: finalTotal,
        payment_method: 'COD',
        items: orderItems
      });

      clearCart();
      setIsProcessing(false);
      router.push(`/checkout/success?order=${newOrder.order_number}`);
    } else {
      // Trigger Razorpay payment gateway simulation modal
      setIsProcessing(false);
      setShowRazorpayModal(true);
    }
  };

  const handleSimulateRazorpaySuccess = async () => {
    setIsProcessing(true);
    setShowRazorpayModal(false);

    const activeAddress: Address = {
      id: selectedAddressId || 'addr_def',
      full_name: fullName,
      phone_number: phone,
      email: email || undefined,
      house_no: houseNo,
      street: street,
      area: area || undefined,
      landmark: landmark || undefined,
      city: city,
      state: state,
      pincode: pincode,
      country: 'India',
      address_type: addressType,
      is_default: false
    };

    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: 'oi_' + Math.random().toString(36).substr(2, 9),
      order_id: '',
      product_id: item.product.id,
      product_name: item.product.product_name,
      sku: item.product.sku,
      price: item.product.sale_price || item.product.price,
      quantity: item.quantity,
      compatibility_snapshot: item.selectedModel,
      image: item.product.images[0]
    }));

    const finalTotal = subtotal + activeShippingCharge - couponDiscount;

    const newOrder = await db.createOrder({
      guest_email: email || undefined,
      guest_phone: phone,
      address_snapshot: activeAddress,
      subtotal,
      gst_amount: gstAmount,
      shipping_charges: activeShippingCharge,
      discount_amount: couponDiscount,
      coupon_code: couponCode || undefined,
      grand_total: finalTotal,
      payment_method: `Razorpay (${razorpayMethod.toUpperCase()})`,
      items: orderItems
    });

    // Save newly created address to profile list automatically
    if (!selectedAddressId) {
      await db.saveAddress(activeAddress);
    }

    clearCart();
    setIsProcessing(false);
    router.push(`/checkout/success?order=${newOrder.order_number}`);
  };

  const finalTotal = subtotal + activeShippingCharge - couponDiscount;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-10">
        
        {/* Checkout Steps bar */}
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs font-semibold text-text-secondary uppercase tracking-widest mb-10 border-b border-border/40 pb-4">
          <span className={step === 1 ? 'text-secondary font-bold' : ''}>1. Address</span>
          <span className="w-10 h-px bg-border" />
          <span className={step === 2 ? 'text-secondary font-bold' : ''}>2. Delivery</span>
          <span className="w-10 h-px bg-border" />
          <span className={step === 3 ? 'text-secondary font-bold' : ''}>3. Payment</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Checkout Form steps */}
          <div className="lg:col-span-8 bg-card border border-border rounded-modal p-6 md:p-8 space-y-6">
            
            {/* STEP 1: Address Book & Form */}
            {step === 1 && (
              <div className="space-y-6 text-left">
                <h3 className="font-bold text-lg text-text-primary">Shipping Address</h3>

                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-text-secondary uppercase">Select from Saved Addresses</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr.id)}
                          className={`p-4 border rounded-modal cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-secondary bg-secondary/5'
                              : 'border-border hover:border-text-primary'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h5 className="font-bold text-xs">{addr.full_name}</h5>
                            <span className="text-[10px] font-bold text-text-secondary bg-background px-1.5 py-0.5 rounded border border-border">
                              {addr.address_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">
                            {addr.house_no}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-1">📞 {addr.phone_number}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form fields */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-text-secondary uppercase border-t border-border pt-4">
                    {selectedAddressId ? 'Edit Address Details' : 'Enter New Shipping Address'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary">Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary">Phone Number *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Email Address (for invoices) *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary">Flat / House No *</label>
                      <input
                        type="text"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        placeholder="B-12, Sector 15"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary">Street / Locality *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        placeholder="Near Market Road"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        placeholder="Noida"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary">State *</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        placeholder="Uttar Pradesh"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary">Pincode *</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        placeholder="201301"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">Address Type</label>
                    <div className="flex gap-2">
                      {['Home', 'Office', 'Other'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddressType(type as any)}
                          className={`px-4 py-2 border rounded-button text-xs font-semibold ${
                            addressType === type 
                              ? 'bg-secondary text-white border-secondary' 
                              : 'bg-background hover:bg-border/30'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 transition-all flex items-center gap-1.5"
                  >
                    <span>Delivery Options</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Delivery Speed Options */}
            {step === 2 && (
              <div className="space-y-6 text-left">
                <h3 className="font-bold text-lg text-text-primary">Select Delivery Method</h3>

                <div className="space-y-4">
                  {/* Standard */}
                  <div
                    onClick={() => setShippingOption('standard')}
                    className={`p-4 border rounded-modal cursor-pointer transition-all flex items-center justify-between ${
                      shippingOption === 'standard' ? 'border-secondary bg-secondary/5' : 'border-border hover:border-text-primary'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs">Standard Shipping</h4>
                      <p className="text-[11px] text-text-secondary mt-1">Delivered within 3 to 5 business days.</p>
                    </div>
                    <span className="text-xs font-bold text-accent">
                      {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}
                    </span>
                  </div>

                  {/* Express */}
                  <div
                    onClick={() => setShippingOption('express')}
                    className={`p-4 border rounded-modal cursor-pointer transition-all flex items-center justify-between ${
                      shippingOption === 'express' ? 'border-secondary bg-secondary/5' : 'border-border hover:border-text-primary'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs">Express Delivery</h4>
                      <p className="text-[11px] text-text-secondary mt-1">Delivered within 1 to 2 business days. Express dispatch.</p>
                    </div>
                    <span className="text-xs font-bold text-text-primary">
                      ₹{shippingCharges + 99}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-border rounded-button text-xs font-bold text-text-secondary hover:bg-background transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 transition-all flex items-center gap-1.5"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method & Place Order */}
            {step === 3 && (
              <div className="space-y-6 text-left">
                <h3 className="font-bold text-lg text-text-primary">Payment Information</h3>

                <div className="space-y-4">
                  {/* Razorpay gateway options */}
                  <div
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`p-4 border rounded-modal cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'Razorpay' ? 'border-secondary bg-secondary/5' : 'border-border hover:border-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 text-secondary rounded">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Online Payments (Razorpay)</h4>
                        <p className="text-[11px] text-text-secondary mt-0.5">Pay securely via Cards, UPI, Netbanking, or Wallets.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">Secure</span>
                  </div>

                  {/* COD option */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 border rounded-modal cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'COD' ? 'border-secondary bg-secondary/5' : 'border-border hover:border-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-text-secondary/10 text-text-secondary rounded">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Cash on Delivery (COD)</h4>
                        <p className="text-[11px] text-text-secondary mt-0.5">Pay in cash or digital scan upon physical package delivery.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary bg-background px-2 py-0.5 rounded border border-border">COD</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-border rounded-button text-xs font-bold text-text-secondary hover:bg-background transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isProcessing}
                    className="px-8 py-3.5 bg-accent text-white font-bold rounded-button text-xs hover:bg-accent/95 shadow-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <span>{paymentMethod === 'COD' ? 'Place Order (COD)' : 'Proceed to Pay'}</span>
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Price & Items review panel */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-card border border-border rounded-modal p-6 shadow-soft space-y-6 text-left">
              <h4 className="font-bold text-sm text-text-primary pb-2.5 border-b border-border">Order Review</h4>
              
              {/* Items List */}
              <div className="divide-y divide-border/40 max-h-[220px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.selectedModel}`} className="flex gap-3 py-3 first:pt-0">
                    <img src={item.product.images[0]} alt={item.product.product_name} className="w-10 h-10 object-cover rounded border border-border flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-[11px] text-text-primary truncate">{item.product.product_name}</h5>
                      <p className="text-[10px] text-text-secondary mt-0.5">
                        Qty: {item.quantity} {item.selectedModel && `| ${item.selectedModel}`}
                      </p>
                    </div>
                    <span className="font-bold text-xs text-text-primary">
                      ₹{(item.product.sale_price || item.product.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals panel */}
              <div className="space-y-3.5 text-xs pt-4 border-t border-border">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
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
                  <span>Delivery Charges</span>
                  <span>
                    {activeShippingCharge === 0 ? (
                      <span className="text-accent font-semibold">FREE</span>
                    ) : (
                      `₹${activeShippingCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-text-primary pt-3.5 border-t border-border">
                  <span>Grand Total</span>
                  <span className="text-base text-secondary">₹{finalTotal}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 4. SIMULATED RAZORPAY MODAL PAYMENT CHECKOUT OVERLAY */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-modal shadow-large w-full max-w-sm overflow-hidden text-left z-50">
            
            {/* Header info */}
            <div className="p-5 bg-primary text-white flex justify-between items-center">
              <div>
                <h4 className="font-playfair text-sm font-bold tracking-tight">A-One Mobile Store</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Order Total: ₹{finalTotal}</p>
              </div>
              <button onClick={() => setShowRazorpayModal(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            {/* Simulated options */}
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Select Razorpay Payment Mode</p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setRazorpayMethod('upi')}
                    className={`w-full p-3 border rounded-button text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      razorpayMethod === 'upi' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border text-text-primary'
                    }`}
                  >
                    <span className="text-sm">📱</span>
                    <div>
                      <p className="font-bold">UPI / Google Pay / PhonePe</p>
                      <p className="text-[9px] text-text-secondary mt-0.5">Pay using active UPI Apps</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setRazorpayMethod('card')}
                    className={`w-full p-3 border rounded-button text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      razorpayMethod === 'card' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border text-text-primary'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <div>
                      <p className="font-bold">Credit / Debit Card</p>
                      <p className="text-[9px] text-text-secondary mt-0.5">Visa, Mastercard, RuPay, Amex</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setRazorpayMethod('wallet')}
                    className={`w-full p-3 border rounded-button text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      razorpayMethod === 'wallet' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border text-text-primary'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <div>
                      <p className="font-bold">Net Banking / Digital Wallet</p>
                      <p className="text-[9px] text-text-secondary mt-0.5">Pay via Net Banking or Wallets</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSimulateRazorpaySuccess}
                className="w-full py-3.5 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4.5 h-4.5 text-warning fill-current" />
                <span>Simulate Payment Success</span>
              </button>

              <div className="text-[9px] text-center text-text-secondary flex justify-center items-center gap-1.5">
                <span>🔒 Razorpay Secured PCI-DSS Compliant Gateway</span>
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
