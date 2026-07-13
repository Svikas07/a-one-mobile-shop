// TYPES Definition
export interface Brand {
  id: string;
  brand_name: string;
  brand_slug: string;
  brand_logo?: string;
  status: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  parent_category?: string | null;
  description?: string;
  status: string;
  sort_order: number;
}

export interface PhoneModel {
  id: string;
  brand_id: string;
  model_name: string;
  model_slug: string;
  series?: string;
  launch_year?: number;
  image?: string;
  status: string;
}

export interface Product {
  id: string;
  product_name: string;
  slug: string;
  category_id: string;
  brand_id: string; // Accessory brand (e.g. Spigen)
  sku: string;
  barcode?: string;
  short_description: string;
  full_description: string;
  price: number;
  sale_price?: number;
  gst?: number;
  stock: number;
  low_stock_limit: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status: string; // Published, Draft, Hidden
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  trending: boolean;
  material?: string;
  finish?: string;
  color?: string;
  connector_type?: string;
  charging_speed?: string;
  output_power?: string;
  cable_length?: string;
  warranty?: string;
  package_contents?: string;
  installation_guide?: string;
  images: string[];
  compatibility: string[]; // Phone Model IDs
}

export interface Coupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Flat' | 'BuyXGetY';
  value: number;
  min_order_value: number;
  max_discount?: number;
  expiry_date: string;
  used_count: number;
  status: string;
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone_number: string;
  alt_phone_number?: string;
  email?: string;
  house_no: string;
  street: string;
  area?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  address_type: 'Home' | 'Office' | 'Other';
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  price: number;
  quantity: number;
  compatibility_snapshot?: string;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  guest_phone?: string;
  address_snapshot: Address;
  subtotal: number;
  gst_amount: number;
  shipping_charges: number;
  discount_amount: number;
  coupon_code?: string;
  grand_total: number;
  payment_method: string;
  payment_status: 'Pending' | 'Authorized' | 'Captured' | 'Failed' | 'Refunded';
  order_status: 'Pending' | 'Confirmed' | 'Packed' | 'Ready To Ship' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded';
  tracking_number?: string;
  courier_name?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  full_name: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

// ----------------------
// SEED MOCK DATA
// ----------------------

const MOCK_BRANDS: Brand[] = [
  { id: 'b1', brand_name: 'Apple', brand_slug: 'apple', status: 'Active', sort_order: 1 },
  { id: 'b2', brand_name: 'Samsung', brand_slug: 'samsung', status: 'Active', sort_order: 2 },
  { id: 'b3', brand_name: 'OnePlus', brand_slug: 'oneplus', status: 'Active', sort_order: 3 },
  { id: 'b4', brand_name: 'Nothing', brand_slug: 'nothing', status: 'Active', sort_order: 4 },
  { id: 'b5', brand_name: 'Google', brand_slug: 'google', status: 'Active', sort_order: 5 },
  { id: 'b6', brand_name: 'Xiaomi', brand_slug: 'xiaomi', status: 'Active', sort_order: 6 },
  { id: 'b7', brand_name: 'Realme', brand_slug: 'realme', status: 'Active', sort_order: 7 },
  { id: 'b8', brand_name: 'Motorola', brand_slug: 'motorola', status: 'Active', sort_order: 8 },
  { id: 'b9', brand_name: 'Poco', brand_slug: 'poco', status: 'Active', sort_order: 9 },
  { id: 'b10', brand_name: 'Vivo', brand_slug: 'vivo', status: 'Active', sort_order: 10 }
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Mobile Covers', slug: 'mobile-covers', description: 'Premium protection styles', status: 'Active', sort_order: 1 },
  { id: 'c2', name: 'Tempered Glass', slug: 'tempered-glass', description: '9H hardness drop guards', status: 'Active', sort_order: 2 },
  { id: 'c3', name: 'Privacy Glass', slug: 'privacy-glass', description: 'Side angle anti-spy shield', status: 'Active', sort_order: 3 },
  { id: 'c4', name: 'Camera Lens Protector', slug: 'lens-protector', description: 'Scratch-free metal rings', status: 'Active', sort_order: 4 },
  { id: 'c5', name: 'Fast Chargers', slug: 'fast-chargers', description: 'GaN high speed adapters', status: 'Active', sort_order: 5 },
  { id: 'c6', name: 'Power Banks', slug: 'power-banks', description: 'Portable backup fuel packs', status: 'Active', sort_order: 6 },
  { id: 'c7', name: 'USB Cables', slug: 'usb-cables', description: 'Braided high-amp speed cords', status: 'Active', sort_order: 7 },
  { id: 'c8', name: 'TWS Earbuds', slug: 'tws', description: 'True wireless high-fidelity sound', status: 'Active', sort_order: 8 },
  { id: 'c9', name: 'Neckbands', slug: 'neckbands', description: 'Magnetic buds with long battery life', status: 'Active', sort_order: 9 },
  { id: 'c10', name: 'Phone Holders', slug: 'phone-holders', description: 'Car dash and desk mounting grips', status: 'Active', sort_order: 10 }
];

