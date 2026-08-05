# MongoDB to Amazon RDS PostgreSQL Migration Plan

## Objective

Migrate the Balan Coffee & Roastery application database from MongoDB Atlas to Amazon RDS PostgreSQL while preserving application functionality and existing business data.

## Current Source Database

- Source platform: MongoDB Atlas
- Source database: `balancoffee`
- Cluster: `balancoffee`
- Target platform: Amazon RDS PostgreSQL

The backend currently connects to the `balancoffee` database, so this database is treated as the migration source of truth.

## Source Collections and Counts

| MongoDB collection | Document count | Notes |
| --- | ---: | --- |
| `users` | 5 | Includes legacy users and Cognito-linked users. |
| `products` | 3 | Contains nested product pricing and metadata. |
| `categories` | 3 | Product categories. |
| `orders` | 12 | Includes customer and guest orders. |
| `cart` | 4 | Current backend reads/writes this collection. |
| `carts` | 6 | Legacy/alternate cart collection. |
| `contacts` | 3 | Contact form submissions. |
| `blogs` | 0 | Backend has blog routes, but no current documents. |
| `subscriptions` | 0 | Newsletter route uses this collection, but no current documents. |

## Migration Strategy

Use a hybrid relational + JSONB schema:

- Store core query/filter fields as PostgreSQL columns.
- Preserve variable MongoDB sub-documents as `jsonb`.
- Split high-value repeated data into relational child tables where useful:
  - user addresses
  - product weight pricing
  - cart items
  - order items
- Preserve MongoDB identifiers as `legacy_mongo_id text`, because some documents use ObjectId and some use custom string IDs.

## PostgreSQL Schema Draft

### `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique not null` | Original MongoDB `_id`; can be ObjectId or custom string. |
| `cognito_sub` | `text unique` | Nullable for legacy users not yet linked to Cognito. |
| `email` | `text unique not null` | User email. |
| `first_name` | `text` | From `firstName`. |
| `last_name` | `text` | From `lastName`. |
| `full_name` | `text` | From `fullName`; nullable. |
| `phone` | `text` | Phone number. |
| `role` | `text` | Example: `customer`, `admin`. |
| `status` | `text` | Example: `active`, `inactive`. |
| `email_verified` | `boolean default false` | From `emailVerified`. |
| `phone_verified` | `boolean default false` | From `phoneVerified`. |
| `date_of_birth` | `date` | From `dateOfBirth`. |
| `gender` | `text` | Gender value. |
| `providers` | `jsonb` | Social provider metadata. |
| `preferences` | `jsonb` | User preferences. |
| `stats` | `jsonb` | User stats. |
| `security` | `jsonb` | Non-sensitive security metadata. |
| `metadata` | `jsonb` | Legacy metadata. |
| `last_activity_at` | `timestamptz` | From `lastActivityAt`. |
| `last_tested` | `timestamptz` | From `lastTested`, if present. |
| `created_at` | `timestamptz` | From `createdAt`. |
| `updated_at` | `timestamptz` | From `updatedAt`. |

Excluded from migration:

- `password`
- `resetPasswordToken`
- `resetPasswordExpires`
- email verification/reset token fields

Authentication has moved to Amazon Cognito, so legacy password and reset-token fields should not be migrated into the PostgreSQL auth-facing user table.

### `user_addresses`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text` | Original address `_id`, if present. |
| `user_id` | `bigint references users(id) on delete cascade` | Parent user. |
| `type` | `text` | Address type. |
| `first_name` | `text` | From `firstName`. |
| `last_name` | `text` | From `lastName`. |
| `address1` | `text` | Address line. |
| `street` | `text` | Street field. |
| `ward_commune` | `text` | From `wardCommune`. |
| `district` | `text` | District. |
| `city` | `text` | City. |
| `province` | `text` | Province. |
| `postal_code` | `text` | From `postalCode`. |
| `country` | `text` | Country. |
| `phone` | `text` | Address phone. |
| `is_default` | `boolean default false` | From `isDefault`. |

