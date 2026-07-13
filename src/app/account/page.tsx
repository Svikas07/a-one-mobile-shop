'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { db, Order, Product, Address } from '@/lib/db';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { 
  User, Package, Heart, MapPin, LogOut, Check, ShieldAlert, Edit, 
  Trash, Plus, Mail, Lock, Phone, UserCheck, Shield, ShoppingCart, 
  FileText, Calendar, Info, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AccountContent() {
  const { user, loading, login, register, logout, updateProfile } = useAuth();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Tab Parameter or Default
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state tab parameter with URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  // General auth views (login/register toggle)
  const [isRegisterForm, setIsRegisterForm] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Edit Profile States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormInput, setAddressFormInput] = useState<Partial<Address>>({
    full_name: '',
    phone_number: '',
    house_no: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'Home',
    is_default: false,
    country: 'India'
  });

  // Orders and Wishlist States
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch Dashboard data once user is logged in
  useEffect(() => {
    if (user) {
      setEditName(user.full_name || '');
      setEditPhone(user.phone || '');
      
      // Load user specifics
      db.getAddresses().then(setAddresses);
      db.getWishlistItems().then(setWishlist);
      
      // Load orders (for demo, we filter orders matching user email or standard logged user)
      db.getOrders().then(allOrders => {
        const userOrders = allOrders.filter(o => 
          o.user_id === user.id || 
          o.guest_email?.toLowerCase() === user.email.toLowerCase() ||
          o.address_snapshot.email?.toLowerCase() === user.email.toLowerCase()
        );
        setOrders(userOrders);
      });
    }
  }, [user]);

  // Auth submits
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    if (isRegisterForm) {
      if (!authName || !authPhone) {
        setAuthError('Please fill in your name and phone number.');
        setAuthLoading(false);
        return;
      }
      const res = await register(authEmail, authPassword, authName, authPhone);
      if (res.success) {
        setAuthSuccess(res.message);
        // Clear fields
        setAuthName('');
        setAuthPhone('');
        setAuthEmail('');
        setAuthPassword('');
      } else {
        setAuthError(res.message);
      }
    } else {
      const res = await login(authEmail, authPassword);
      if (res.success) {
        setAuthSuccess(res.message);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        setAuthError(res.message);
      }
    }
    setAuthLoading(false);
  };

  // Update Profile details submit
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    const res = await updateProfile({ full_name: editName, phone: editPhone });
    if (res.success) {
      setProfileMsg({ type: 'success', text: res.message });
    } else {
      setProfileMsg({ type: 'error', text: res.message });
    }
  };

  // Address book controls
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = {
      ...addressFormInput,
      user_id: user?.id
    } as Omit<Address, 'id'> & { id?: string };

    const saved = await db.saveAddress(cleanAddress);
    
    // Refresh address list
    const updatedList = await db.getAddresses();
    setAddresses(updatedList);
    
    setShowAddressForm(false);
    // Reset form
    setAddressFormInput({
      full_name: '',
      phone_number: '',
      house_no: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      address_type: 'Home',
      is_default: false,
      country: 'India'
    });
  };

  const handleEditAddress = (addr: Address) => {
    setAddressFormInput(addr);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    await db.deleteAddress(id);
    const updatedList = await db.getAddresses();
    setAddresses(updatedList);
  };

  // Wishlist actions
  const handleMoveToCart = async (p: Product) => {
    addToCart(p, 1);
    // Toggle/remove from wishlist
    await db.toggleWishlist(p.id);
    const updatedList = await db.getWishlistItems();
    setWishlist(updatedList);
  };

  const handleRemoveWishlist = async (p: Product) => {
    await db.toggleWishlist(p.id);
    const updatedList = await db.getWishlistItems();
    setWishlist(updatedList);
  };

  // Check state loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-12">
        
        {/* UNAUTHENTICATED STATE: LOGIN / REGISTER */}
        {!user ? (
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-modal p-8 shadow-large text-left space-y-6">
              
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                  {isRegisterForm ? 'Join Us' : 'Welcome Back'}
                </span>
                <h1 className="text-2xl font-bold font-display text-text-primary">
                  {isRegisterForm ? 'Create A-One Account' : 'Sign In To Account'}
                </h1>
                <p className="text-xs text-text-secondary">
                  Access your order history, premium wishlist, and addresses instantly.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-danger/5 border border-danger/25 text-danger rounded-modal text-xs font-semibold">
                  ⚠️ {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-accent/5 border border-accent/25 text-accent rounded-modal text-xs font-semibold">
                  ✅ {authSuccess}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {isRegisterForm && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full p-3 pl-10 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full p-3 pl-10 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full p-3 pl-10 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full p-3 pl-10 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-primary text-white font-bold rounded-button text-xs hover:bg-primary/95 transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{isRegisterForm ? 'Register Account' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Mode notice */}
              <div className="p-3 bg-background border border-border rounded-modal text-[10px] text-text-secondary leading-relaxed">
                💡 **Demo Mode Hint:** Use credentials:<br />
                • Admin: `admin@aonemobile.com` | Password: `admin123`<br />
                • Customer: `vikas@aonemobile.com` | Password: `vikas123`
              </div>

              <div className="text-center pt-2 border-t border-border">
                <button
                  onClick={() => {
                    setIsRegisterForm(!isRegisterForm);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-xs font-bold text-secondary hover:underline cursor-pointer"
                >
                  {isRegisterForm ? 'Already have an account? Sign In' : 'New to A-One? Register here'}
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* AUTHENTICATED STATE: CUSTOMER DASHBOARD */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left items-start">
            
            {/* Sidebar Navigation */}
            <div className="bg-card border border-border rounded-modal p-6 space-y-6">
              
              {/* User Bio snapshot */}
              <div className="flex items-center gap-3 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center font-bold text-secondary text-lg">
                  {user.full_name ? user.full_name[0] : 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-text-primary truncate">{user.full_name || 'Customer'}</h3>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{user.email}</p>
                  <span className="inline-block bg-accent/10 text-accent text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setActiveTab('profile'); router.replace('/account?tab=profile'); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-secondary text-white shadow-soft' 
                      : 'hover:bg-background text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); router.replace('/account?tab=orders'); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'orders' 
                      ? 'bg-secondary text-white shadow-soft' 
                      : 'hover:bg-background text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4" />
                    <span>Order History</span>
                  </div>
                  {orders.length > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-border/60 text-text-primary'
                    }`}>
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('wishlist'); router.replace('/account?tab=wishlist'); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'wishlist' 
                      ? 'bg-secondary text-white shadow-soft' 
                      : 'hover:bg-background text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlist.length > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-border/60 text-text-primary'
                    }`}>
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('addresses'); router.replace('/account?tab=addresses'); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'addresses' 
                      ? 'bg-secondary text-white shadow-soft' 
                      : 'hover:bg-background text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Addresses</span>
                </button>

                {user.role === 'Admin' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-3 px-4 py-3 rounded-button text-xs font-bold text-accent hover:bg-accent/5 transition-all cursor-pointer mt-4 border border-dashed border-accent/30"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Control Panel</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 rounded-button text-xs font-semibold text-danger hover:bg-danger/5 transition-all cursor-pointer mt-4 border border-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </nav>

            </div>

            {/* Dashboard Workspace */}
            <div className="md:col-span-3">
              
              {/* Profile Details Tab */}
              {activeTab === 'profile' && (
                <div className="bg-card border border-border rounded-modal p-6 md:p-8 space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold font-display text-text-primary">Profile Details</h2>
                    <p className="text-xs text-text-secondary mt-1">Keep your contact and communication data updated.</p>
                  </div>

                  {profileMsg.text && (
                    <div className={`p-3 border rounded-modal text-xs font-semibold ${
                      profileMsg.type === 'success' ? 'bg-accent/5 border-accent/25 text-accent' : 'bg-danger/5 border-danger/25 text-danger'
                    }`}>
                      {profileMsg.type === 'success' ? '✅' : '⚠️'} {profileMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-3 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Email Address (Read Only)</label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full p-3 border border-border rounded-input text-xs bg-background/50 text-text-secondary focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-3 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-3 px-6 bg-primary text-white font-bold rounded-button text-xs hover:bg-primary/95 shadow transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === 'orders' && (
                <div className="bg-card border border-border rounded-modal p-6 md:p-8 space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold font-display text-text-primary">Order Logs</h2>
                    <p className="text-xs text-text-secondary mt-1">Review tracking status and details for past purchases.</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center mx-auto text-text-secondary">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-text-secondary">You haven't placed any orders yet.</p>
                      <button
                        onClick={() => router.push('/shop')}
                        className="text-xs font-bold text-secondary hover:underline cursor-pointer"
                      >
                        Browse Mobile Accessories →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((o) => (
                        <div key={o.id} className="border border-border rounded-modal p-4 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-3 gap-2">
                            <div>
                              <p className="text-xs font-bold text-text-primary">Order ID: #{o.order_number}</p>
                              <p className="text-[10px] text-text-secondary mt-0.5">Placed: {new Date(o.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                o.order_status === 'Delivered' 
                                  ? 'bg-accent/10 text-accent' 
                                  : o.order_status === 'Cancelled'
                                  ? 'bg-danger/10 text-danger'
                                  : 'bg-secondary/10 text-secondary'
                              }`}>
                                {o.order_status}
                              </span>
                              
                              <button
                                onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}
                                className="text-xs font-bold text-secondary hover:underline cursor-pointer ml-2"
                              >
                                {selectedOrder?.id === o.id ? 'Hide Details' : 'View Details'}
                              </button>
                            </div>
                          </div>

                          {/* Quick info summary */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-secondary">{o.items.length} accessory items</span>
                            <span className="font-bold text-text-primary">₹{o.grand_total.toLocaleString()}</span>
                          </div>

                          {/* Expansion Panel Details */}
                          {selectedOrder?.id === o.id && (
                            <div className="pt-4 border-t border-border/45 space-y-4 animate-fade-in">
                              
                              {/* Items list */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-text-secondary uppercase">Accessory Items</p>
                                {o.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-background border border-border/30 rounded">
                                    <span className="font-semibold">{item.product_name} (Qty: {item.quantity})</span>
                                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Delivery Status and Carrier info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1 bg-background p-3 rounded border border-border/40">
                                  <p className="text-[10px] text-text-secondary uppercase font-bold">Delivery Address</p>
                                  <p className="font-bold">{o.address_snapshot.full_name}</p>
                                  <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                                    {o.address_snapshot.house_no}, {o.address_snapshot.street}, {o.address_snapshot.city}, {o.address_snapshot.state} - {o.address_snapshot.pincode}
                                  </p>
                                </div>

                                <div className="space-y-2 bg-background p-3 rounded border border-border/40 justify-between flex flex-col">
                                  <div>
                                    <p className="text-[10px] text-text-secondary uppercase font-bold">Courier & Delivery Status</p>
                                    <p className="font-bold text-text-primary mt-1">Status: {o.order_status}</p>
                                    {o.tracking_number && (
                                      <p className="text-[11px] text-text-secondary mt-0.5">
                                        Carrier: {o.courier_name || 'Delivery Standard'} (ID: {o.tracking_number})
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-2 pt-2 border-t border-border/30">
                                    {/* Track order trigger */}
                                    <button
                                      onClick={() => router.push(`/track?order=${o.order_number}&contact=${o.address_snapshot.phone_number}`)}
                                      className="py-1 px-3 bg-secondary text-white font-bold rounded text-[10px] cursor-pointer hover:bg-secondary/95 transition-all"
                                    >
                                      Real-Time Tracking
                                    </button>

                                    {/* Print Invoice */}
                                    <button
                                      onClick={() => {
                                        if (typeof window !== 'undefined') {
                                          window.open(`/checkout/success?order=${o.order_number}&print=true`, '_blank');
                                        }
                                      }}
                                      className="py-1 px-3 border border-border hover:bg-border/30 text-text-primary font-bold rounded text-[10px] cursor-pointer transition-all flex items-center gap-1"
                                    >
                                      <Printer className="w-3 h-3" />
                                      <span>Print Invoice</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="bg-card border border-border rounded-modal p-6 md:p-8 space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold font-display text-text-primary">Premium Wishlist</h2>
                    <p className="text-xs text-text-secondary mt-1">Keep track of your favorite high-quality accessories.</p>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center mx-auto text-text-secondary">
                        <Heart className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-xs font-semibold text-text-secondary">Your wishlist is currently empty.</p>
                      <button
                        onClick={() => router.push('/shop')}
                        className="text-xs font-bold text-secondary hover:underline cursor-pointer"
                      >
                        Shop Mobile Accessories →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="border border-border rounded-modal p-3 flex gap-3 items-center text-xs">
                          <img
                            src={item.images[0]}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-image border border-border flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="font-bold text-text-primary truncate">{item.product_name}</h4>
                            <p className="font-bold text-secondary">₹{item.sale_price || item.price}</p>
                            
                            <div className="flex gap-2 pt-1.5">
                              <button
                                onClick={() => handleMoveToCart(item)}
                                className="flex items-center gap-1 font-bold text-accent hover:underline cursor-pointer"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Move to Cart</span>
                              </button>
                              <button
                                onClick={() => handleRemoveWishlist(item)}
                                className="font-semibold text-danger hover:underline cursor-pointer ml-1"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-card border border-border rounded-modal p-6 md:p-8 space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold font-display text-text-primary">Saved Addresses</h2>
                      <p className="text-xs text-text-secondary mt-1">Manage delivery locations for quick checkouts.</p>
                    </div>
                    
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="py-2 px-3 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 transition-all shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New</span>
                      </button>
                    )}
                  </div>

                  {/* Address CRUD Form */}
                  {showAddressForm && (
                    <div className="p-4 border border-border rounded-modal bg-background space-y-4">
                      <h4 className="text-xs font-bold uppercase text-text-secondary border-b border-border pb-2">
                        {addressFormInput.id ? 'Edit Address' : 'New Address Details'}
                      </h4>

                      <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Full Name</label>
                          <input
                            type="text"
                            required
                            value={addressFormInput.full_name || ''}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, full_name: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={addressFormInput.phone_number || ''}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, phone_number: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Flat / House / Shop No.</label>
                          <input
                            type="text"
                            required
                            value={addressFormInput.house_no || ''}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, house_no: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Street Area / Sector</label>
                          <input
                            type="text"
                            required
                            value={addressFormInput.street || ''}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, street: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">City</label>
                          <input
                            type="text"
                            required
                            value={addressFormInput.city || ''}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">State</label>
                          <input
                            type="text"
                            required
                            value={addressFormInput.state || ''}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Pincode</label>
                          <input
                            type="text"
                            required
                            value={addressFormInput.pincode || ''}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, pincode: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Address Tag Type</label>
                          <select
                            value={addressFormInput.address_type || 'Home'}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, address_type: e.target.value as any }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                          >
                            <option value="Home">🏠 Home</option>
                            <option value="Office">🏢 Office</option>
                            <option value="Other">📍 Other</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-2 pt-2 text-xs">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={addressFormInput.is_default || false}
                            onChange={(e) => setAddressFormInput(prev => ({ ...prev, is_default: e.target.checked }))}
                            className="accent-secondary"
                          />
                          <label htmlFor="is_default" className="font-semibold text-text-secondary cursor-pointer">
                            Set as default shipping location
                          </label>
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-4 border-t border-border/30">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="py-2 px-4 border border-border rounded text-xs hover:bg-border/20 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="py-2 px-5 bg-secondary text-white font-bold rounded text-xs hover:bg-secondary/95 cursor-pointer"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Address List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-border rounded-modal p-4 space-y-3 relative text-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary">{addr.full_name}</span>
                            <span className="text-[10px] bg-border px-1.5 py-0.5 rounded text-text-secondary uppercase">
                              {addr.address_type}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-bold uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-text-secondary leading-relaxed">
                            {addr.house_no}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-text-secondary">📞 Contact: {addr.phone_number}</p>
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-border/30 justify-end">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="flex items-center gap-1 font-semibold text-secondary hover:underline cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="flex items-center gap-1 font-semibold text-danger hover:underline cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

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

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