const MOCK_MODELS: PhoneModel[] = [
  { id: 'm1', brand_id: 'b1', model_name: 'iPhone 16 Pro Max', model_slug: 'iphone-16-pro-max', series: 'iPhone 16', launch_year: 2024, status: 'Active' },
  { id: 'm2', brand_id: 'b1', model_name: 'iPhone 16 Pro', model_slug: 'iphone-16-pro', series: 'iPhone 16', launch_year: 2024, status: 'Active' },
  { id: 'm3', brand_id: 'b1', model_name: 'iPhone 15 Pro', model_slug: 'iphone-15-pro', series: 'iPhone 15', launch_year: 2023, status: 'Active' },
  { id: 'm4', brand_id: 'b2', model_name: 'Galaxy S25 Ultra', model_slug: 'galaxy-s25-ultra', series: 'Galaxy S25', launch_year: 2025, status: 'Active' },
  { id: 'm5', brand_id: 'b2', model_name: 'Galaxy S24 Ultra', model_slug: 'galaxy-s24-ultra', series: 'Galaxy S24', launch_year: 2024, status: 'Active' },
  { id: 'm6', brand_id: 'b3', model_name: 'OnePlus 13', model_slug: 'oneplus-13', series: 'OnePlus 13', launch_year: 2024, status: 'Active' },
  { id: 'm7', brand_id: 'b4', model_name: 'Nothing Phone 3', model_slug: 'nothing-phone-3', series: 'Nothing Phone', launch_year: 2024, status: 'Active' },
  { id: 'm8', brand_id: 'b8', model_name: 'Moto Edge 50 Ultra', model_slug: 'moto-edge-50-ultra', series: 'Edge 50', launch_year: 2024, status: 'Active' }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    product_name: 'Spigen Ultra Hybrid Matte Frost Case',
    slug: 'spigen-ultra-hybrid-matte-frost-case',
    category_id: 'c1',
    brand_id: 'b1', // Apple compatible accessory
    sku: 'SPG-UH-IP16PM-FR',
    short_description: 'Premium PC back plate and TPU bumper case with fingerprint resistant matte finish.',
    full_description: 'Designed specifically to accentuate the premium look of your smartphone. The Spigen Ultra Hybrid Matte Frost case features a drop-tested polycarbonate back plate infused with anti-yellowing technology, framed by a soft shock-absorbent TPU bumper. Zero bulk, raised camera protection ridges, and tactical tactile buttons ensure maximum usability with minimal distraction. Fully MagSafe compatible.',
    price: 1899,
    sale_price: 1499,
    stock: 25,
    low_stock_limit: 5,
    status: 'Published',
    featured: true,
    best_seller: true,
    new_arrival: true,
    trending: true,
    material: 'Silicone & TPU',
    finish: 'Matte',
    color: 'Frost Black',
    warranty: '6 Months Manufacturer Warranty',
    package_contents: '1 Case, 1 Authenticity Card',
    installation_guide: 'Gently slip the top corner of your phone into the case first, then press the bottom corners into place until fully seated.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    compatibility: ['m1', 'm2']
  },
  {
    id: 'p2',
    product_name: 'A-One Premium 9H Curved Tempered Glass',
    slug: 'aone-premium-9h-curved-tempered-glass',
    category_id: 'c2',
    brand_id: 'b2', // Samsung compatible accessory
    sku: 'AO-TG-S25U-CV',
    short_description: 'Full coverage 9H hardness tempered glass with oleophobic fingerprint-resistant coating.',
    full_description: 'A-One Custom Shield screen protector offers flawless visual clarity and high touch response sensitivity. Specially engineered with 9H hardness layer and 3D curved round edges, it seamlessly fits the curved screen contour of the Galaxy S25 Ultra. The premium Japanese glass features an advanced oleophobic coating that repels natural skin oils and smudge marks.',
    price: 799,
    sale_price: 499,
    stock: 120,
    low_stock_limit: 10,
    status: 'Published',
    featured: true,
    best_seller: false,
    new_arrival: true,
    trending: true,
    material: 'Tempered Glass',
    finish: 'Transparent',
    color: 'Clear Black Border',
    warranty: '1 Month Replacement Warranty',
    package_contents: '1 Tempered Glass, 1 Wet Wipe, 1 Microfiber Cloth, 1 Dust Sticker',
    installation_guide: 'Clean the phone screen with the wet wipe, followed by the dry cloth. Align the screen protector starting from the top speaker grille, slowly release, and swipe down the middle to activate auto-adhesion.',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    compatibility: ['m4', 'm5']
  },
  {
    id: 'p3',
    product_name: 'Anker PowerPort 65W GaN Dual USB-C Fast Charger',
    slug: 'anker-powerport-65w-gan-fast-charger',
    category_id: 'c5',
    brand_id: 'b1', // Compatible brand
    sku: 'ANK-PP-65W-GAN',
    short_description: 'High-speed 65W GaN charger with twin USB-C ports and folding pins.',
    full_description: 'Powered by Gallium Nitride (GaN) technology, this ultra-compact adapter delivers blazing fast charge times while running significantly cooler. Equipped with dual PowerIQ 3.0 USB-C ports, it lets you charge both your laptop and phone simultaneously from a single outlet. Outputs up to 65W maximum when a single port is used, ensuring 0 to 50% battery in just 25 minutes for compatible models.',
    price: 3499,
    sale_price: 2999,
    stock: 3,
    low_stock_limit: 4,
    status: 'Published',
    featured: true,
    best_seller: true,
    new_arrival: false,
    trending: true,
    connector_type: 'USB-C',
    charging_speed: '65W',
    output_power: '65W Max',
    warranty: '18 Months Replacement Guarantee',
    package_contents: '1 Charger Adapter, User Manual',
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
    ],
    compatibility: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7']
  },
  {
    id: 'p4',
    product_name: 'A-One Braided Type-C to Type-C 100W Cable',
    slug: 'aone-braided-usb-c-to-usb-c-100w-cable',
    category_id: 'c7',
    brand_id: 'b3',
    sku: 'AO-CBL-CC100W-1M',
    short_description: '1.2m double-braided nylon charging cord supporting 100W PD and 480Mbps data transfer.',
    full_description: 'Built to survive extreme bends, A-One heavy duty nylon braided cables support high-density Power Delivery charging up to 100W. Integrates an e-marker smart chip that safely auto-negotiates power rates depending on the device. Fully compatible with Apple, Samsung, OnePlus, and Nothing fast charging standards.',
    price: 599,
    sale_price: 349,
    stock: 45,
    low_stock_limit: 8,
    status: 'Published',
    featured: false,
    best_seller: true,
    new_arrival: true,
    trending: false,
    material: 'Nylon Braided',
    connector_type: 'USB-C to USB-C',
    charging_speed: '100W PD',
    cable_length: '1.2m',
    warranty: '1 Year Brand Warranty',
    package_contents: '1 Braided USB-C Cable, 1 Velcro Strap',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'
    ],
    compatibility: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']
  },
  {
    id: 'p5',
    product_name: 'Nothing Ear (a) Premium ANC Earbuds',
    slug: 'nothing-ear-a-premium-anc-earbuds',
    category_id: 'c8',
    brand_id: 'b4',
    sku: 'NOT-EARA-ANC',
    short_description: 'True Wireless earbuds with Active Noise Cancellation, transparent case design, and deep bass.',
    full_description: 'True style meets acoustics. Nothing Ear (a) earbuds boast a striking yellow-transparent bubble case design with 45dB of hybrid Active Noise Cancellation. Programmed with customized 11mm dynamic drivers, low-lag gaming mode, LDAC audio certification, and up to 42.5 hours of battery life with fast charging support (10 min charge = 10 hrs playback).',
    price: 7999,
    sale_price: 6999,
    stock: 18,
    low_stock_limit: 3,
    status: 'Published',
    featured: true,
    best_seller: true,
    new_arrival: true,
    trending: true,
    warranty: '1 Year Domestic Warranty',
    package_contents: '2 Earbuds, 1 Charging Case, 3 Pairs of Eartips (S/M/L), USB-C Cable',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    ],
    compatibility: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']
  },
  {
    id: 'p6',
    product_name: 'Spigen Tough Armor Heavy Duty Case',
    slug: 'spigen-tough-armor-heavy-duty-case',
    category_id: 'c1',
    brand_id: 'b2',
    sku: 'SPG-TA-S25U-BK',
    short_description: 'Extreme dual-layer drop protection cover with built-in kickstand for viewing comfort.',
    full_description: 'Spigen’s best selling heavy duty cover. Tough Armor relies on an dual layer composite shell comprising a rigid PC outer back panel and a custom impact foam lined TPU inner glove. Certified to US Military Drop-Test standards. A built-in metal kickstand sits flush in the frame and pops open to support landscape hands-free viewing angles.',
    price: 2499,
    sale_price: 1999,
    stock: 12,
    low_stock_limit: 3,
    status: 'Published',
    featured: false,
    best_seller: true,
    new_arrival: false,
    trending: true,
    material: 'PC & Shockproof TPU Foam',
    finish: 'Matte Grid',
    color: 'Carbon Black',
    warranty: '6 Months Manufacturer Warranty',
    package_contents: '1 Heavy Duty Case',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    compatibility: ['m4', 'm5']
  }
];

