-- Balan Coffee & Roastery
-- MongoDB Atlas to Amazon RDS PostgreSQL schema draft
--
-- This schema preserves legacy MongoDB IDs in `legacy_mongo_id` because the
-- current data uses both ObjectId values and custom string IDs.
-- Authentication has moved to Amazon Cognito, so legacy password/reset-token
-- fields are intentionally excluded.

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE NOT NULL,
  cognito_sub TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  status TEXT DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  date_of_birth DATE,
  gender TEXT,
  providers JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  security JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_activity_at TIMESTAMPTZ,
  last_tested TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  first_name TEXT,
  last_name TEXT,
  address1 TEXT,
  street TEXT,
  ward_commune TEXT,
  district TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  pricing_type TEXT,
  low_stock_threshold INTEGER,
  image_url TEXT,
  thumbnail TEXT,
  category_id TEXT,
  category JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  origin TEXT,
  region TEXT,
  altitude INTEGER,
  varietals JSONB DEFAULT '[]'::jsonb,
  roast_level TEXT,
  roast_date TIMESTAMPTZ,
  flavor_profile JSONB DEFAULT '[]'::jsonb,
  aroma JSONB DEFAULT '[]'::jsonb,
  acidity TEXT,
  body TEXT,
  sweetness TEXT,
  brewing_methods JSONB DEFAULT '[]'::jsonb,
  processing_method TEXT,
  harvest_season TEXT,
  certification JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_digital BOOLEAN DEFAULT FALSE,
  requires_shipping BOOLEAN DEFAULT TRUE,
  promotion JSONB DEFAULT '{}'::jsonb,
  seo JSONB DEFAULT '{}'::jsonb,
  rating JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  dimensions JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  stock_quantity INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS product_weight_pricing (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight INTEGER,
  weight_display TEXT,
  price NUMERIC(12, 2),
  stock_quantity INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  discount JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS carts (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE NOT NULL,
  source_collection TEXT NOT NULL CHECK (source_collection IN ('cart', 'carts')),
  customer_id TEXT,
  item_count INTEGER DEFAULT 0,
  subtotal NUMERIC(12, 2) DEFAULT 0,
  checkout JSONB DEFAULT '{}'::jsonb,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT,
  cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_legacy_mongo_id TEXT,
  quantity INTEGER,
  price NUMERIC(12, 2),
  variant JSONB DEFAULT '{}'::jsonb,
  added_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_info JSONB DEFAULT '{}'::jsonb,
  customer_email TEXT,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_full_name TEXT,
  customer_phone TEXT,
  subtotal NUMERIC(12, 2),
  shipping_fee NUMERIC(12, 2) DEFAULT 0,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2),
  billing_address JSONB DEFAULT '{}'::jsonb,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  payment JSONB DEFAULT '{}'::jsonb,
  payment_method TEXT,
  payment_status TEXT,
  status TEXT,
  fulfillment_status TEXT,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  channel TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_legacy_mongo_id TEXT,
  product_name TEXT,
  product_name_vi TEXT,
  sku TEXT,
  price NUMERIC(12, 2),
  quantity INTEGER,
  subtotal NUMERIC(12, 2),
  image TEXT,
  variant JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  type TEXT,
  status TEXT,
  priority TEXT,
  source TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  follow_up_required BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  consent_to_contact BOOLEAN DEFAULT FALSE,
  responses JSONB DEFAULT '[]'::jsonb,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  data_retention_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE,
  title JSONB,
  slug TEXT UNIQUE,
  excerpt JSONB,
  content JSONB,
  featured_image TEXT,
  category JSONB,
  author JSONB,
  reading_time INTEGER,
  status TEXT,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  legacy_mongo_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status_active ON products(status, is_active);
CREATE INDEX IF NOT EXISTS idx_product_weight_pricing_product_id ON product_weight_pricing(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status_published_at ON blogs(status, published_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);

COMMIT;
