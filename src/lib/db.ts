import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

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

// INITIALIZE LOCAL DB STATE
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

// DATABASE LAYER ACCESSORS
export const db = {
  // BRANDS
  async getBrands(): Promise<Brand[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('brands').select('*').eq('status', 'Active').order('sort_order', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_BRANDS;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('categories').select('*').eq('status', 'Active').order('sort_order', { ascending: true });
      if (!error && data) return data;
    }
    return MOCK_CATEGORIES;
  },

  // PHONE MODELS
  async getPhoneModels(brandId?: string): Promise<PhoneModel[]> {
    if (isSupabaseConfigured) {
      let query = supabase!.from('phone_models').select('*').eq('status', 'Active');
      if (brandId) query = query.eq('brand_id', brandId);
      const { data, error } = await query;
      if (!error && data) return data;
    }
    
    if (brandId) {
      return MOCK_MODELS.filter(m => m.brand_id === brandId);
    }
    return MOCK_MODELS;
  },

  async getPhoneModelBySlug(slug: string): Promise<PhoneModel | undefined> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('phone_models').select('*').eq('model_slug', slug).single();
      if (!error && data) return data;
    }
    return MOCK_MODELS.find(m => m.model_slug === slug);
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
    if (isSupabaseConfigured) {
      // Real Supabase queries with joins for compatibility filter mapping
      let query = supabase!.from('products').select('*, compatibility(phone_model_id)').eq('status', 'Published');
      
      if (filters?.brandId) query = query.eq('brand_id', filters.brandId);
      if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters?.material) query = query.eq('material', filters.material);
      if (filters?.finish) query = query.eq('finish', filters.finish);
      if (filters?.color) query = query.eq('color', filters.color);
      if (filters?.speed) query = query.eq('charging_speed', filters.speed);
      
      const { data, error } = await query;
      if (!error && data) {
        let results = data.map((item: any) => ({
          ...item,
          compatibility: item.compatibility?.map((c: any) => c.phone_model_id) || []
        }));
        
        // Filter by compatibility model client-side if needed
        if (filters?.modelId) {
          results = results.filter(p => p.compatibility.includes(filters.modelId));
        }
        
        if (filters?.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          results = results.filter(p => 
            p.product_name.toLowerCase().includes(q) || 
            p.sku.toLowerCase().includes(q) ||
            p.short_description.toLowerCase().includes(q)
          );
        }

        if (filters?.minPrice) results = results.filter(p => (p.sale_price || p.price) >= filters.minPrice!);
        if (filters?.maxPrice) results = results.filter(p => (p.sale_price || p.price) <= filters.maxPrice!);

        // Sorting logic
        if (filters?.sort === 'price-low-high') results.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        else if (filters?.sort === 'price-high-low') results.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        else if (filters?.sort === 'newest') results.sort((a, b) => b.new_arrival === a.new_arrival ? 0 : b.new_arrival ? 1 : -1);
        else results.sort((a, b) => b.best_seller === a.best_seller ? 0 : b.best_seller ? 1 : -1);

        return results;
      }
    }

    // Fallback Mock Filtering logic
    let products = [...localProducts].filter(p => p.status === 'Published');

    if (filters) {
      if (filters.brandId) {
        // Handle compatible brand mappings (if phone model is mapped, brand mapping is derived)
        const brandModels = MOCK_MODELS.filter(m => m.brand_id === filters.brandId).map(m => m.id);
        products = products.filter(p => p.compatibility.some(mid => brandModels.includes(mid)));
      }
      if (filters.modelId) {
        products = products.filter(p => p.compatibility.includes(filters.modelId!));
      }
      if (filters.categoryId) {
        products = products.filter(p => p.category_id === filters.categoryId);
      }
      if (filters.material) {
        products = products.filter(p => p.material?.toLowerCase() === filters.material?.toLowerCase());
      }
      if (filters.finish) {
        products = products.filter(p => p.finish?.toLowerCase() === filters.finish?.toLowerCase());
      }
      if (filters.color) {
        products = products.filter(p => p.color?.toLowerCase().includes(filters.color!.toLowerCase()));
      }
      if (filters.speed) {
        products = products.filter(p => p.charging_speed?.toLowerCase() === filters.speed?.toLowerCase());
      }
      if (filters.minPrice !== undefined) {
        products = products.filter(p => (p.sale_price || p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(p => (p.sale_price || p.price) <= filters.maxPrice!);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        products = products.filter(p => 
          p.product_name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.full_description.toLowerCase().includes(q)
        );
      }
      if (filters.sort) {
        if (filters.sort === 'price-low-high') {
          products.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        } else if (filters.sort === 'price-high-low') {
          products.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        } else if (filters.sort === 'newest') {
          products.sort((a, b) => (b.new_arrival ? 1 : 0) - (a.new_arrival ? 1 : 0));
        } else if (filters.sort === 'popular') {
          products.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        }
      }
    }
    return products;
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('products').select('*, compatibility(phone_model_id)').eq('slug', slug).single();
      if (!error && data) {
        return {
          ...data,
          compatibility: data.compatibility?.map((c: any) => c.phone_model_id) || []
        };
      }
    }
    return localProducts.find(p => p.slug === slug);
  },

  // REVIEWS
  async getReviews(productId: string): Promise<Review[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('reviews').select('*').eq('product_id', productId).eq('status', 'Approved');
      if (!error && data) return data;
    }
    return MOCK_REVIEWS.filter(r => r.product_id === productId);
  },

  async addReview(productId: string, review: Omit<Review, 'id' | 'created_at' | 'helpful_count'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      helpful_count: 0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('reviews').insert([{ ...newReview, product_id: productId }]).select().single();
      if (!error && data) return data;
    }

    MOCK_REVIEWS.unshift(newReview);
    return newReview;
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('coupons').select('*').eq('status', 'Active');
      if (!error && data) return data;
    }
    return MOCK_COUPONS;
  },

  async validateCoupon(code: string, orderTotal: number): Promise<{ success: boolean; discount: number; message: string }> {
    const coupon = (await this.getCoupons()).find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      return { success: false, discount: 0, message: 'Invalid Coupon Code' };
    }
    if (coupon.status !== 'Active') {
      return { success: false, discount: 0, message: 'Coupon is inactive' };
    }
    if (orderTotal < coupon.min_order_value) {
      return { success: false, discount: 0, message: `Minimum purchase of ₹${coupon.min_order_value} required` };
    }
    
    let discount = 0;
    if (coupon.type === 'Percentage') {
      discount = (orderTotal * coupon.value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else if (coupon.type === 'Flat') {
      discount = coupon.value;
    }

    return { success: true, discount, message: 'Coupon applied successfully!' };
  },

  // WISHLIST
  async getWishlistItems(): Promise<Product[]> {
    const list = getLocalState<string[]>('aone_wishlist', localWishlist);
    const activeProducts = await this.getProducts();
    return activeProducts.filter(p => list.includes(p.id));
  },

  async toggleWishlist(productId: string): Promise<boolean> {
    let list = getLocalState<string[]>('aone_wishlist', localWishlist);
    let added = false;
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
      added = true;
    }
    localWishlist = list;
    saveLocalState('aone_wishlist', list);
    return added;
  },

  // ADDRESSES
  async getAddresses(): Promise<Address[]> {
    return getLocalState<Address[]>('aone_addresses', localAddresses);
  },

  async saveAddress(address: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
    let list = getLocalState<Address[]>('aone_addresses', localAddresses);
    let result: Address;

    if (address.id) {
      list = list.map(a => {
        if (a.id === address.id) {
          return { ...a, ...address } as Address;
        }
        if (address.is_default) {
          return { ...a, is_default: false };
        }
        return a;
      });
      result = list.find(a => a.id === address.id)!;
    } else {
      const id = 'addr_' + Math.random().toString(36).substr(2, 9);
      result = { ...address, id } as Address;
      if (address.is_default) {
        list = list.map(a => ({ ...a, is_default: false }));
      }
      list.push(result);
    }

    localAddresses = list;
    saveLocalState('aone_addresses', list);
    return result;
  },

  async deleteAddress(addressId: string): Promise<void> {
    let list = getLocalState<Address[]>('aone_addresses', localAddresses);
    list = list.filter(a => a.id !== addressId);
    localAddresses = list;
    saveLocalState('aone_addresses', list);
  },

  // ORDERS
  async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'order_status' | 'payment_status'>): Promise<Order> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AO-${new Date().getFullYear()}-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      order_number: orderNumber,
      order_status: 'Pending',
      payment_status: orderData.payment_method === 'COD' ? 'Pending' : 'Captured',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Decrement local inventory stock
    for (const item of newOrder.items) {
      localProducts = localProducts.map(p => {
        if (p.id === item.product_id) {
          const newStock = Math.max(0, p.stock - item.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      });
    }

    // Save updated products and orders
    saveLocalState('aone_products', localProducts);
    
    let list = getLocalState<Order[]>('aone_orders', localOrders);
    list.unshift(newOrder);
    localOrders = list;
    saveLocalState('aone_orders', list);

    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    return getLocalState<Order[]>('aone_orders', localOrders);
  },

  async getOrderDetails(orderNumber: string): Promise<Order | undefined> {
    const list = await this.getOrders();
    return list.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());
  },

  async trackOrder(orderNumber: string, contact: string): Promise<Order | undefined> {
    const list = await this.getOrders();
    const cleanContact = contact.trim().toLowerCase();
    
    return list.find(o => 
      o.order_number.toUpperCase() === orderNumber.toUpperCase() && 
      (o.guest_email?.toLowerCase() === cleanContact || 
       o.guest_phone === cleanContact ||
       o.address_snapshot.phone_number === cleanContact ||
       o.address_snapshot.email?.toLowerCase() === cleanContact)
    );
  },

  // ADMIN OPERATIONS
  async getAdminKPIs(): Promise<{
    revenue: number;
    ordersCount: number;
    productsCount: number;
    lowStockCount: number;
    pendingCount: number;
    recentOrders: Order[];
    salesChart: { label: string; value: number }[];
  }> {
    const list = await this.getOrders();
    const products = await this.getProducts();

    const revenue = list
      .filter(o => o.order_status !== 'Cancelled')
      .reduce((sum, o) => sum + o.grand_total, 0);

    const lowStockCount = products.filter(p => p.stock <= p.low_stock_limit).length;
    const pendingCount = list.filter(o => o.order_status === 'Pending').length;

    // Build standard sales chart (last 7 orders or days)
    const salesChart = list.slice(0, 7).reverse().map(o => ({
      label: o.order_number,
      value: o.grand_total
    }));

    return {
      revenue,
      ordersCount: list.length,
      productsCount: products.length,
      lowStockCount,
      pendingCount,
      recentOrders: list.slice(0, 5),
      salesChart
    };
  },

  async adminCreateProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const id = 'p_' + Math.random().toString(36).substr(2, 9);
    const newProduct: Product = { ...productData, id };
    
    localProducts.unshift(newProduct);
    saveLocalState('aone_products', localProducts);
    return newProduct;
  },

  async adminUpdateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    localProducts = localProducts.map(p => {
      if (p.id === id) {
        return { ...p, ...productData } as Product;
      }
      return p;
    });
    saveLocalState('aone_products', localProducts);
    return localProducts.find(p => p.id === id)!;
  },

  async adminDeleteProduct(id: string): Promise<void> {
    localProducts = localProducts.filter(p => p.id !== id);
    saveLocalState('aone_products', localProducts);
  },

  async adminUpdateOrderStatus(orderId: string, updates: {
    order_status?: Order['order_status'];
    payment_status?: Order['payment_status'];
    tracking_number?: string;
    courier_name?: string;
  }): Promise<Order> {
    let list = getLocalState<Order[]>('aone_orders', localOrders);
    list = list.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          ...updates,
          updated_at: new Date().toISOString()
        } as Order;
      }
      return o;
    });
    localOrders = list;
    saveLocalState('aone_orders', list);
    return localOrders.find(o => o.id === orderId)!;
  }
};