const MOCK_COUPONS: Coupon[] = [
  { id: 'cp1', code: 'AONE20', type: 'Percentage', value: 20, min_order_value: 500, max_discount: 200, used_count: 5, expiry_date: '2026-12-31', status: 'Active' },
  { id: 'cp2', code: 'WELCOME100', type: 'Flat', value: 100, min_order_value: 999, used_count: 14, expiry_date: '2026-12-31', status: 'Active' },
  { id: 'cp3', code: 'FREESHIP', type: 'Flat', value: 50, min_order_value: 499, used_count: 32, expiry_date: '2026-12-31', status: 'Active' }
];

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    product_id: 'p1',
    full_name: 'Vikas Sharma',
    rating: 5,
    title: 'Outstanding Quality Case!',
    comment: 'The matte finish is really beautiful and keeps the phone looking clean. Fits my iPhone 16 Pro Max like a glove. Highly recommended!',
    verified_purchase: true,
    helpful_count: 12,
    created_at: '2026-06-25T12:00:00Z'
  },
  {
    id: 'r2',
    product_id: 'p1',
    full_name: 'Anjali Gupta',
    rating: 4,
    title: 'Very solid cover',
    comment: 'Very premium packaging and good drop safety. It is slightly expensive, but absolutely worth it to protect a high end device.',
    verified_purchase: true,
    helpful_count: 5,
    created_at: '2026-07-02T15:30:00Z'
  },
  {
    id: 'r3',
    product_id: 'p3',
    full_name: 'Mohit Kumar',
    rating: 5,
    title: 'Charges super fast!',
    comment: 'Using it with my Galaxy S24 Ultra, charging speed is exactly as advertised. Compact design and lightweight.',
    verified_purchase: true,
    helpful_count: 8,
    created_at: '2026-07-08T09:45:00Z'
  }
];

