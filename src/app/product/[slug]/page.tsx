'use client';

import React, { useState, useEffect, use } from 'react';
import { db, Product, PhoneModel, Review } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Star, Heart, Share2, Shield, Truck, RotateCcw, CheckCircle, Tag, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Interaction states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedModelName, setSelectedModelName] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'guide' | 'reviews'>('details');

  // Variant selections
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSpeed, setSelectedSpeed] = useState('');

  // Frequently Bought Together (FBT) Bundle states
  const [fbtBundle, setFbtBundle] = useState<Product[]>([]);
  const [fbtSelections, setFbtSelections] = useState<{ [key: string]: boolean }>({});
  
  // Review inputs
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    // Load configurations
    db.getPhoneModels().then(setPhoneModels);

    // Load active product details
    db.getProductBySlug(slug).then(async (prod) => {
      if (prod) {
        setProduct(prod);
        setSelectedColor(prod.color || '');
        setSelectedMaterial(prod.material || '');
        setSelectedSpeed(prod.charging_speed || '');

        // Fetch related products
        const all = await db.getProducts({ categoryId: prod.category_id });
        setRelatedProducts(all.filter(p => p.id !== prod.id).slice(0, 4));

        // Fetch reviews
        const revs = await db.getReviews(prod.id);
        setReviews(revs);

        // Fetch bundle items (Frequently bought covers usually bundle a tempered glass & lens protector)
        const allProds = await db.getProducts();
        const glass = allProds.find(p => p.category_id === 'c2');
        const cable = allProds.find(p => p.category_id === 'c7');
        const bundleItems = [prod];
        if (glass) bundleItems.push(glass);
        if (cable) bundleItems.push(cable);
        setFbtBundle(bundleItems);

        const initialSelections = bundleItems.reduce((acc, p) => {
          acc[p.id] = true;
          return acc;
        }, {} as { [key: string]: boolean });
        setFbtSelections(initialSelections);

        // Set default compatibility model name
        if (prod.compatibility.length > 0) {
          db.getPhoneModels().then(models => {
            const matched = models.find(m => m.id === prod.compatibility[0]);
            if (matched) setSelectedModelName(matched.model_name);
          });
        }

        // Save to Recently Viewed (limit 10 items)
        const recent = localStorage.getItem('aone_recent_viewed');
        let list = recent ? JSON.parse(recent) : [];
        list = list.filter((id: string) => id !== prod.id);
        list.unshift(prod.id);
        localStorage.setItem('aone_recent_viewed', JSON.stringify(list.slice(0, 10)));
      }
    });

    // Check wishlist state
    db.getWishlistItems().then(items => {
      const isItemWishlisted = items.some(item => item.slug === slug);
      setIsWishlisted(isItemWishlisted);
    });
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
      </div>
    );
  }

  const handleToggleWishlist = async () => {
    const added = await db.toggleWishlist(product.id);
    setIsWishlisted(added);
    window.dispatchEvent(new Event('aone_wishlist_update'));
  };

  const handleAddFbtBundle = () => {
    fbtBundle.forEach(p => {
      if (fbtSelections[p.id]) {
        addToCart(p, 1, selectedModelName);
      }
    });
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: product.product_name,
        text: product.short_description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedModelName);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    
    const newRev = await db.addReview(product.id, {
      product_id: product.id,
      full_name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      verified_purchase: true
    });

    setReviews([newRev, ...reviews]);
    setReviewName('');
    setReviewComment('');
    alert('Review submitted successfully!');
  };

  // Calculate bundle total price
  const bundleOriginalPrice = fbtBundle
    .filter(p => fbtSelections[p.id])
    .reduce((sum, p) => sum + p.price, 0);
  const bundleSalePrice = fbtBundle
    .filter(p => fbtSelections[p.id])
    .reduce((sum, p) => sum + (p.sale_price || p.price), 0);

  const compatList = product.compatibility
    .map(cid => phoneModels.find(m => m.id === cid))
    .filter(Boolean) as PhoneModel[];

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-10 lg:px-20 py-8">
        
        {/* Breadcrumb */}
        <div className="text-xs text-text-secondary mb-6 flex gap-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{product.product_name}</span>
        </div>

        {/* Product core specs layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* LEFT COLUMN: Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square bg-card border border-border rounded-modal overflow-hidden relative group">
              <img
                src={product.images[activeImageIndex]}
                alt={product.product_name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 cursor-zoom-in"
              />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-20 h-20 bg-card rounded-image border overflow-hidden transition-all ${
                    activeImageIndex === i ? 'border-secondary ring-1 ring-secondary' : 'border-border hover:border-text-primary'
                  }`}
                >
                  <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Options */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded">
                Official Accessory
              </span>
              <h1 className="text-3xl font-bold mt-3 text-text-primary tracking-tight">{product.product_name}</h1>
              <p className="text-xs text-text-secondary mt-1">SKU: {product.sku}</p>
            </div>

            {/* Pricing Details */}
            <div className="p-4 bg-background border border-border rounded-modal flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold text-text-primary">₹{product.sale_price || product.price}</span>
                  {product.sale_price && (
                    <span className="text-sm text-text-secondary line-through">₹{product.price}</span>
                  )}
                </div>
                {product.sale_price && (
                  <p className="text-xs text-accent font-semibold mt-1">
                    Save ₹{product.price - product.sale_price} ({Math.round(((product.price - (product.sale_price || product.price)) / product.price) * 100)}% OFF)
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  product.stock > 0 ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
                }`}>
                  {product.stock > 3 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} Left!` : 'Out of Stock'}
                </span>
                <p className="text-[10px] text-text-secondary mt-1">COD & Free Shipping Eligible</p>
              </div>
            </div>

            {/* COMPATIBILITY CRITICAL BOX */}
            <div className="p-5 bg-secondary/5 border border-secondary/20 rounded-modal space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary block">Device Compatibility</span>
              <p className="text-sm font-bold text-text-primary">Compatible Phone Models:</p>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {compatList.length > 0 ? (
                  compatList.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModelName(m.model_name)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-button border transition-all ${
                        selectedModelName === m.model_name 
                          ? 'bg-secondary text-white border-secondary shadow-soft' 
                          : 'bg-card text-text-primary border-border hover:border-text-primary'
                      }`}
                    >
                      {m.model_name}
                    </button>
                  ))
                ) : (
                  <span className="text-xs font-semibold text-text-secondary">Universal support for all brands</span>
                )}
              </div>
            </div>

            {/* Custom Variants selections */}
            <div className="space-y-4 pt-2">
              {product.color && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-secondary uppercase">Selected Color: {selectedColor}</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-card border border-secondary rounded-button text-xs font-semibold">
                      {product.color}
                    </button>
                  </div>
                </div>
              )}

              {product.material && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-secondary uppercase">Material: {selectedMaterial}</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-card border border-border rounded-button text-xs font-semibold">
                      {product.material}
                    </button>
                  </div>
                </div>
              )}

              {product.charging_speed && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-secondary uppercase">Speed: {selectedSpeed}</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-card border border-border rounded-button text-xs font-semibold">
                      {product.charging_speed}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Actions */}
            <div className="pt-4 flex gap-4">
              <div className="flex items-center border border-border rounded-button overflow-hidden bg-background">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-3 hover:bg-border/30 transition-colors focus:outline-none"
                >
                  -
                </button>
                <span className="px-4 font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3.5 py-3 hover:bg-border/30 transition-colors focus:outline-none"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity, selectedModelName)}
                className="flex-1 py-4 bg-primary text-white font-bold rounded-button shadow hover:bg-primary/95 transition-all focus:outline-none cursor-pointer"
              >
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 bg-secondary text-white font-bold rounded-button shadow-medium hover:bg-secondary/95 transition-all focus:outline-none cursor-pointer"
              >
                Buy Now
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-4 border rounded-button transition-colors focus:outline-none ${
                  isWishlisted ? 'border-danger text-danger bg-danger/5' : 'border-border hover:border-text-primary text-text-secondary'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Share / Trust cards */}
            <div className="pt-4 flex items-center justify-between border-t border-border text-xs text-text-secondary">
              <button onClick={handleShareLink} className="flex items-center gap-1.5 hover:text-secondary">
                <Share2 className="w-4 h-4" />
                <span>Share Accessory</span>
              </button>
              <span className="flex items-center gap-1">🔒 Secure 256-bit Payment</span>
            </div>

            {/* Shipping badges */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-background rounded border border-border/60 text-center space-y-1">
                <Shield className="w-4 h-4 mx-auto text-secondary" />
                <p className="text-[10px] font-bold text-text-primary">Warranty</p>
                <p className="text-[9px] text-text-secondary">100% Genuine</p>
              </div>
              <div className="p-3 bg-background rounded border border-border/60 text-center space-y-1">
                <Truck className="w-4 h-4 mx-auto text-secondary" />
                <p className="text-[10px] font-bold text-text-primary">Dispatch</p>
                <p className="text-[9px] text-text-secondary">Within 24 Hours</p>
              </div>
              <div className="p-3 bg-background rounded border border-border/60 text-center space-y-1">
                <RotateCcw className="w-4 h-4 mx-auto text-secondary" />
                <p className="text-[10px] font-bold text-text-primary">Returns</p>
                <p className="text-[9px] text-text-secondary">7 Days Replacement</p>
              </div>
            </div>

          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER BUNDLE */}
        {fbtBundle.length > 1 && (
          <div className="p-6 bg-card border border-border rounded-modal mb-16 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Tag className="w-5 h-5 text-accent" />
              <span>Frequently Bought Together</span>
            </h3>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-wrap items-center gap-6">
                {fbtBundle.map((p, idx) => (
                  <React.Fragment key={p.id}>
                    <div className="flex items-center gap-4 bg-background p-3 rounded-modal border border-border">
                      <input
                        type="checkbox"
                        checked={!!fbtSelections[p.id]}
                        onChange={() => setFbtSelections({ ...fbtSelections, [p.id]: !fbtSelections[p.id] })}
                        className="w-4.5 h-4.5 accent-secondary"
                        disabled={idx === 0} // Can't unselect current product
                      />
                      <img src={p.images[0]} alt={p.product_name} className="w-12 h-12 object-cover rounded border border-border" />
                      <div className="text-left min-w-0 max-w-[200px]">
                        <h5 className="font-bold text-xs truncate">{p.product_name}</h5>
                        <p className="text-[10px] text-text-secondary mt-0.5">₹{p.sale_price || p.price}</p>
                      </div>
                    </div>
                    {idx < fbtBundle.length - 1 && <Plus className="w-4 h-4 text-text-secondary" />}
                  </React.Fragment>
                ))}
              </div>

              <div className="w-full lg:w-auto p-4 bg-background rounded-modal border border-border/80 text-center lg:text-right space-y-3 flex-shrink-0">
                <div>
                  <p className="text-xs text-text-secondary font-semibold">Total Bundle Price</p>
                  <div className="flex items-baseline justify-center lg:justify-end gap-2 mt-1">
                    <span className="text-xl font-bold text-text-primary">₹{bundleSalePrice}</span>
                    {bundleOriginalPrice > bundleSalePrice && (
                      <span className="text-xs text-text-secondary line-through">₹{bundleOriginalPrice}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAddFbtBundle}
                  className="px-6 py-3 bg-secondary text-white text-xs font-bold rounded-button hover:bg-secondary/95 transition-all focus:outline-none"
                >
                  Add Selected to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABS DETAILS */}
        <div className="border-b border-border/60 flex gap-6 text-sm mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'details' ? 'text-secondary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Product Details</span>
            {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'specs' ? 'text-secondary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Specifications</span>
            {activeTab === 'specs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'guide' ? 'text-secondary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Installation Guide</span>
            {activeTab === 'guide' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'reviews' ? 'text-secondary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Reviews ({reviews.length})</span>
            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="mb-16">
          {activeTab === 'details' && (
            <div className="space-y-4 leading-relaxed text-sm text-text-secondary">
              <p className="text-text-primary font-semibold text-base">Description</p>
              <p>{product.full_description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl bg-card rounded-modal border border-border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-border bg-background/50">
                    <th className="p-3.5 font-bold text-text-primary w-1/3">SKU</th>
                    <td className="p-3.5 text-text-secondary">{product.sku}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <th className="p-3.5 font-bold text-text-primary">Material</th>
                    <td className="p-3.5 text-text-secondary">{product.material || 'Premium TPU'}</td>
                  </tr>
                  <tr className="border-b border-border bg-background/50">
                    <th className="p-3.5 font-bold text-text-primary">Finish</th>
                    <td className="p-3.5 text-text-secondary">{product.finish || 'Matte'}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <th className="p-3.5 font-bold text-text-primary">Warranty</th>
                    <td className="p-3.5 text-text-secondary">{product.warranty || '6 Months Brand Warranty'}</td>
                  </tr>
                  <tr className="border-b border-border bg-background/50">
                    <th className="p-3.5 font-bold text-text-primary">In the Box</th>
                    <td className="p-3.5 text-text-secondary">{product.package_contents || '1 Accessory Unit'}</td>
                  </tr>
                  <tr>
                    <th className="p-3.5 font-bold text-text-primary">Origin</th>
                    <td className="p-3.5 text-text-secondary">India / Authorised Stocks Only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-sm text-text-secondary max-w-2xl leading-relaxed">
              <p className="text-text-primary font-semibold text-base">Installation Instructions</p>
              <p>{product.installation_guide || 'No specialized installation guide is required for this accessory.'}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Reviews listing */}
              <div className="lg:col-span-8 space-y-6">
                <h4 className="font-bold text-base text-text-primary mb-4">Customer Feedbacks</h4>
                {reviews.length === 0 ? (
                  <p className="text-xs text-text-secondary italic">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-5 bg-card border border-border/80 rounded-modal space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex gap-0.5 text-warning mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`} />
                            ))}
                          </div>
                          <h5 className="font-bold text-sm text-text-primary">{rev.title || 'Excellent purchase'}</h5>
                        </div>
                        <span className="text-[10px] text-text-secondary">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{rev.comment}</p>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-text-secondary pt-2 border-t border-border/40">
                        <span>By {rev.full_name}</span>
                        {rev.verified_purchase && <span className="text-accent">✓ Verified Accessory Buyer</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add review form */}
              <div className="lg:col-span-4 bg-background p-6 rounded-modal border border-border/80">
                <h4 className="font-bold text-base text-text-primary mb-4">Write a Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary"
                      placeholder="Enter name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none"
                    >
                      <option value="5">5 Stars - Outstanding</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Average</option>
                      <option value="2">2 Stars - Disappointed</option>
                      <option value="1">1 Star - Terrible</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary">Comments</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-2.5 border border-border rounded-input text-xs bg-card focus:outline-none focus:border-secondary resize-none"
                      placeholder="What did you think of this accessory?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-button text-xs hover:bg-primary/95 transition-all shadow focus:outline-none"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary">Related Accessories</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="bg-card rounded-modal border border-border overflow-hidden p-4 group hover:shadow-medium hover:border-secondary/40 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-image overflow-hidden bg-background border border-border/40 relative">
                    <img src={p.images[0]} alt={p.product_name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h5 className="font-bold text-xs line-clamp-1 group-hover:text-secondary transition-colors">{p.product_name}</h5>
                    <span className="font-bold text-xs text-text-primary">₹{p.sale_price || p.price}</span>
                  </div>
                </Link>
              ))}
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
