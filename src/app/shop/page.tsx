'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, Product, Brand, Category, PhoneModel } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Heart, Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, Star } from 'lucide-react';
import Link from 'next/link';

// Split the content component to use Suspense securely for searchParams reading
function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // Filters from URL
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialModel = searchParams.get('model') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialFilter = searchParams.get('filter') || '';

  // Options states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  
  // Active Filter state
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  // Product attributes filters
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [selectedConnector, setSelectedConnector] = useState('');
  const [selectedSpeed, setSelectedSpeed] = useState('');
  
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load configuration
  useEffect(() => {
    db.getBrands().then(setBrands);
    db.getCategories().then(setCategories);
    db.getPhoneModels().then(setPhoneModels);
    
    // Sync active wishlist items
    const updateWishlist = async () => {
      const items = await db.getWishlistItems();
      setWishlistIds(items.map(item => item.id));
    };
    updateWishlist();
  }, []);

  // Update compatibility options when brand changes
  const activeBrandModels = selectedBrand 
    ? phoneModels.filter(m => m.brand_id === selectedBrand)
    : phoneModels;

  // Handle wishlist toggle
  const handleToggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = await db.toggleWishlist(productId);
    if (added) {
      setWishlistIds([...wishlistIds, productId]);
    } else {
      setWishlistIds(wishlistIds.filter(id => id !== productId));
    }
    window.dispatchEvent(new Event('aone_wishlist_update'));
  };

  // Query database dynamically based on active filters
  useEffect(() => {
    setLoading(true);
    db.getProducts({
      brandId: selectedBrand || undefined,
      modelId: selectedModel || undefined,
      categoryId: selectedCategory || undefined,
      material: selectedMaterial || undefined,
      finish: selectedFinish || undefined,
      color: undefined, // omitted for general query
      speed: selectedSpeed || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      searchQuery: searchVal || undefined,
      sort: sortBy
    }).then((res) => {
      // Check special offers preset
      if (initialFilter === 'offers') {
        setProducts(res.filter(p => p.sale_price && p.sale_price < p.price));
      } else {
        setProducts(res);
      }
      setLoading(false);
    });
  }, [
    selectedBrand,
    selectedModel,
    selectedCategory,
    selectedMaterial,
    selectedFinish,
    selectedSpeed,
    minPrice,
    maxPrice,
    searchVal,
    sortBy,
    initialFilter
  ]);

  const handleBuyNow = (product: Product, selectedModelName?: string) => {
    addToCart(product, 1, selectedModelName);
    router.push('/checkout');
  };

  const handleClearFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedCategory('');
    setSelectedMaterial('');
    setSelectedFinish('');
    setSelectedConnector('');
    setSelectedSpeed('');
    setMinPrice(0);
    setMaxPrice(10000);
    setSearchVal('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-8">
        
        {/* Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name 
                : 'Mobile Accessories'}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Found {products.length} premium accessories compatible with your devices
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-button text-xs font-semibold hover:bg-background"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 border border-border rounded-button px-3 py-2 bg-card text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none font-semibold text-text-primary"
              >
                <option value="popular">Best Sellers</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* FILTERS SIDEBAR DESKTOP */}
          <aside className="hidden md:block space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </span>
              <button 
                onClick={handleClearFilters}
                className="text-[10px] uppercase font-bold text-secondary hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Search Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by name, SKU..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
              </div>
            </div>

            {/* Categories filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Compatibility: Brand */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Phone Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                }}
                className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none"
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.brand_name}</option>
                ))}
              </select>
            </div>

            {/* Compatibility: Model */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Phone Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand}
                className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none disabled:opacity-50"
              >
                <option value="">All Compatible Models</option>
                {activeBrandModels.map(m => (
                  <option key={m.id} value={m.id}>{m.model_name}</option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Material</label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none"
              >
                <option value="">All Materials</option>
                <option value="Silicone">Silicone</option>
                <option value="Leather">Leather</option>
                <option value="Tempered Glass">Tempered Glass</option>
                <option value="TPU">TPU</option>
                <option value="Nylon Braided">Nylon Braided</option>
              </select>
            </div>

            {/* Charger Speed */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Charging Speed</label>
              <select
                value={selectedSpeed}
                onChange={(e) => setSelectedSpeed(e.target.value)}
                className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none"
              >
                <option value="">All Speeds</option>
                <option value="18W">18W</option>
                <option value="20W">20W</option>
                <option value="45W">45W</option>
                <option value="65W">65W</option>
                <option value="100W PD">100W</option>
              </select>
            </div>

            {/* Price range */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-text-secondary uppercase tracking-wider">Price Range</span>
                <span className="font-semibold text-text-primary">Max: ₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-secondary"
              />
            </div>
          </aside>

          {/* MAIN PRODUCT GRID */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-modal border border-border p-4 space-y-4 animate-pulse">
                    <div className="aspect-square bg-border rounded-image" />
                    <div className="h-4 bg-border rounded w-3/4" />
                    <div className="h-4 bg-border rounded w-1/2" />
                    <div className="h-8 bg-border rounded w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-card rounded-modal border border-border/80">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-text-secondary mx-auto">
                  <SlidersHorizontal className="w-8 h-8 opacity-45" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">No Accessories Found</h3>
                  <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                    We couldn't find any matches. Try adjusting your sidebar compatibility filters or resetting the search term.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-button shadow hover:bg-primary/95 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const original = prod.price;
                  const sale = prod.sale_price || prod.price;
                  const discount = Math.round(((original - sale) / original) * 100);
                  const isWishlisted = wishlistIds.includes(prod.id);

                  // Extract compatibilities names
                  const compatNames = prod.compatibility
                    .map(cid => phoneModels.find(m => m.id === cid)?.model_name)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(', ');

                  return (
                    <div
                      key={prod.id}
                      className="bg-card rounded-modal border border-border/60 hover:border-secondary/40 overflow-hidden flex flex-col justify-between group hover:shadow-medium transition-all duration-300 relative"
                    >
                      {/* Wishlist toggle */}
                      <button
                        onClick={(e) => handleToggleWishlist(prod.id, e)}
                        className="absolute top-3 right-3 p-2 bg-card/85 backdrop-blur-[2px] hover:bg-card text-text-secondary hover:text-danger rounded-full shadow-soft z-10 transition-colors focus:outline-none"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-danger text-danger' : ''}`} />
                      </button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {prod.sale_price && (
                          <span className="bg-danger text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                            -{discount}%
                          </span>
                        )}
                        {prod.best_seller && (
                          <span className="bg-primary text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
                            Best Seller
                          </span>
                        )}
                        {prod.new_arrival && (
                          <span className="bg-accent text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      <Link href={`/product/${prod.slug}`} className="block relative aspect-square bg-background overflow-hidden border-b border-border/40">
                        <img
                          src={prod.images[0]}
                          alt={prod.product_name}
                          className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                        />
                      </Link>

                      {/* Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            <span className="text-[10px] font-semibold text-text-primary">4.8</span>
                            <span className="text-[10px] text-text-secondary">(24)</span>
                          </div>

                          <Link href={`/product/${prod.slug}`} className="block">
                            <h5 className="font-bold text-xs sm:text-sm text-text-primary line-clamp-1 group-hover:text-secondary transition-colors">
                              {prod.product_name}
                            </h5>
                          </Link>

                          {compatNames ? (
                            <p className="text-[10px] text-text-secondary mt-1 leading-normal line-clamp-1">
                              Fits: <span className="font-semibold text-text-primary">{compatNames}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-text-secondary mt-1 italic">Universal device support</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sm text-text-primary">₹{sale}</span>
                            {prod.sale_price && (
                              <span className="text-[10px] text-text-secondary line-through">₹{original}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => addToCart(prod, 1, phoneModels.find(m => m.id === selectedModel)?.model_name)}
                              className="w-full py-2 border border-border hover:border-text-primary rounded-button text-[10px] font-bold transition-colors focus:outline-none"
                            >
                              Add Cart
                            </button>
                            <button
                              onClick={() => handleBuyNow(prod, phoneModels.find(m => m.id === selectedModel)?.model_name)}
                              className="w-full py-2 bg-secondary hover:bg-secondary/95 text-white rounded-button text-[10px] font-bold transition-all focus:outline-none"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* MOBILE FILTERS MODAL DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-4/5 max-w-xs h-full bg-card shadow-large p-6 overflow-y-auto flex flex-col justify-between border-l border-border">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="font-bold text-sm">Filters</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-xs font-semibold text-text-secondary">Close</button>
              </div>

              {/* Dynamic filter selectors duplicated for mobile view */}
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-secondary">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2.5 border border-border rounded-input text-xs bg-background"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-secondary">Brand Compatibility</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setSelectedModel('');
                    }}
                    className="w-full p-2.5 border border-border rounded-input text-xs bg-background"
                  >
                    <option value="">All Brands</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.brand_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-secondary">Phone Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!selectedBrand}
                    className="w-full p-2.5 border border-border rounded-input text-xs bg-background"
                  >
                    <option value="">All Compatible Models</option>
                    {activeBrandModels.map(m => (
                      <option key={m.id} value={m.id}>{m.model_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-secondary">Material</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full p-2.5 border border-border rounded-input text-xs bg-background"
                  >
                    <option value="">All Materials</option>
                    <option value="Silicone">Silicone</option>
                    <option value="Leather">Leather</option>
                    <option value="Tempered Glass">Tempered Glass</option>
                    <option value="TPU">TPU</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] uppercase font-bold text-text-secondary">Max Price</span>
                    <span className="font-semibold text-text-primary">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-secondary"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex gap-2">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-2.5 border border-border rounded-button text-xs font-semibold text-text-primary hover:bg-background"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2.5 bg-primary text-white rounded-button text-xs font-semibold hover:bg-primary/95"
              >
                Apply
              </button>
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