### `categories`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique not null` | Original MongoDB `_id`. |
| `name` | `text not null` | Category name. |
| `slug` | `text unique not null` | Category slug. |
| `description` | `text` | Category description. |
| `image` | `text` | Image path. |
| `is_active` | `boolean default true` | From `isActive`. |
| `created_at` | `timestamptz` | From `createdAt`. |
| `updated_at` | `timestamptz` | From `updatedAt`. |

### `products`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique not null` | Original MongoDB `_id`. |
| `name` | `text not null` | Product name. |
| `slug` | `text unique` | Product slug. |
| `description` | `text` | Full description. |
| `short_description` | `text` | From `shortDescription`. |
| `pricing_type` | `text` | Example: `weight-based`. |
| `low_stock_threshold` | `integer` | From `lowStockThreshold`. |
| `image_url` | `text` | Main image path. |
| `thumbnail` | `text` | Thumbnail value. |
| `category_id` | `text` | Existing `categoryId` string/slug. |
| `category` | `jsonb` | Embedded category object. |
| `tags` | `jsonb` | Product tags. |
| `origin` | `text` | Origin country. |
| `region` | `text` | Coffee region. |
| `altitude` | `integer` | Altitude value. |
| `varietals` | `jsonb` | Coffee varietals. |
| `roast_level` | `text` | From `roast_level`. |
| `roast_date` | `timestamptz` | From `roast_date`. |
| `flavor_profile` | `jsonb` | Flavor profile array. |
| `aroma` | `jsonb` | Aroma array. |
| `acidity` | `text` | Acidity level. |
| `body` | `text` | Body level. |
| `sweetness` | `text` | Sweetness level. |
| `brewing_methods` | `jsonb` | Brewing method array. |
| `processing_method` | `text` | From `processing_method`. |
| `harvest_season` | `text` | Harvest season. |
| `certification` | `jsonb` | Certification array. |
| `status` | `text` | Product status. |
| `is_featured` | `boolean default false` | From `isFeatured`. |
| `is_active` | `boolean default true` | From `isActive`. |
| `is_digital` | `boolean default false` | From `isDigital`. |
| `requires_shipping` | `boolean default true` | From `requiresShipping`. |
| `promotion` | `jsonb` | Promotion object. |
| `seo` | `jsonb` | SEO metadata. |
| `rating` | `jsonb` | Rating object. |
| `stats` | `jsonb` | Product stats. |
| `dimensions` | `jsonb` | Product dimensions. |
| `images` | `jsonb` | Image array. |
| `stock_quantity` | `integer` | Aggregate stock field, if present. |
| `published_at` | `timestamptz` | From `publishedAt`. |
| `created_at` | `timestamptz` | From `createdAt`. |
| `updated_at` | `timestamptz` | From `updatedAt`. |

### `product_weight_pricing`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique` | Original `weightPricing[]` `_id`, if present. |
| `product_id` | `bigint references products(id) on delete cascade` | Parent product. |
| `weight` | `integer` | Weight in grams. |
| `weight_display` | `text` | Example: `250g`, `1kg`. |
| `price` | `numeric(12,2)` | Price for this weight. |
| `stock_quantity` | `integer` | Stock for this option. |
| `is_available` | `boolean default true` | Availability. |
| `is_default` | `boolean default false` | Default option flag. |
| `discount` | `jsonb` | Discount object. |

### `carts`

