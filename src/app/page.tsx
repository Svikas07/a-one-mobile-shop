'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award, Clock, ArrowUpRight, Play, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CartDrawer } from '@/components/CartDrawer';
import { db, Product, Brand, Category, PhoneModel } from '@/lib/db';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  
  // Compatibility selector state
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [filteredModels, setFilteredModels] = useState<PhoneModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');

  // Products segments
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  // Deals Countdown state (12 hours countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Load static content
    db.getBrands().then(setBrands);
    db.getCategories().then(setCategories);
    db.getPhoneModels().then(setPhoneModels);

    // Load dynamic products lists
    db.getProducts().then(all => {
      setFeaturedProducts(all.filter(p => p.featured));
      setBestSellers(all.filter(p => p.best_seller));
      setNewArrivals(all.filter(p => p.new_arrival));
    });

    // Setup Deals Timer countdown
    const target = new Date();
    target.setHours(target.getHours() + 11);
    target.setMinutes(target.getMinutes() + 59);
    target.setSeconds(target.getSeconds() + 59);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter models when Brand is selected
  useEffect(() => {
    if (selectedBrandId) {
      setFilteredModels(phoneModels.filter(m => m.brand_id === selectedBrandId));
      setSelectedModelId('');
    } else {
      setFilteredModels([]);
      setSelectedModelId('');
    }
  }, [selectedBrandId, phoneModels]);

  const handleCompatibilitySearch = () => {
    if (selectedModelId) {
      router.push(`/shop?model=${selectedModelId}`);
    } else if (selectedBrandId) {
      router.push(`/shop?brand=${selectedBrandId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-background to-background/40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.span 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary/10 text-secondary text-xs font-bold tracking-wider uppercase rounded-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              💎 premium collection 2026
            </motion.span>
            
            <motion.h1 
              className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight text-text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Protect Your Phone <br />
              <span className="font-playfair font-normal italic text-secondary">In Absolute Style.</span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Premium mobile covers, impact-tested tempered glasses, high-efficiency chargers, and original audio gear. Custom engineered exclusively for flagship smartphones.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/shop" className="px-8 py-4 bg-primary text-white font-bold rounded-button shadow-medium hover:bg-primary/95 hover:shadow-large transition-all duration-300 flex items-center gap-2">
                <span>Shop Accessories</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <a href="#compatibility-section" className="px-8 py-4 bg-card border border-border text-text-primary font-bold rounded-button hover:bg-background transition-colors duration-300">
                Find Compatible Models
              </a>
            </motion.div>
          </div>

          {/* Hero floating graphics grid */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="absolute inset-0 bg-secondary/5 blur-[120px] rounded-full z-0" />
            <motion.div
              className="w-72 h-96 relative bg-gradient-to-tr from-secondary/10 to-accent/10 rounded-modal border border-border shadow-large p-4 flex flex-col justify-between overflow-hidden glass pulse-glow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Best Seller</span>
                <span className="text-xs font-bold text-accent">In Stock</span>
              </div>
              
              {/* Product floating lifestyle graphic */}
              <div className="w-full h-44 flex items-center justify-center my-4 overflow-hidden rounded-image">
                <img 
                  src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80" 
                  alt="Premium accessories showcase" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>

              <div>
                <h4 className="font-playfair font-bold text-base text-text-primary">Spigen Ultra Hybrid</h4>
                <p className="text-xs text-text-secondary mt-1">Matte frost case for iPhone 16 Series</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-sm text-text-primary">₹1,499</span>
                  <Link href="/product/spigen-ultra-hybrid-matte-frost-case" className="p-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="py-12 border-y border-border/60 bg-card">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/10 text-secondary rounded-full flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-text-primary">100% Original</h5>
              <p className="text-xs text-text-secondary mt-0.5">Authorised Brand Stock</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/10 text-secondary rounded-full flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-text-primary">Free Shipping</h5>
              <p className="text-xs text-text-secondary mt-0.5">Orders Above ₹499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/10 text-secondary rounded-full flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-text-primary">Easy Replacement</h5>
              <p className="text-xs text-text-secondary mt-0.5">7 Days Returns Window</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/10 text-secondary rounded-full flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-text-primary">Warranty Support</h5>
              <p className="text-xs text-text-secondary mt-0.5">Hassle-Free Claims</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PHONE COMPATIBILITY SELECTOR */}
      <section id="compatibility-section" className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Compatibility Engine</span>
          <h2 className="text-3xl font-bold mt-2 text-text-primary">Find Accessories for Your Phone</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-lg mx-auto">
            Choose your device brand and model to find custom engineered covers, protectors, and chargers.
          </p>

          <div className="mt-8 p-6 md:p-8 bg-card rounded-modal border border-border shadow-medium grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Brand Dropdown */}
            <div className="text-left space-y-2">
              <label className="text-xs font-semibold text-text-secondary">1. Choose Brand</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full p-3.5 border border-border rounded-input text-sm bg-background focus:outline-none focus:border-secondary transition-colors"
              >
                <option value="">Select Phone Brand</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.brand_name}</option>
                ))}
              </select>
            </div>

            {/* Model Dropdown */}
            <div className="text-left space-y-2">
              <label className="text-xs font-semibold text-text-secondary">2. Choose Phone Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={!selectedBrandId}
                className="w-full p-3.5 border border-border rounded-input text-sm bg-background focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
              >
                <option value="">Select Phone Model</option>
                {filteredModels.map(m => (
                  <option key={m.id} value={m.id}>{m.model_name}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              onClick={handleCompatibilitySearch}
              disabled={!selectedBrandId}
              className="w-full py-3.5 bg-secondary text-white font-bold rounded-button hover:bg-secondary/95 transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>Explore Accessories</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. POPULAR CATEGORIES */}
      <section className="py-16 bg-card border-b border-border/40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">Shop by category</span>
              <h2 className="text-3xl font-bold mt-1 text-text-primary">Popular Categories</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.slice(0, 5).map((cat) => (
              <Link 
                key={cat.id} 
                href={`/shop?category=${cat.id}`}
                className="group relative bg-background rounded-modal overflow-hidden p-6 border border-border hover:border-secondary/40 hover:shadow-medium transition-all duration-300 flex flex-col justify-between aspect-square"
              >
                <div>
                  <h4 className="font-bold text-base text-text-primary group-hover:text-secondary transition-colors">{cat.name}</h4>
                  <p className="text-xs text-text-secondary mt-1">{cat.description || 'Premium gear'}</p>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Explore</span>
                  <div className="p-2 bg-card group-hover:bg-secondary group-hover:text-white rounded-full transition-all duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TODAY'S FLASH DEALS CAROUSEL */}
      <section className="py-16 bg-background">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-0.5 rounded uppercase tracking-wider">Flash Sale</span>
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">Today's Deals</span>
              </div>
              <h2 className="text-3xl font-bold mt-1 text-text-primary">Limited Time Deals</h2>
            </div>
            
            {/* Ticking Clock */}
            <div className="flex items-center gap-3 bg-card p-3 rounded-button border border-border shadow-soft">
              <Clock className="w-4.5 h-4.5 text-danger animate-spin" style={{ animationDuration: '60s' }} />
              <span className="text-xs font-bold text-text-secondary uppercase">Offer Ends In:</span>
              <div className="flex gap-1.5 text-sm font-bold text-text-primary">
                <span className="bg-background px-2.5 py-1.5 border border-border rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span>:</span>
                <span className="bg-background px-2.5 py-1.5 border border-border rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span>:</span>
                <span className="bg-background px-2.5 py-1.5 border border-border rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 3).map((prod) => {
              const original = prod.price;
              const sale = prod.sale_price || prod.price;
              const discount = Math.round(((original - sale) / original) * 100);

              return (
                <div key={prod.id} className="bg-card rounded-modal border border-border hover:border-border-hover overflow-hidden flex flex-col justify-between group hover:shadow-medium transition-all duration-300">
                  <div className="relative aspect-video bg-background overflow-hidden">
                    <img 
                      src={prod.images[0]} 
                      alt={prod.product_name} 
                      className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4 bg-danger text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow">
                      -{discount}% OFF
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-text-primary truncate">{prod.product_name}</h4>
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                        {prod.short_description}
                      </p>
                      
                      {/* Specifications snapshot */}
                      <div className="mt-3 flex gap-3 text-[10px] font-semibold text-text-secondary uppercase">
                        {prod.color && <span>🎨 {prod.color}</span>}
                        {prod.material && <span>🛠️ {prod.material}</span>}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-text-primary">₹{sale}</span>
                          <span className="text-xs text-text-secondary line-through">₹{original}</span>
                        </div>
                        <p className="text-[10px] text-accent font-semibold mt-0.5">Save ₹{original - sale}</p>
                      </div>
                      <button
                        onClick={() => addToCart(prod)}
                        className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-button hover:bg-primary/95 transition-all focus:outline-none"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS GRID */}
      <section className="py-16 bg-card border-y border-border/40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">Highest rated</span>
              <h2 className="text-3xl font-bold mt-1 text-text-primary">Our Best Sellers</h2>
            </div>
            <Link href="/shop?sort=popular" className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline">
              <span>View All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <div key={prod.id} className="bg-background rounded-modal overflow-hidden border border-border/60 hover:border-secondary/40 group hover:shadow-medium transition-all duration-300 flex flex-col justify-between">
                <div className="relative aspect-square bg-card overflow-hidden">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.product_name} 
                    className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 bg-secondary text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                    Best Seller
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-text-primary truncate">{prod.product_name}</h5>
                    <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-semibold">SKU: {prod.sku}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="font-bold text-sm text-text-primary">₹{prod.sale_price || prod.price}</span>
                    <Link 
                      href={`/product/${prod.slug}`}
                      className="text-xs font-bold text-secondary flex items-center gap-0.5 hover:underline"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MOCK DEMO INSTALLATION VIDEO SECTION */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Care & installation</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
              Flawless Alignment. <br />
              No Bubble Guarantee.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every A-One tempered glass arrives with a professional installation kit, including wet cleaning pads, dust removal stickers, and alignment frames. Watch our 60-second video demo to master the application process in minutes.
            </p>
            <div className="space-y-3.5 text-xs text-text-secondary">
              <p className="flex items-center gap-2">🟢 <span className="font-semibold text-text-primary">100% Case Friendly</span> - Raised bevels avoid corner lifts.</p>
              <p className="flex items-center gap-2">🟢 <span className="font-semibold text-text-primary">9H Hardness rating</span> - Maximum scratch drop shield.</p>
              <p className="flex items-center gap-2">🟢 <span className="font-semibold text-text-primary">Ultra HD Clarity</span> - Unobstructed view & full brightness.</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-video rounded-modal overflow-hidden border border-border shadow-large group">
              <img 
                src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80" 
                alt="Glass installation installation" 
                className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                <button
                  onClick={() => alert('Launching simulated installation guide video player...')}
                  className="w-20 h-20 bg-white/90 text-primary hover:bg-secondary hover:text-white rounded-full flex items-center justify-center shadow-large transition-all transform hover:scale-105 active:scale-95 focus:outline-none"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-16 bg-card border-t border-border/40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 text-center">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Happy Customers</span>
          <h2 className="text-3xl font-bold mt-1 text-text-primary">Reviews & Feedback</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="p-6 bg-background rounded-modal border border-border/60">
              <div className="flex gap-1 text-warning mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <h5 className="font-bold text-sm text-text-primary">"Perfect Matte Cover"</h5>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                "Purchased the Spigen Matte Frost Case for my iPhone 16 Pro Max. The fit is absolute perfection and it feels incredibly premium. Shipping took only 2 days to Noida."
              </p>
              <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-xs text-text-secondary font-semibold">
                <span>Vikas Sharma</span>
                <span className="text-accent">✓ Verified Purchase</span>
              </div>
            </div>
            <div className="p-6 bg-background rounded-modal border border-border/60">
              <div className="flex gap-1 text-warning mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <h5 className="font-bold text-sm text-text-primary">"Best screen protector"</h5>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                "Applying the curved glass on my Galaxy S24 Ultra was extremely simple using the installation alignments frame. Flawless touch sensitivity, no air bubbles at all."
              </p>
              <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-xs text-text-secondary font-semibold">
                <span>Ramesh Gupta</span>
                <span className="text-accent">✓ Verified Purchase</span>
              </div>
            </div>
            <div className="p-6 bg-background rounded-modal border border-border/60">
              <div className="flex gap-1 text-warning mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <h5 className="font-bold text-sm text-text-primary">"Fast charger is a beast"</h5>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                "The 65W GaN dual charger easily charges both my phone and iPad at full speed. It is extremely compact. Excellent customer service from A-One store team."
              </p>
              <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-xs text-text-secondary font-semibold">
                <span>Anjali Verma</span>
                <span className="text-accent">✓ Verified Purchase</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}