// Helper to handle local storage state safely in Next.js SSR environment
const getLocalState = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveLocalState = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local state:', e);
  }
};

// INITIALIZE LOCAL DB STATE FOR OFFLINE FALLBACK
let localProducts: Product[] = [];
let localOrders: Order[] = [];
let localAddresses: Address[] = [
  {
    id: 'ad1',
    full_name: 'Vikas Sharma',
    phone_number: '9876543210',
    email: 'vikas@aonemobile.com',
    house_no: 'Shop 24, First Floor',
    street: 'Sector 15 Market',
    area: 'Near Town Hall',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    country: 'India',
    address_type: 'Office',
    is_default: true
  }
];
let localWishlist: string[] = ['p1', 'p5'];

if (typeof window !== 'undefined') {
  localProducts = getLocalState('aone_products', MOCK_PRODUCTS);
  localOrders = getLocalState('aone_orders', []);
  localAddresses = getLocalState('aone_addresses', localAddresses);
  localWishlist = getLocalState('aone_wishlist', localWishlist);
} else {
  localProducts = MOCK_PRODUCTS;
  localOrders = [];
}

// REST CLIENT FETCH HELPERS
const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('aone_session_token') || '';
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const res = await fetch(url, { ...options, headers });
  const result = await res.json();
  
  if (!res.ok) {
    throw new Error(result.error || 'API Request failed');
  }
  return result.data;
};