This table should combine documents from MongoDB `cart` and `carts`. The `source_collection` column preserves where each cart came from.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique not null` | Original cart `_id`. |
| `source_collection` | `text not null` | `cart` or `carts`. |
| `customer_id` | `text` | Can be custom string or ObjectId string. |
| `item_count` | `integer default 0` | From `itemCount`. |
| `subtotal` | `numeric(12,2) default 0` | Cart subtotal. |
| `checkout` | `jsonb` | Checkout state, if present. |
| `last_activity` | `timestamptz` | From `lastActivity`. |
| `created_at` | `timestamptz` | From `createdAt`. |
| `updated_at` | `timestamptz` | From `updatedAt`. |

### `cart_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text` | Nullable; some cart items do not have `_id`. |
| `cart_id` | `bigint references carts(id) on delete cascade` | Parent cart. |
| `product_legacy_mongo_id` | `text` | Original product ID string/ObjectId. |
| `quantity` | `integer` | Quantity. |
| `price` | `numeric(12,2)` | Item price. |
| `variant` | `jsonb` | Example: `{ "weight": "250g" }`. |
| `added_at` | `timestamptz` | From `addedAt`. |
| `updated_at` | `timestamptz` | From item `updatedAt`, if present. |

### `orders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique not null` | Original MongoDB `_id`. |
| `order_number` | `text unique not null` | From `orderNumber`. |
| `customer_id` | `text` | Can be user ID or `guest`. |
| `customer_info` | `jsonb` | Full customer info object. |
| `customer_email` | `text` | Extracted from `customerInfo.email`. |
| `customer_first_name` | `text` | Extracted from `customerInfo.firstName`. |
| `customer_last_name` | `text` | Extracted from `customerInfo.lastName`. |
| `customer_full_name` | `text` | Extracted from `customerInfo.fullName`. |
| `customer_phone` | `text` | Extracted from `customerInfo.phone`. |
| `subtotal` | `numeric(12,2)` | Order subtotal. |
| `shipping_fee` | `numeric(12,2) default 0` | From `shippingFee`. |
| `tax_amount` | `numeric(12,2) default 0` | From `taxAmount`. |
| `discount_amount` | `numeric(12,2) default 0` | From `discountAmount`. |
| `total` | `numeric(12,2)` | Total. |
| `billing_address` | `jsonb` | Billing address. |
| `shipping_address` | `jsonb` | Shipping address. |
| `payment` | `jsonb` | Full payment object. |
| `payment_method` | `text` | Extracted from `payment.method`. |
| `payment_status` | `text` | Extracted from `payment.status`. |
| `status` | `text` | Order status. |
| `fulfillment_status` | `text` | From `fulfillmentStatus`. |
| `notes` | `text` | Order notes. |
| `tags` | `jsonb` | Tags array. |
| `channel` | `text` | Example: `website`. |
| `timeline` | `jsonb` | Timeline array. |
| `created_at` | `timestamptz` | From `createdAt`. |
| `updated_at` | `timestamptz` | From `updatedAt`. |

### `order_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text` | Nullable; newer items may not have `_id`. |
| `order_id` | `bigint references orders(id) on delete cascade` | Parent order. |
| `product_legacy_mongo_id` | `text` | Original product ID. |
| `product_name` | `text` | Product name at purchase time. |
| `product_name_vi` | `text` | Optional Vietnamese name field. |
| `sku` | `text` | SKU. |
| `price` | `numeric(12,2)` | Unit price. |
| `quantity` | `integer` | Quantity. |
| `subtotal` | `numeric(12,2)` | Item subtotal. |
| `image` | `text` | Image path. |
| `variant` | `jsonb` | Selected variant. |

### `contacts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique not null` | Original MongoDB `_id`. |
| `name` | `text` | Contact name. |
| `email` | `text` | Contact email. |
| `phone` | `text` | Contact phone. |
| `subject` | `text` | Contact subject. |
| `message` | `text` | Contact message. |
| `type` | `text` | Example: `inquiry`. |
| `status` | `text` | Example: `new`. |
| `priority` | `text` | Example: `medium`. |
| `source` | `text` | Example: `website`. |
| `ip_address` | `text` | From `ipAddress`. |
| `user_agent` | `text` | From `userAgent`. |
| `referrer` | `text` | Referrer URL. |
| `tags` | `jsonb` | Tags array. |
| `follow_up_required` | `boolean default false` | From `followUpRequired`. |
| `email_sent` | `boolean default false` | From `emailSent`. |
| `consent_to_contact` | `boolean default false` | From `consentToContact`. |
| `responses` | `jsonb` | Responses array. |
| `internal_notes` | `jsonb` | Internal notes array. |
| `data_retention_date` | `timestamptz` | From `dataRetentionDate`. |
| `created_at` | `timestamptz` | From `createdAt`. |
| `updated_at` | `timestamptz` | From `updatedAt`. |

### `blogs`

The backend has blog routes, but the current MongoDB source has no blog documents.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique` | Original MongoDB `_id`, if any future data is migrated. |
| `title` | `jsonb` | Supports possible string/object multilingual title shapes. |
| `slug` | `text unique` | Blog slug. |
| `excerpt` | `jsonb` | Supports string/object shapes. |
| `content` | `jsonb` | Blog content. |
| `featured_image` | `text` | Featured image. |
| `category` | `jsonb` | Category can be string or object. |
| `author` | `jsonb` | Author metadata. |
| `reading_time` | `integer` | Reading time. |
| `status` | `text` | Example: `published`. |
| `view_count` | `integer default 0` | View count. |
| `published_at` | `timestamptz` | Publish date. |
| `created_at` | `timestamptz` | Created date. |
| `updated_at` | `timestamptz` | Updated date. |

