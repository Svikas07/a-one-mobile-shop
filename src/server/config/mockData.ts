import { Brand, Category, PhoneModel, Product, Coupon, Review, Address, Order } from '@/lib/db';

export const MOCK_BRANDS: Brand[] = [
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

export const MOCK_CATEGORIES: Category[] = [
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

export const MOCK_MODELS: PhoneModel[] = [
  { id: 'm1', brand_id: 'b1', model_name: 'iPhone 16 Pro Max', model_slug: 'iphone-16-pro-max', series: 'iPhone 16', launch_year: 2024, status: 'Active' },
  { id: 'm2', brand_id: 'b1', model_name: 'iPhone 16 Pro', model_slug: 'iphone-16-pro', series: 'iPhone 16', launch_year: 2024, status: 'Active' },
  { id: 'm3', brand_id: 'b1', model_name: 'iPhone 15 Pro', model_slug: 'iphone-15-pro', series: 'iPhone 15', launch_year: 2023, status: 'Active' },
  { id: 'm4', brand_id: 'b2', model_name: 'Galaxy S25 Ultra', model_slug: 'galaxy-s25-ultra', series: 'Galaxy S25', launch_year: 2025, status: 'Active' },
  { id: 'm5', brand_id: 'b2', model_name: 'Galaxy S24 Ultra', model_slug: 'galaxy-s24-ultra', series: 'Galaxy S24', launch_year: 2024, status: 'Active' },
  { id: 'm6', brand_id: 'b3', model_name: 'OnePlus 13', model_slug: 'oneplus-13', series: 'OnePlus 13', launch_year: 2024, status: 'Active' },
  { id: 'm7', brand_id: 'b4', model_name: 'Nothing Phone 3', model_slug: 'nothing-phone-3', series: 'Nothing Phone', launch_year: 2024, status: 'Active' },
  { id: 'm8', brand_id: 'b8', model_name: 'Moto Edge 50 Ultra', model_slug: 'moto-edge-50-ultra', series: 'Edge 50', launch_year: 2024, status: 'Active' }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    product_name: 'Spigen Ultra Hybrid Matte Frost Case',
    slug: 'spigen-ultra-hybrid-matte-frost-case',
    category_id: 'c1',
    brand_id: 'b1',
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
    brand_id: 'b2',
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
    brand_id: 'b1',
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

export const MOCK_COUPONS: Coupon[] = [
  { id: 'cp1', code: 'AONE20', type: 'Percentage', value: 20, min_order_value: 500, max_discount: 200, used_count: 5, expiry_date: '2026-12-31', status: 'Active' },
  { id: 'cp2', code: 'WELCOME100', type: 'Flat', value: 100, min_order_value: 999, used_count: 14, expiry_date: '2026-12-31', status: 'Active' },
  { id: 'cp3', code: 'FREESHIP', type: 'Flat', value: 50, min_order_value: 499, used_count: 32, expiry_date: '2026-12-31', status: 'Active' }
];

export const MOCK_REVIEWS: Review[] = [
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

// Server-side in-memory mock mutable tables
export const serverMockState = {
  products: [...MOCK_PRODUCTS] as Product[],
  orders: [] as Order[],
  addresses: [
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
  ] as Address[],
  wishlists: {} as Record<string, string[]>, // Map of userId -> productIds
  coupons: [...MOCK_COUPONS] as Coupon[],
  reviews: [...MOCK_REVIEWS] as Review[]
};
