'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db, Order, Product, Coupon, PhoneModel, Category, Brand } from '@/lib/db';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  LayoutDashboard, ShieldAlert, BarChart3, Plus, Edit, Trash, 
  Package, ShoppingCart, Percent, ArrowLeft, RefreshCw, Check, 
  X, CheckSquare, Square, Eye, EyeOff, Save, AlertTriangle, Truck,
  Hash, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AdminContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Admin active sub-view state: 'overview' | 'products' | 'orders' | 'coupons'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');

  // KPI States
  const [kpis, setKpis] = useState<{
    revenue: number;
    ordersCount: number;
    productsCount: number;
    lowStockCount: number;
    pendingCount: number;
    recentOrders: Order[];
    salesChart: { label: string; value: number }[];
  } | null>(null);

  // Lists from DB
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // CRUD Editing Modals / Form states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  
  // Coupon Form States
  const [couponInput, setCouponInput] = useState<Partial<Coupon>>({
    code: '',
    type: 'Percentage',
    value: 10,
    min_order_value: 499,
    max_discount: 150,
    expiry_date: '2026-12-31',
    status: 'Active'
  });

  // Track status updates for order
  const [orderStatusVal, setOrderStatusVal] = useState<Order['order_status']>('Pending');
  const [courierNameVal, setCourierNameVal] = useState('');
  const [trackingNumVal, setTrackingNumVal] = useState('');

  // Fetch admin stats and listings
  const loadAdminData = async () => {
    if (!user || user.role !== 'Admin') return;
    
    const stats = await db.getAdminKPIs();
    setKpis(stats);

    const prods = await db.getProducts();
    setProductsList(prods);

    const ords = await db.getOrders();
    setOrdersList(ords);

    const cpps = await db.getCoupons();
    setCouponsList(cpps);

    const mods = await db.getPhoneModels();
    setPhoneModels(mods);

    const cats = await db.getCategories();
    setCategories(cats);

    const brnds = await db.getBrands();
    setBrands(brnds);
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  // Handle Product CRUD submits
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const prodData = {
      product_name: editingProduct.product_name || 'Unnamed Accessory',
      slug: editingProduct.slug || 'unnamed-accessory',
      category_id: editingProduct.category_id || categories[0]?.id || 'c1',
      brand_id: editingProduct.brand_id || brands[0]?.id || 'b1',
      sku: editingProduct.sku || 'SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      price: editingProduct.price || 499,
      sale_price: editingProduct.sale_price || undefined,
      stock: editingProduct.stock !== undefined ? editingProduct.stock : 10,
      low_stock_limit: editingProduct.low_stock_limit !== undefined ? editingProduct.low_stock_limit : 5,
      status: editingProduct.status || 'Published',
      featured: editingProduct.featured || false,
      best_seller: editingProduct.best_seller || false,
      new_arrival: editingProduct.new_arrival || false,
      trending: editingProduct.trending || false,
      images: editingProduct.images && editingProduct.images.length > 0 
        ? editingProduct.images 
        : ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'],
      compatibility: editingProduct.compatibility || [],
      short_description: editingProduct.short_description || 'Premium smartphone accessory.',
      full_description: editingProduct.full_description || 'High-durability accessories built to protect your phone.'
    };

    if (editingProduct.id) {
      await db.adminUpdateProduct(editingProduct.id, prodData);
    } else {
      await db.adminCreateProduct(prodData);
    }

    setShowProductForm(false);
    setEditingProduct(null);
    loadAdminData();
  };

  const handleCreateProductClick = () => {
    setEditingProduct({
      product_name: '',
      slug: '',
      category_id: categories[0]?.id || 'c1',
      brand_id: brands[0]?.id || 'b1',
      sku: '',
      price: 999,
      stock: 25,
      low_stock_limit: 5,
      status: 'Published',
      compatibility: [],
      images: [],
      featured: false,
      best_seller: false
    });
    setShowProductForm(true);
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setShowProductForm(true);
  };

  const handleDeleteProductClick = async (id: string) => {
    if (confirm('Are you sure you want to delete this product accessory from catalog?')) {
      await db.adminDeleteProduct(id);
      loadAdminData();
    }
  };

  // Compatibility selection toggle helper
  const handleToggleCompatibility = (modelId: string) => {
    if (!editingProduct) return;
    const current = editingProduct.compatibility || [];
    let updated;
    if (current.includes(modelId)) {
      updated = current.filter(id => id !== modelId);
    } else {
      updated = [...current, modelId];
    }
    setEditingProduct(prev => prev ? { ...prev, compatibility: updated } : null);
  };

  // Order update submits
  const handleOrderUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    await db.adminUpdateOrderStatus(editingOrder.id, {
      order_status: orderStatusVal,
      courier_name: courierNameVal || undefined,
      tracking_number: trackingNumVal || undefined
    });

    setShowOrderForm(false);
    setEditingOrder(null);
    loadAdminData();
  };

  const handleEditOrderClick = (order: Order) => {
    setEditingOrder(order);
    setOrderStatusVal(order.order_status);
    setCourierNameVal(order.courier_name || '');
    setTrackingNumVal(order.tracking_number || '');
    setShowOrderForm(true);
  };

  // Coupon create submit
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
      id: 'cp_' + Math.random().toString(36).substr(2, 9),
      code: (couponInput.code || 'COUPON').toUpperCase(),
      type: couponInput.type as any,
      value: couponInput.value || 0,
      min_order_value: couponInput.min_order_value || 0,
      max_discount: couponInput.max_discount || undefined,
      expiry_date: couponInput.expiry_date || '2026-12-31',
      used_count: 0,
      status: couponInput.status || 'Active'
    };

    // Save coupon in local storage logic (Prepend to local list)
    const savedCoupons = JSON.parse(localStorage.getItem('aone_mock_coupons') || '[]');
    savedCoupons.unshift(newCoupon);
    localStorage.setItem('aone_mock_coupons', JSON.stringify(savedCoupons));

    setShowCouponForm(false);
    // Reset coupon
    setCouponInput({
      code: '',
      type: 'Percentage',
      value: 10,
      min_order_value: 499,
      max_discount: 150,
      expiry_date: '2026-12-31',
      status: 'Active'
    });
    loadAdminData();
  };

  // Auth Guards Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    );
  }

  // Access Denied Shield Page
  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full bg-card border border-border rounded-modal p-8 shadow-large text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto text-danger">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Administrative Access Required</h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              This area contains protected sales metrics, user lists, and catalogs. Please sign in using an Admin account or return to safety.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => router.push('/account')}
                className="w-full py-3 bg-primary text-white font-bold rounded-button text-xs hover:bg-primary/95 transition-all shadow cursor-pointer"
              >
                Go to Authentication Portal
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 border border-border rounded-button text-xs hover:bg-border/30 transition-all text-text-primary cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Storefront</span>
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-card border border-border rounded-modal p-5 space-y-6 text-left flex-shrink-0">
          <div className="border-b border-border pb-4">
            <h3 className="font-bold text-sm text-text-primary">Admin Control Center</h3>
            <p className="text-[10px] text-accent font-semibold uppercase tracking-wider mt-1">A-One Mobile Store</p>
          </div>

          <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-secondary text-white shadow'
                  : 'hover:bg-background text-text-secondary hover:text-text-primary'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Panel</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-secondary text-white shadow'
                  : 'hover:bg-background text-text-secondary hover:text-text-primary'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Manage Products</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-secondary text-white shadow'
                  : 'hover:bg-background text-text-secondary hover:text-text-primary'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Manage Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-3 px-4 py-3 rounded-button text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'coupons'
                  ? 'bg-secondary text-white shadow'
                  : 'hover:bg-background text-text-secondary hover:text-text-primary'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Manage Coupons</span>
            </button>
          </nav>
        </aside>

        {/* Admin Workspace Content */}
        <main className="flex-1 w-full text-left space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && kpis && (
            <div className="space-y-8 animate-fade-in">
              {/* KPIs Header */}
              <div>
                <h1 className="text-2xl font-bold font-display text-text-primary">Overview Dashboard</h1>
                <p className="text-xs text-text-secondary mt-1">Real-time indicators and metrics calculations.</p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-card border border-border p-4 rounded-modal shadow-soft text-left space-y-2">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Gross Revenue</span>
                  <h3 className="text-lg md:text-xl font-bold text-text-primary font-display">₹{kpis.revenue.toLocaleString()}</h3>
                </div>

                <div className="bg-card border border-border p-4 rounded-modal shadow-soft text-left space-y-2">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Total Orders</span>
                  <h3 className="text-lg md:text-xl font-bold text-text-primary font-display">{kpis.ordersCount}</h3>
                </div>

                <div className="bg-card border border-border p-4 rounded-modal shadow-soft text-left space-y-2">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Accessory Items</span>
                  <h3 className="text-lg md:text-xl font-bold text-text-primary font-display">{kpis.productsCount}</h3>
                </div>

                <div className="bg-card border border-border p-4 rounded-modal shadow-soft text-left space-y-2 ring-2 ring-danger/10 bg-danger/5">
                  <span className="text-[10px] uppercase font-bold text-danger">Low Stock Items</span>
                  <h3 className="text-lg md:text-xl font-bold text-danger font-display">{kpis.lowStockCount}</h3>
                </div>

                <div className="bg-card border border-border p-4 rounded-modal shadow-soft text-left space-y-2 ring-2 ring-secondary/10 bg-secondary/5">
                  <span className="text-[10px] uppercase font-bold text-secondary">Pending Orders</span>
                  <h3 className="text-lg md:text-xl font-bold text-secondary font-display">{kpis.pendingCount}</h3>
                </div>
              </div>

              {/* Sales Chart visual (SVG vector design) */}
              <div className="bg-card border border-border rounded-modal p-6 shadow-soft space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Sales Trend</h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Showing invoice total amounts of latest sales transactions.</p>
                </div>

                {kpis.salesChart.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-10">No transaction data generated yet.</p>
                ) : (
                  <div className="h-44 w-full flex items-end justify-between gap-4 pt-6 border-b border-border/80 text-[10px] text-text-secondary font-bold">
                    {kpis.salesChart.map((point, index) => {
                      const maxVal = Math.max(...kpis.salesChart.map(p => p.value), 1000);
                      const percentHeight = (point.value / maxVal) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary text-[9px]">
                            ₹{point.value}
                          </span>
                          <div 
                            style={{ height: `${percentHeight}%` }} 
                            className="w-full bg-secondary/80 rounded-t hover:bg-secondary transition-all cursor-pointer min-h-[10px]" 
                          />
                          <span className="truncate w-full text-center mt-1 text-[8px]">{point.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Orders log snapshot */}
              <div className="bg-card border border-border rounded-modal p-6 shadow-soft space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-text-primary">Recent Orders Flow</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-secondary hover:underline cursor-pointer">
                    View All Orders →
                  </button>
                </div>

                <div className="divide-y divide-border/60">
                  {kpis.recentOrders.length === 0 ? (
                    <p className="text-xs text-text-secondary text-center py-6">No order logs registered.</p>
                  ) : (
                    kpis.recentOrders.map(o => (
                      <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-text-primary">Order #{o.order_number}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5">{o.address_snapshot.full_name} | {new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">₹{o.grand_total.toLocaleString()}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            o.order_status === 'Delivered' ? 'bg-accent/15 text-accent' : 'bg-secondary/15 text-secondary'
                          }`}>
                            {o.order_status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold font-display text-text-primary">Accessories Inventory</h1>
                  <p className="text-xs text-text-secondary mt-1">Add, modify and manage phone accessory stocks.</p>
                </div>

                <button
                  onClick={handleCreateProductClick}
                  className="py-2.5 px-4 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Accessory</span>
                </button>
              </div>

              {/* Products Table List */}
              <div className="bg-card border border-border rounded-modal shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-background text-text-secondary border-b border-border uppercase font-bold text-[10px]">
                        <th className="p-4 text-left">Accessory Details</th>
                        <th className="p-4 text-left">SKU & Category</th>
                        <th className="p-4 text-left">Price (Sale)</th>
                        <th className="p-4 text-left">Stock Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {productsList.map((p) => {
                        const lowStock = p.stock <= p.low_stock_limit;
                        return (
                          <tr key={p.id} className="hover:bg-background/40 transition-colors">
                            <td className="p-4 flex items-center gap-3 min-w-[200px]">
                              <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded border border-border" />
                              <div className="min-w-0">
                                <h5 className="font-bold text-text-primary truncate max-w-[180px]">{p.product_name}</h5>
                                <span className={`inline-block text-[8px] font-bold mt-1 px-1.5 py-0.2 bg-border text-text-secondary rounded`}>
                                  Fits {p.compatibility.length} Models
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-text-primary">{p.sku}</p>
                              <p className="text-[10px] text-text-secondary mt-0.5">
                                {categories.find(c => c.id === p.category_id)?.name || 'Cover'}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-text-primary">₹{p.price}</p>
                              {p.sale_price && <p className="text-[10px] text-accent font-semibold mt-0.5">Sale: ₹{p.sale_price}</p>}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 font-bold ${lowStock ? 'text-danger' : 'text-text-primary'}`}>
                                {lowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                                <span>{p.stock} units</span>
                              </span>
                              <p className="text-[10px] text-text-secondary mt-0.5">Min Alert: {p.low_stock_limit}</p>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-1.5 hover:bg-border/30 rounded text-secondary transition-colors cursor-pointer"
                                  title="Edit Accessory"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProductClick(p.id)}
                                  className="p-1.5 hover:bg-border/30 rounded text-danger transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CRUD MODAL SHEET */}
              <AnimatePresence>
                {showProductForm && editingProduct && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      className="bg-card border border-border w-full max-w-3xl rounded-modal p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-6 text-left shadow-large"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div className="flex justify-between items-center border-b border-border pb-4">
                        <h3 className="font-bold text-base text-text-primary font-display">
                          {editingProduct.id ? 'Edit Product Details' : 'Add New Accessory Product'}
                        </h3>
                        <button onClick={() => setShowProductForm(false)} className="p-1 hover:bg-border/30 rounded-full">
                          <X className="w-5 h-5 text-text-secondary" />
                        </button>
                      </div>

                      <form onSubmit={handleProductSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">Product Name</label>
                            <input
                              type="text"
                              required
                              value={editingProduct.product_name || ''}
                              onChange={(e) => setEditingProduct(prev => ({ 
                                ...prev, 
                                product_name: e.target.value,
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                              }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">SKU Code</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. SPG-UH-IP16PM"
                              value={editingProduct.sku || ''}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, sku: e.target.value }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">Category</label>
                            <select
                              value={editingProduct.category_id || ''}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, category_id: e.target.value }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            >
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">Accessory Brand</label>
                            <select
                              value={editingProduct.brand_id || ''}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, brand_id: e.target.value }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            >
                              {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">Price (MRP)</label>
                            <input
                              type="number"
                              required
                              value={editingProduct.price || 0}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">Sale Price (Optional)</label>
                            <input
                              type="number"
                              value={editingProduct.sale_price || ''}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, sale_price: e.target.value ? Number(e.target.value) : undefined }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">Initial Stock Count</label>
                            <input
                              type="number"
                              required
                              value={editingProduct.stock || 0}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="font-semibold text-text-secondary">Low Stock Warning Alert Threshold</label>
                            <input
                              type="number"
                              required
                              value={editingProduct.low_stock_limit || 5}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, low_stock_limit: Number(e.target.value) }))}
                              className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Description Form */}
                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Short Summary Description</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.short_description || ''}
                            onChange={(e) => setEditingProduct(prev => ({ ...prev, short_description: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                          />
                        </div>

                        {/* Image URLs */}
                        <div className="space-y-1.5 text-xs">
                          <label className="font-semibold text-text-secondary">Image URL Link</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={editingProduct.images?.[0] || ''}
                            onChange={(e) => setEditingProduct(prev => ({ ...prev, images: [e.target.value] }))}
                            className="w-full p-2.5 border border-border rounded-input text-xs bg-background focus:outline-none"
                          />
                        </div>

                        {/* PHONE MODEL COMPATIBILITY SELECTION BOX */}
                        <div className="space-y-2 text-xs">
                          <label className="font-bold text-text-secondary uppercase">Phone Model Compatibility Mappings</label>
                          <p className="text-[10px] text-text-secondary pb-1">Check all smartphone models this specific accessory is designed to fit perfectly.</p>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-background border border-border rounded-modal max-h-48 overflow-y-auto">
                            {phoneModels.map(m => {
                              const checked = editingProduct.compatibility?.includes(m.id) || false;
                              return (
                                <button
                                  type="button"
                                  key={m.id}
                                  onClick={() => handleToggleCompatibility(m.id)}
                                  className={`flex items-center gap-2 p-2 rounded border text-left cursor-pointer transition-colors ${
                                    checked 
                                      ? 'bg-secondary/10 border-secondary text-secondary font-bold' 
                                      : 'border-border/60 hover:bg-border/20 text-text-secondary'
                                  }`}
                                >
                                  {checked ? <CheckSquare className="w-4 h-4 flex-shrink-0" /> : <Square className="w-4 h-4 flex-shrink-0" />}
                                  <span className="truncate text-[10px]">{m.model_name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Extra Feature Flags */}
                        <div className="flex flex-wrap gap-4 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-secondary">
                            <input
                              type="checkbox"
                              checked={editingProduct.featured || false}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, featured: e.target.checked }))}
                              className="accent-secondary"
                            />
                            <span>Featured Carousel Home</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-secondary">
                            <input
                              type="checkbox"
                              checked={editingProduct.best_seller || false}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, best_seller: e.target.checked }))}
                              className="accent-secondary"
                            />
                            <span>Best Seller Badge</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-secondary">
                            <input
                              type="checkbox"
                              checked={editingProduct.new_arrival || false}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, new_arrival: e.target.checked }))}
                              className="accent-secondary"
                            />
                            <span>New Arrival Badge</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-secondary">
                            <input
                              type="checkbox"
                              checked={editingProduct.trending || false}
                              onChange={(e) => setEditingProduct(prev => ({ ...prev, trending: e.target.checked }))}
                              className="accent-secondary"
                            />
                            <span>Trending Badge</span>
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                          <button
                            type="button"
                            onClick={() => setShowProductForm(false)}
                            className="py-2.5 px-4 border border-border rounded-button text-xs hover:bg-border/20 cursor-pointer font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="py-2.5 px-5 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 shadow cursor-pointer"
                          >
                            Save Accessory
                          </button>
                        </div>
                      </form>

                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* TAB 3: ORDERS LIST & UPDATES */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold font-display text-text-primary">Orders Pipeline</h1>
                <p className="text-xs text-text-secondary mt-1">Review orders, update progress status, and assign carrier tracking numbers.</p>
              </div>

              {/* Orders Table List */}
              <div className="bg-card border border-border rounded-modal shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-background text-text-secondary border-b border-border uppercase font-bold text-[10px]">
                        <th className="p-4 text-left">Order & Date</th>
                        <th className="p-4 text-left">Customer Details</th>
                        <th className="p-4 text-left">Total Value</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">Tracking Partner</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {ordersList.map((o) => (
                        <tr key={o.id} className="hover:bg-background/40 transition-colors">
                          <td className="p-4 font-bold text-text-primary">
                            <p>#{o.order_number}</p>
                            <p className="text-[10px] text-text-secondary font-semibold mt-0.5">
                              {new Date(o.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-text-primary">{o.address_snapshot.full_name}</p>
                            <p className="text-[10px] text-text-secondary mt-0.5">{o.address_snapshot.phone_number}</p>
                          </td>
                          <td className="p-4 font-bold text-text-primary">
                            ₹{o.grand_total.toLocaleString()}
                            <p className="text-[9px] text-text-secondary font-semibold uppercase mt-0.5">
                              {o.payment_method}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              o.order_status === 'Delivered' 
                                ? 'bg-accent/15 text-accent' 
                                : o.order_status === 'Cancelled'
                                ? 'bg-danger/15 text-danger'
                                : 'bg-secondary/15 text-secondary'
                            }`}>
                              {o.order_status}
                            </span>
                            <p className="text-[9px] text-text-secondary mt-1">Pay: {o.payment_status}</p>
                          </td>
                          <td className="p-4">
                            {o.tracking_number ? (
                              <div>
                                <p className="font-semibold text-text-primary">{o.courier_name || 'Standard'}</p>
                                <p className="text-[10px] text-text-secondary mt-0.5">{o.tracking_number}</p>
                              </div>
                            ) : (
                              <span className="text-text-secondary font-medium italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleEditOrderClick(o)}
                              className="py-1 px-2.5 bg-background border border-border hover:bg-border/30 rounded text-xs font-bold text-secondary cursor-pointer transition-colors"
                            >
                              Edit Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ORDER STATUS MODAL */}
              <AnimatePresence>
                {showOrderForm && editingOrder && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      className="bg-card border border-border w-full max-w-md rounded-modal p-6 text-left space-y-6 shadow-large"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div className="flex justify-between items-center border-b border-border pb-4">
                        <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">
                          Update Order status
                        </h3>
                        <button onClick={() => setShowOrderForm(false)} className="p-1 hover:bg-border/30 rounded-full">
                          <X className="w-5 h-5 text-text-secondary" />
                        </button>
                      </div>

                      <form onSubmit={handleOrderUpdateSubmit} className="space-y-4">
                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Order Number</label>
                          <input
                            type="text"
                            disabled
                            value={editingOrder.order_number}
                            className="w-full p-2.5 border border-border rounded bg-background/40 cursor-not-allowed"
                          />
                        </div>

                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Status Step</label>
                          <select
                            value={orderStatusVal}
                            onChange={(e) => setOrderStatusVal(e.target.value as any)}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          >
                            <option value="Pending">Placed (Pending)</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Returned">Returned</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </div>

                        {/* courier & tracking details */}
                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Courier Partner</label>
                          <input
                            type="text"
                            placeholder="e.g. Delivery Standard, BlueDart"
                            value={courierNameVal}
                            onChange={(e) => setCourierNameVal(e.target.value)}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          />
                        </div>

                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Tracking ID / Waybill Number</label>
                          <input
                            type="text"
                            placeholder="e.g. AONE490284"
                            value={trackingNumVal}
                            onChange={(e) => setTrackingNumVal(e.target.value)}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
                          <button
                            type="button"
                            onClick={() => setShowOrderForm(false)}
                            className="py-2 px-4 border border-border rounded text-xs hover:bg-border/20 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="py-2 px-5 bg-secondary text-white font-bold rounded text-xs hover:bg-secondary/95 cursor-pointer"
                          >
                            Save Status Updates
                          </button>
                        </div>
                      </form>

                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 4: COUPON CODES */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold font-display text-text-primary">Promo Coupons</h1>
                  <p className="text-xs text-text-secondary mt-1">Configure discount values and eligibility thresholds.</p>
                </div>

                <button
                  onClick={() => setShowCouponForm(true)}
                  className="py-2.5 px-4 bg-secondary text-white font-bold rounded-button text-xs hover:bg-secondary/95 transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {/* Coupons List */}
              <div className="bg-card border border-border rounded-modal shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-background text-text-secondary border-b border-border uppercase font-bold text-[10px]">
                        <th className="p-4 text-left">Coupon Code</th>
                        <th className="p-4 text-left">Discount Type & Value</th>
                        <th className="p-4 text-left">Min Order Target</th>
                        <th className="p-4 text-left">Max Discount Caps</th>
                        <th className="p-4 text-left">Expiry & Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {couponsList.map((c) => (
                        <tr key={c.id} className="hover:bg-background/40 transition-colors">
                          <td className="p-4 font-bold text-text-primary">{c.code}</td>
                          <td className="p-4 font-semibold text-text-primary">
                            {c.type === 'Percentage' ? `${c.value}% Off` : `₹${c.value} Flat`}
                          </td>
                          <td className="p-4">₹{c.min_order_value}</td>
                          <td className="p-4">{c.max_discount ? `₹${c.max_discount}` : 'No Limit'}</td>
                          <td className="p-4">
                            <p className="font-semibold">{c.expiry_date}</p>
                            <span className="text-[9px] uppercase font-bold text-accent mt-0.5 block">{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CREATE COUPON MODAL */}
              <AnimatePresence>
                {showCouponForm && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      className="bg-card border border-border w-full max-w-md rounded-modal p-6 text-left space-y-6 shadow-large"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div className="flex justify-between items-center border-b border-border pb-4">
                        <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">
                          Create Promo Discount Code
                        </h3>
                        <button onClick={() => setShowCouponForm(false)} className="p-1 hover:bg-border/30 rounded-full">
                          <X className="w-5 h-5 text-text-secondary" />
                        </button>
                      </div>

                      <form onSubmit={handleCouponSubmit} className="space-y-4">
                        
                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Coupon Code (Uppercase)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. MEGA300"
                            value={couponInput.code || ''}
                            onChange={(e) => setCouponInput(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          />
                        </div>

                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Type</label>
                          <select
                            value={couponInput.type || 'Percentage'}
                            onChange={(e) => setCouponInput(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          >
                            <option value="Percentage">Percentage discount (%)</option>
                            <option value="Flat">Flat amount discount (₹)</option>
                          </select>
                        </div>

                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Value (Rate or Flat sum)</label>
                          <input
                            type="number"
                            required
                            value={couponInput.value || 0}
                            onChange={(e) => setCouponInput(prev => ({ ...prev, value: Number(e.target.value) }))}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          />
                        </div>

                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Minimum Order Eligibility Threshold (₹)</label>
                          <input
                            type="number"
                            required
                            value={couponInput.min_order_value || 0}
                            onChange={(e) => setCouponInput(prev => ({ ...prev, min_order_value: Number(e.target.value) }))}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          />
                        </div>

                        {couponInput.type === 'Percentage' && (
                          <div className="text-xs space-y-1.5">
                            <label className="font-semibold text-text-secondary">Maximum Discount Ceiling Cap (₹, Optional)</label>
                            <input
                              type="number"
                              value={couponInput.max_discount || ''}
                              onChange={(e) => setCouponInput(prev => ({ ...prev, max_discount: e.target.value ? Number(e.target.value) : undefined }))}
                              className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                            />
                          </div>
                        )}

                        <div className="text-xs space-y-1.5">
                          <label className="font-semibold text-text-secondary">Expiry Date</label>
                          <input
                            type="date"
                            required
                            value={couponInput.expiry_date || '2026-12-31'}
                            onChange={(e) => setCouponInput(prev => ({ ...prev, expiry_date: e.target.value }))}
                            className="w-full p-2.5 border border-border rounded bg-background text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
                          <button
                            type="button"
                            onClick={() => setShowCouponForm(false)}
                            className="py-2 px-4 border border-border rounded text-xs hover:bg-border/20 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="py-2 px-5 bg-secondary text-white font-bold rounded text-xs hover:bg-secondary/95 cursor-pointer"
                          >
                            Create Discount
                          </button>
                        </div>
                      </form>

                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

        </main>
      </div>

      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