### `subscriptions`

The backend newsletter route uses this collection, but the current MongoDB source has no subscription documents.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `bigserial primary key` | New PostgreSQL primary key. |
| `legacy_mongo_id` | `text unique` | Original MongoDB `_id`, if present. |
| `email` | `text unique not null` | Subscriber email. |
| `is_active` | `boolean default true` | From `isActive`. |
| `created_at` | `timestamptz` | From `createdAt`. |
| `updated_at` | `timestamptz` | From `updatedAt`. |

## Migration Order

1. Create PostgreSQL schema.
2. Migrate `users`.
3. Migrate `user_addresses`.
4. Migrate `categories`.
5. Migrate `products`.
6. Migrate `product_weight_pricing`.
7. Migrate `cart` and `carts` into `carts`.
8. Migrate cart items into `cart_items`.
9. Migrate `orders`.
10. Migrate order items into `order_items`.
11. Migrate `contacts`.
12. Create empty `blogs` and `subscriptions` tables, or migrate them if new data exists before execution.

## Validation Plan

### Count validation

Compare source MongoDB counts to target PostgreSQL counts:

| Source | Expected target |
| --- | --- |
| `users: 5` | `users: 5` |
| `categories: 3` | `categories: 3` |
| `products: 3` | `products: 3` |
| `cart: 4` + `carts: 6` | `carts: 10` |
| `contacts: 3` | `contacts: 3` |
| `orders: 12` | `orders: 12` |
| `blogs: 0` | `blogs: 0` |
| `subscriptions: 0` | `subscriptions: 0` |

Child table counts should be validated by summing nested array sizes:

- `user_addresses`: sum of `users.addresses.length`
- `product_weight_pricing`: sum of `products.weightPricing.length`
- `cart_items`: sum of all `cart.items.length` and `carts.items.length`
- `order_items`: sum of `orders.items.length`

### Sample validation

Validate migrated values for representative records:

- A legacy user with custom string `_id`.
- A Cognito-linked user with `cognitoSub`.
- A product with `weightPricing`.
- A cart with non-empty `items`.
- A guest order.
- A contact submission.

### CRUD validation

After backend database layer migration, verify:

- Product list/detail.
- Product admin create/update/delete.
- Category list.
- User profile read/update.
- Cart read/add/update/remove/clear.
- Order create/list/detail/status updates.
- Contact form submission.
- Newsletter subscribe/unsubscribe.
- Blog list returns empty result without crashing.

## Risks and Assumptions

- MongoDB documents are semi-structured and not fully consistent across records. The schema uses nullable columns and JSONB to preserve variable data.
- `customerId` can be a custom user string, ObjectId string, or `guest`. It should remain `text` in v1 instead of a strict foreign key.
- Both `cart` and `carts` exist. The current backend uses `cart`, but both collections should be considered during migration to avoid data loss.
- Legacy password and reset-token fields should not be migrated because authentication has moved to Cognito.
- Blog and subscription tables should exist even when current source counts are zero, because backend routes reference them.
- The current plan only designs schema and migration strategy. RDS provisioning, migration scripts, backend refactor, and final smoke testing are separate implementation steps.