// DATABASE LAYER ACCESSORS REDIRECTED TO BACKEND API
export const db = {
  // BRANDS
  async getBrands(): Promise<Brand[]> {
    return apiFetch('/api/brands');
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    return apiFetch('/api/categories');
  },

  // PHONE MODELS
  async getPhoneModels(brandId?: string): Promise<PhoneModel[]> {
    const url = brandId ? `/api/models?brandId=${brandId}` : '/api/models';
    return apiFetch(url);
  },

  async getPhoneModelBySlug(slug: string): Promise<PhoneModel | null> {
    return apiFetch(`/api/models?slug=${slug}`);
  },

  // PRODUCTS
  async getProducts(filters?: {
    brandId?: string;
    modelId?: string;
    categoryId?: string;
    material?: string;
    finish?: string;
    color?: string;
    speed?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    sort?: string;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/api/products?${queryString}` : '/api/products';
    return apiFetch(url);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return apiFetch(`/api/products/${slug}`);
  },

  // REVIEWS
  async getReviews(productId: string): Promise<Review[]> {
    return apiFetch(`/api/reviews?productId=${productId}`);
  },

  async addReview(productId: string, review: Omit<Review, 'id' | 'created_at' | 'helpful_count'>): Promise<Review> {
    return apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, ...review }),
    });
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    return apiFetch('/api/admin/coupons');
  },

  async validateCoupon(code: string, orderTotal: number): Promise<{ success: boolean; discount: number; message: string }> {
    return apiFetch('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderTotal }),
    });
  },

  // WISHLIST (WITH CLIENT FALLBACK FOR GUESTS)
  async getWishlistItems(): Promise<Product[]> {
    const token = getAuthToken();
    let productIds: string[] = [];
    if (!token) {
      productIds = getLocalState<string[]>('aone_wishlist', localWishlist);
    } else {
      try {
        productIds = await apiFetch('/api/wishlist');
      } catch (e) {
        console.warn('API Wishlist error, using local fallback:', e);
        productIds = getLocalState<string[]>('aone_wishlist', localWishlist);
      }
    }
    const activeProducts = await this.getProducts();
    return activeProducts.filter(p => productIds.includes(p.id));
  },

  async toggleWishlist(productId: string): Promise<boolean> {
    const token = getAuthToken();
    if (!token) {
      let wishlist = getLocalState<string[]>('aone_wishlist', localWishlist);
      let added = false;
      const index = wishlist.indexOf(productId);
      if (index > -1) {
        wishlist = wishlist.filter(id => id !== productId);
      } else {
        wishlist.push(productId);
        added = true;
      }
      localWishlist = wishlist;
      saveLocalState('aone_wishlist', wishlist);
      return added;
    }
    
    const updatedList: string[] = await apiFetch('/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    return updatedList.includes(productId);
  },

  // ADDRESSES (WITH CLIENT FALLBACK FOR GUESTS)
  async getAddresses(): Promise<Address[]> {
    const token = getAuthToken();
    if (!token) {
      return getLocalState<Address[]>('aone_addresses', localAddresses);
    }
    try {
      return await apiFetch('/api/addresses');
    } catch (e) {
      console.warn('API Addresses error, using local fallback:', e);
      return getLocalState<Address[]>('aone_addresses', localAddresses);
    }
  },

  async saveAddress(address: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
    const token = getAuthToken();
    if (!token) {
      let list = getLocalState<Address[]>('aone_addresses', localAddresses);
      let result: Address;
      if (address.id) {
        list = list.map(a => {
          if (a.id === address.id) return { ...a, ...address } as Address;
          if (address.is_default) return { ...a, is_default: false };
          return a;
        });
        result = list.find(a => a.id === address.id)!;
      } else {
        const id = 'addr_' + Math.random().toString(36).substring(2, 11);
        result = { ...address, id } as Address;
        if (address.is_default) {
          list = list.map(a => ({ ...a, is_default: false }));
        }
        list.push(result);
      }
      localAddresses = list;
      saveLocalState('aone_addresses', list);
      return result;
    }

    if (address.id && address.id.startsWith('addr_') === false && address.id.length > 20) {
      return apiFetch(`/api/addresses/${address.id}`, {
        method: 'PUT',
        body: JSON.stringify(address),
      });
    } else {
      return apiFetch('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });
    }
  },

  async deleteAddress(addressId: string): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      let list = getLocalState<Address[]>('aone_addresses', localAddresses);
      list = list.filter(a => a.id !== addressId);
      localAddresses = list;
      saveLocalState('aone_addresses', list);
      return;
    }
    
    return apiFetch(`/api/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  // ORDERS (WITH CLIENT FALLBACK FOR GUESTS)
  async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'order_status' | 'payment_status'>): Promise<Order> {
    const token = getAuthToken();
    try {
      return await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (e) {
      if (!token) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `AO-${new Date().getFullYear()}-${randomSuffix}`;
        const newOrder: Order = {
          ...orderData,
          id: 'ord_' + Math.random().toString(36).substring(2, 11),
          order_number: orderNumber,
          order_status: 'Pending',
          payment_status: orderData.payment_method === 'COD' ? 'Pending' : 'Captured',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localProducts = localProducts.map(p => {
          const item = orderData.items.find((i: any) => i.product_id === p.id);
          if (item) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        });
        saveLocalState('aone_products', localProducts);
        
        let list = getLocalState<Order[]>('aone_orders', localOrders);
        list.unshift(newOrder);
        localOrders = list;
        saveLocalState('aone_orders', list);
        return newOrder;
      }
      throw e;
    }
  },

  async getOrders(): Promise<Order[]> {
    const token = getAuthToken();
    if (!token) {
      return getLocalState<Order[]>('aone_orders', localOrders);
    }
    try {
      return await apiFetch('/api/orders');
    } catch (e) {
      console.warn('API Orders error, using local fallback:', e);
      return getLocalState<Order[]>('aone_orders', localOrders);
    }
  },

  async getOrderDetails(orderNumber: string): Promise<Order | null> {
    return apiFetch(`/api/orders/${orderNumber}`);
  },

  async trackOrder(orderNumber: string, contact: string): Promise<Order | null> {
    return apiFetch('/api/orders/track', {
      method: 'POST',
      body: JSON.stringify({ orderNumber, contact }),
    });
  },

  // ADMIN OPERATIONS (PROTECTED)
  async getAdminKPIs(): Promise<any> {
    return apiFetch('/api/admin/kpis');
  },

  async adminCreateProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    return apiFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async adminUpdateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return apiFetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async adminDeleteProduct(id: string): Promise<void> {
    return apiFetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async adminUpdateOrderStatus(orderId: string, updates: any): Promise<Order> {
    return apiFetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
};
