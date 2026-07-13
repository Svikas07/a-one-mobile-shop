'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, Moon, Sun, Menu, X, ChevronDown, Package, Gift, PhoneCall, HelpCircle, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { db, Product, Brand, Category } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';


export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems, setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for header shrinking and solid background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch header categories, brands and load wishlist count
  useEffect(() => {
    db.getCategories().then(setCategories);

    const updateWishlist = async () => {
      const wishlist = await db.getWishlistItems();
      setWishlistCount(wishlist.length);
    };

    updateWishlist();
    window.addEventListener('aone_wishlist_update', updateWishlist);
    return () => window.removeEventListener('aone_wishlist_update', updateWishlist);
  }, []);

  // Handle outside click for search suggestions drop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search queries
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await db.getProducts({ searchQuery: searchQuery });
      setSearchResults(results.slice(0, 5));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header
      className={`sticky top-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? 'glass py-3 shadow-soft'
          : 'bg-background py-5 border-b border-border/40'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-playfair text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-text-primary to-secondary bg-clip-text text-transparent">
            A-One Mobile
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">
            Accessories
          </span>
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
          <Link
            href="/"
            className={`hover:text-secondary transition-colors ${
              pathname === '/' ? 'text-secondary' : 'text-text-primary'
            }`}
          >
            Home
          </Link>
          <Link
            href="/shop"
            className={`hover:text-secondary transition-colors ${
              pathname === '/shop' ? 'text-secondary' : 'text-text-primary'
            }`}
          >
            Shop All
          </Link>

          {/* Categories dropdown Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategoryDropdown(true)}
            onMouseLeave={() => setShowCategoryDropdown(false)}
          >
            <button className="flex items-center gap-1 hover:text-secondary text-text-primary transition-colors focus:outline-none">
              <span>Categories</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  className="absolute left-0 mt-2 w-56 bg-card rounded-modal border border-border shadow-medium p-4 z-50 grid gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {categories.slice(0, 6).map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?category=${c.id}`}
                      className="text-sm font-medium hover:text-secondary hover:bg-background px-3 py-2 rounded-button transition-all"
                      onClick={() => setShowCategoryDropdown(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                  <Link
                    href="/shop"
                    className="text-xs font-semibold text-secondary hover:underline px-3 pt-2 mt-1 border-t border-border/40"
                    onClick={() => setShowCategoryDropdown(false)}
                  >
                    View All Categories →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/shop?filter=offers"
            className="flex items-center gap-1 hover:text-secondary text-text-primary transition-colors"
          >
            <Gift className="w-4 h-4 text-accent" />
            <span>Offers</span>
          </Link>

          <Link
            href="/track"
            className="flex items-center gap-1 hover:text-secondary text-text-primary transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Track Order</span>
          </Link>
        </nav>

        {/* SEARCH BAR DESKTOP */}
        <div ref={searchRef} className="hidden md:block relative flex-1 max-w-sm lg:max-w-md mx-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search accessories (e.g. iPhone 16 Glass, Spigen Cover)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full py-2.5 pl-11 pr-4 border border-border rounded-input text-xs bg-background focus:outline-none focus:border-secondary transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>
          </form>

          {/* Search suggestions dropdown */}
          <AnimatePresence>
            {searchFocused && (searchQuery.trim().length > 0 || searchResults.length > 0) && (
              <motion.div
                className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-modal shadow-large z-50 overflow-hidden"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-secondary">
                    No accessories matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-text-secondary px-3 py-1.5 border-b border-border/40">
                      Suggestions
                    </p>
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-background rounded-button transition-colors"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.product_name}
                          className="w-10 h-10 object-cover rounded-image border border-border"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-text-primary truncate">{p.product_name}</h5>
                          <p className="text-[10px] text-text-secondary truncate mt-0.5">
                            SKU: {p.sku} | Accessory
                          </p>
                        </div>
                        <span className="text-xs font-bold text-text-primary flex-shrink-0">
                          ₹{p.sale_price || p.price}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => {
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="block text-center text-xs font-bold text-secondary py-2 hover:bg-background transition-colors border-t border-border/40"
                    >
                      View all search results
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Dark Mode button */}
          <button
            onClick={toggleTheme}
            className="p-2 md:p-2.5 hover:bg-border/30 rounded-full transition-all focus:outline-none"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5 text-text-primary" />}
          </button>

          {/* Wishlist Link */}
          <Link
            href="/account?tab=wishlist"
            className="p-2 md:p-2.5 hover:bg-border/30 rounded-full transition-all relative"
            aria-label="View Wishlist"
          >
            <Heart className="w-5 h-5 text-text-primary" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="p-2 md:p-2.5 hover:bg-border/30 rounded-full transition-all relative focus:outline-none"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-text-primary" />
            {totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Profile Dashboard Account */}
          <Link
            href="/account"
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-primary text-white dark:bg-card dark:text-text-primary border border-border rounded-button hover:bg-primary/95 transition-all shadow-soft"
          >
            {user ? (user.full_name?.split(' ')[0] || 'Account') : 'Account'}
          </Link>

          {/* Admin panel link shortcut */}
          {user?.role === 'Admin' && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center justify-center p-2.5 text-text-secondary hover:text-secondary rounded-full hover:bg-border/30 transition-colors"
              title="Admin Panel"
            >
              <Shield className="w-5 h-5 text-accent" />
            </Link>
          )}

          {/* Mobile Menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 lg:hidden hover:bg-border/30 rounded-full transition-all focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-text-primary" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Drawer */}
            <motion.div
              className="fixed top-0 left-0 h-full w-4/5 sm:max-w-xs bg-card shadow-large z-50 lg:hidden border-r border-border flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <span className="font-playfair font-bold text-lg text-text-primary">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-background rounded-full transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search bar */}
              <div className="p-4 border-b border-border bg-background">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search covers, chargers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 pl-9 pr-4 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  </div>
                </form>
              </div>

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 font-semibold text-sm">
                <Link
                  href="/"
                  className="block py-2 text-text-primary border-b border-border/40 hover:text-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className="block py-2 text-text-primary border-b border-border/40 hover:text-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop Accessories
                </Link>
                <Link
                  href="/shop?filter=offers"
                  className="flex items-center gap-2 py-2 text-accent border-b border-border/40"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gift className="w-4 h-4" />
                  <span>Latest Offers</span>
                </Link>
                <Link
                  href="/track"
                  className="flex items-center gap-2 py-2 text-text-primary border-b border-border/40 hover:text-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  <span>Track Order</span>
                </Link>
                <Link
                  href="/account"
                  className="block py-2 text-text-primary border-b border-border/40 hover:text-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                {user?.role === 'Admin' && (
                  <Link
                    href="/admin"
                    className="block py-2 text-text-secondary hover:text-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>

              {/* Mobile Footer support info */}
              <div className="p-6 border-t border-border bg-background flex flex-col gap-3 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call support: +91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Help & FAQ Centre</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
