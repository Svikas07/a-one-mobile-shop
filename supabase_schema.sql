-- A-One Mobile Store - Supabase PostgreSQL Schema Definition
-- Supports 100,000+ products, millions of orders, and multi-warehouse ready.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Enums
create type user_role as enum ('Customer', 'Admin', 'Manager', 'Inventory Staff', 'Support Staff');
create type order_status as enum ('Pending', 'Confirmed', 'Packed', 'Ready To Ship', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded');
create type payment_status as enum ('Pending', 'Authorized', 'Captured', 'Failed', 'Refunded');
create type coupon_type as enum ('Percentage', 'Flat', 'BuyXGetY');
create type address_type as enum ('Home', 'Office', 'Other');

-- 1. Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    phone text,
    full_name text,
    avatar_url text,
    role user_role default 'Customer'::user_role,
    status text default 'Active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles
    for select using (true);

create policy "Users can update their own profiles" on public.profiles
    for update using (auth.uid() = id);

-- 2. Brands Table (Mobile Brands: Apple, Samsung, etc.)
create table if not exists public.brands (
    id uuid default uuid_generate_v4() primary key,
    brand_name text not null unique,
    brand_slug text not null unique,
    brand_logo text,
    status text default 'Active',
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Categories Table (Mobile Covers, Tempered Glass, etc.)
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    slug text not null unique,
    image text,
    banner text,
    parent_category uuid references public.categories(id) on delete set null,
    description text,
    status text default 'Active',
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Phone Models Table (iPhone 15 Pro, Galaxy S24 Ultra, etc.)
create table if not exists public.phone_models (
    id uuid default uuid_generate_v4() primary key,
    brand_id uuid references public.brands(id) on delete cascade not null,
    model_name text not null,
    model_slug text not null unique,
    series text,
    launch_year integer,
    image text,
    status text default 'Active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Products Table (Accessories Only - NO Smartphones)
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    product_name text not null,
    slug text not null unique,
    category_id uuid references public.categories(id) on delete set null,
    brand_id uuid references public.brands(id) on delete set null, -- Accessory brand (e.g., Spigen, ESR)
    sku text unique not null,
    barcode text,
    short_description text,
    full_description text,
    price decimal(10,2) not null check (price >= 0),
    sale_price decimal(10,2) check (sale_price >= 0),
    gst decimal(5,2) default 18.00, -- GST percentage (default 18% for mobile accessories)
    stock integer default 0 check (stock >= 0),
    low_stock_limit integer default 5,
    weight decimal(6,2), -- in grams
    length decimal(5,2), -- in cm
    width decimal(5,2), -- in cm
    height decimal(5,2), -- in cm
    status text default 'Published', -- Draft, Published, Hidden
    featured boolean default false,
    best_seller boolean default false,
    new_arrival boolean default false,
    trending boolean default false,
    -- Extra specific attributes for accessories
    material text, -- Silicone, Leather, Glass, TPU, Carbon Fiber
    finish text, -- Matte, Glossy, Transparent, Printed
    color text, -- Black, White, Blue, Red, Green, etc.
    connector_type text, -- USB-C, Lightning, Micro USB, USB-A
    charging_speed text, -- 18W, 20W, 45W, 65W, 100W, etc.
    output_power text, -- for chargers/powerbanks
    cable_length text, -- for cables
    warranty text, -- Warranty description
    package_contents text, -- Items included in box
    installation_guide text, -- Instructions
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Product Images
create table if not exists public.product_images (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    image_url text not null,
    is_featured boolean default false,
    sort_order integer default 0,
    alt_text text
);

-- 7. Phone Compatibility Table (Many-to-Many map for products to phone models)
create table if not exists public.compatibility (
    product_id uuid references public.products(id) on delete cascade not null,
    phone_model_id uuid references public.phone_models(id) on delete cascade not null,
    status text default 'Active',
    primary key (product_id, phone_model_id)
);

-- 8. Coupons Table
create table if not exists public.coupons (
    id uuid default uuid_generate_v4() primary key,
    code text unique not null,
    type coupon_type default 'Percentage'::coupon_type,
    value decimal(10,2) not null,
    min_order_value decimal(10,2) default 0,
    max_discount decimal(10,2),
    expiry_date timestamp with time zone not null,
    usage_limit integer,
    used_count integer default 0,
    status text default 'Active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Addresses Table
create table if not exists public.addresses (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    full_name text not null,
    phone_number text not null,
    alt_phone_number text,
    email text,
    house_no text not null,
    street text not null,
    area text,
    landmark text,
    city text not null,
    state text not null,
    pincode text not null,
    country text default 'India',
    address_type address_type default 'Home'::address_type,
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Orders Table
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    order_number text unique not null,
    user_id uuid references public.profiles(id) on delete set null,
    guest_email text,
    guest_phone text,
    address_snapshot jsonb not null, -- snapshot of shipping address
    subtotal decimal(10,2) not null,
    gst_amount decimal(10,2) not null,
    shipping_charges decimal(10,2) default 0,
    discount_amount decimal(10,2) default 0,
    coupon_code text,
    grand_total decimal(10,2) not null,
    payment_method text not null, -- COD, Razorpay, UPI, etc.
    payment_status payment_status default 'Pending'::payment_status,
    order_status order_status default 'Pending'::order_status,
    tracking_number text,
    courier_name text,
    invoice_url text,
    internal_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Order Items Table
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    product_name text not null, -- snapshot of name
    sku text not null,
    price decimal(10,2) not null,
    quantity integer not null,
    compatibility_snapshot text -- comma separated models supported by this item
);

-- 12. Reviews Table
create table if not exists public.reviews (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    rating integer not null check (rating >= 1 and rating <= 5),
    title text,
    comment text,
    images text[],
    verified_purchase boolean default false,
    helpful_count integer default 0,
    status text default 'Approved', -- Pending, Approved, Rejected
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Wishlist Table
create table if not exists public.wishlist (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id)
);

-- 14. Newsletter Subscribers
create table if not exists public.newsletter (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Contact Messages
create table if not exists public.contact_messages (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text not null,
    phone text,
    message text not null,
    status text default 'Unread', -- Unread, Read, Replied
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. Audit Logs Table
create table if not exists public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid,
    action text not null,
    table_name text not null,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for Fast Query Performance
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_phone_models_slug on public.phone_models(model_slug);
create index if not exists idx_compatibility_product on public.compatibility(product_id);
create index if not exists idx_compatibility_model on public.compatibility(phone_model_id);
create index if not exists idx_orders_number on public.orders(order_number);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- TRIGGERS & PROCEDURES

-- Update updated_at procedure
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger tr_products_updated_at
    before update on public.products
    for each row execute procedure public.handle_updated_at();

create trigger tr_orders_updated_at
    before update on public.orders
    for each row execute procedure public.handle_updated_at();

-- Automatically decrement stock trigger on order item creation
create or replace function public.decrement_stock_on_order()
returns trigger as $$
begin
    update public.products
    set stock = stock - new.quantity
    where id = new.product_id;
    return new;
end;
$$ language plpgsql;

create trigger tr_order_items_decrement_stock
    after insert on public.order_items
    for each row execute procedure public.decrement_stock_on_order();

-- Automatically create profile on new user registration sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, phone, role, status)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', 'Customer'),
        coalesce(new.raw_user_meta_data->>'phone', ''),
        'Customer'::public.user_role,
        'Active'
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- RLS Enablement on other tables
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.phone_models enable row level security;
alter table public.products enable row level security;
alter table public.compatibility enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;

-- Set up basic access policies for general tables (viewable by all, writable by admins)
create policy "Everyone can view brands" on public.brands for select using (status = 'Active');
create policy "Everyone can view categories" on public.categories for select using (status = 'Active');
create policy "Everyone can view phone models" on public.phone_models for select using (status = 'Active');
create policy "Everyone can view products" on public.products for select using (status = 'Published');
create policy "Everyone can view compatibility mapping" on public.compatibility for select using (true);
create policy "Everyone can view approved reviews" on public.reviews for select using (status = 'Approved');

-- Row level security policies for user private tables
create policy "Users can manage their own addresses" on public.addresses
    for all using (auth.uid() = user_id);

create policy "Users can view their own orders" on public.orders
    for select using (auth.uid() = user_id);

create policy "Users can manage their own wishlist" on public.wishlist
    for all using (auth.uid() = user_id);

-- Admin overall policies (using trigger checking or profiles role)
-- Helper function to check if auth.uid() has Admin role
create or replace function public.is_admin()
returns boolean as $$
declare
    user_role public.user_role;
begin
    select role into user_role from public.profiles where id = auth.uid();
    return user_role = 'Admin'::public.user_role or user_role = 'Manager'::public.user_role;
end;
$$ language plpgsql security definer;

-- Create admin bypass policies for tables
create policy "Admins can do everything on brands" on public.brands for all using (public.is_admin());
create policy "Admins can do everything on categories" on public.categories for all using (public.is_admin());
create policy "Admins can do everything on phone_models" on public.phone_models for all using (public.is_admin());
create policy "Admins can do everything on products" on public.products for all using (public.is_admin());
create policy "Admins can do everything on compatibility" on public.compatibility for all using (public.is_admin());
create policy "Admins can do everything on orders" on public.orders for all using (public.is_admin());
create policy "Admins can do everything on reviews" on public.reviews for all using (public.is_admin());
create policy "Admins can do everything on coupons" on public.coupons for all using (public.is_admin());
