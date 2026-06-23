# RESPONSIVE E-COMMERCE BUILD PLAN (MOBILE + TABLET + DESKTOP FIRST)

---

## 1. Project Overview

Build a fully responsive Shopify-like e-commerce platform optimized for:

- Mobile (primary UX target)
- Tablet (secondary layout tier)
- Desktop (full admin + browsing experience)

### Core Stack

| Layer | Technology |
|---|---|
| Frontend + API | Next.js (App Router, TypeScript) |
| Hosting | Vercel |
| Database + Auth + Storage | Supabase (PostgreSQL) |
| Payments | Stripe Checkout (test mode at launch, swap keys to go live) |
| Shipping rates + labels | EasyPost |
| Transactional email | Resend |

---

## 2. Responsive Design Rule (Critical)

Every UI component MUST be built mobile-first and scale upward using Tailwind breakpoints.

| Breakpoint | Range |
|---|---|
| sm (default) | 0–640px (phones) |
| md | 641–1024px (tablets) |
| lg | 1024px+ (desktop) |

**Required pattern:** mobile → default styles, tablet → `md:`, desktop → `lg:`

**Forbidden:**
- Fixed widths (e.g. `w-[1200px]` containers)
- Desktop-only layouts
- Tables that break on mobile
- Horizontal overflow without scroll handling

---

## 3. System Architecture

```
                 Vercel
        Next.js (Responsive UI Layer)
           /           |           \
   Storefront     Admin Panel     API Routes
         \             |             /
              Supabase (Postgres + Auth + Storage)
                        |
       Stripe + EasyPost + Resend Integrations
```

---

## 4. Device UX Requirements

### Mobile (Primary Target)
- Single-column layout
- Sticky bottom or top cart access
- Large tap targets (min 44px)
- Swipeable product images
- Hamburger menu navigation
- One-page checkout flow via Stripe redirect
- Product page: vertical stack, expandable accordion details

### Tablet
- 2-column product grids
- Hybrid navigation (sidebar or top bar)
- Admin: card + table hybrid views
- Product pages: image gallery + details side-by-side

### Desktop
- Multi-column admin dashboard
- Full data tables for orders/products
- Sidebar navigation in admin
- Advanced filtering/search UI
- Full-width product grids (3–5 columns)

---

## 5. Authentication & User Accounts

- Supabase Auth only
- **Registration required** — customers must create an account to checkout (email collected for future marketing)
- Role-based access control via `profiles.role` column (`customer` | `admin`)
- Admin role assigned manually by editing the `role` column in Supabase dashboard
- 4 required emails via Resend:
  1. Registration confirmation
  2. Order confirmation
  3. Shipping update (with tracking number)
  4. Password reset

---

## 6. Core Features

### 6.1 Storefront (Public)

**Pages:**
- Home
- Category listing
- Product listing
- Product detail
- Cart
- Checkout (Stripe redirect — with live EasyPost shipping rate selection)
- Order confirmation

**Requirements:**
- Fully responsive layouts
- SEO-optimized SSR/SSG pages
- Fast image loading (Next/Image — handles all optimization, Supabase Storage holds originals)
- Max 10 images per product (swipeable on mobile)

### 6.2 Admin Dashboard (/admin)

Behaves like a responsive Shopify admin. Everything configurable — nothing hardcoded.

**Sections:**

#### Dashboard
- Revenue summary
- Order count
- Recent orders

#### Products
- CRUD products
- Image upload (max 10 per product, stored in Supabase Storage)
- Category assignment
- Inventory management
- SEO fields (title, description, slug)
- Weight (ounces) — required
- Dimensions: length, width, height (inches) — required (used for EasyPost rate calculation)
- Published/draft toggle

#### Categories
- CRUD categories
- Up to 3 levels of nesting (e.g. Clothing > Men's > Shirts)

#### Orders
- Order table (mobile: card view, desktop: full table)
- Checkbox multi-select for bulk label printing
- View order detail (includes customer shipping address)
- Update order status manually
- Cancel order (triggers full Stripe refund, sets status = cancelled)
- Generate EasyPost shipping labels (single or bulk)

#### Site Settings (CMS — No Hardcoding)

All content editable from admin. Nothing hardcoded in code.

| Setting Group | Fields |
|---|---|
| Site identity | Site title, logo, favicon |
| SEO | Meta title, meta description |
| Homepage | Hero heading, hero subtext, hero image, hero CTA text + link, featured product IDs, featured category IDs, promotional banners |
| Navigation | Nav menu items (label + link) |
| Footer | Footer links, social media links, copyright text |
| Contact | Store contact email, phone, address |
| Store address | From-address used by EasyPost for shipping rates and labels |
| Tax | Tax mode: `stripe` (automatic) \| `flat_rate` (enter %) \| `none` |
| Currency | USD (fixed) |

---

## 7. Database Schema (Supabase)

### profiles
```
id              uuid (references auth.users)
email           text
role            text ('customer' | 'admin')
created_at      timestamptz
updated_at      timestamptz
```

### products
```
id              uuid
name            text
slug            text (unique)
description     text
price           numeric
inventory       integer
images          jsonb (array of Supabase Storage URLs, max 10)
category_id     uuid (FK → categories)
weight_oz       numeric (required — for EasyPost)
length_in       numeric (required — for EasyPost)
width_in        numeric (required — for EasyPost)
height_in       numeric (required — for EasyPost)
is_published    boolean (default false)
seo_title       text
seo_description text
created_at      timestamptz
updated_at      timestamptz
```

> Schema is intentionally clean to support adding a `product_variants` table later without a rewrite.

### categories
```
id              uuid
name            text
slug            text (unique)
parent_id       uuid (FK → categories, nullable, max 3 levels deep)
created_at      timestamptz
updated_at      timestamptz
```

### orders
```
id                      uuid
user_id                 uuid (FK → profiles)
status                  text ('pending' | 'paid' | 'shipped' | 'fulfilled' | 'cancelled')
subtotal                numeric
shipping_cost           numeric
tax_amount              numeric
total_price             numeric
stripe_session_id       text
selected_shipping_rate  jsonb (carrier, service, rate selected at checkout)
tracking_number         text
shipping_label_url      text
shipping_name           text
shipping_address_line1  text
shipping_address_line2  text
shipping_city           text
shipping_state          text
shipping_zip            text
shipping_country        text
created_at              timestamptz
updated_at              timestamptz
```

### order_items
```
id              uuid
order_id        uuid (FK → orders)
product_id      uuid (FK → products)
quantity        integer
price           numeric (price at time of purchase)
created_at      timestamptz
```

### site_settings
```
id                  integer (singleton row — always id = 1)
site_title          text
meta_title          text
meta_description    text
logo_url            text
favicon_url         text
homepage_config     jsonb (hero, CTAs, featured products/categories, banners)
nav_config          jsonb (navigation menu items)
footer_config       jsonb (links, social media, copyright)
contact_info        jsonb (email, phone, address)
store_address       jsonb (EasyPost from-address: name, street, city, state, zip, country)
tax_mode            text ('stripe' | 'flat_rate' | 'none')
tax_flat_rate       numeric (used when tax_mode = 'flat_rate')
created_at          timestamptz
updated_at          timestamptz
```

---

## 8. Checkout Flow (Full)

1. Customer adds items to cart (stored in localStorage, recalculated server-side at checkout)
2. Customer logs in / registers (required)
3. Customer enters shipping address
4. System calls EasyPost API with:
   - Total cart weight + dimensions (from product records)
   - Customer shipping address
   - Store from-address (from site_settings)
5. Customer selects shipping option (carrier, service, rate)
6. System calculates:
   - Subtotal
   - Shipping cost (selected EasyPost rate)
   - Tax (based on tax_mode in site_settings)
   - Total
7. Backend creates Stripe Checkout session with final total
8. Customer completes payment on Stripe-hosted page
9. Stripe webhook fires → system:
   - Creates order in Supabase
   - Saves shipping address to order
   - Sets status = `paid`
   - Sends order confirmation email via Resend

---

## 9. Order Status Flow

```
pending → paid → shipped → fulfilled
                    ↓
                cancelled (triggers full Stripe refund via API)
```

No partial fulfillment.

---

## 10. Shipping Flow (EasyPost)

### At Checkout (Customer-Facing)
- Live rate estimation using product weight + dimensions + customer address
- Customer selects preferred rate
- Selected rate stored on order

### Post-Purchase (Admin)
- Admin selects one or more paid orders using checkboxes
- Clicks "Generate Labels"
- System calls EasyPost API for each selected order
- Returns: carrier label PDF + tracking number per order
- Tracking number saved to order, status updated to `shipped`
- Shipping update email sent to customer via Resend

---

## 11. Payment & Refund Flow (Stripe)

### Payment
- Stripe Checkout (hosted page)
- USD only
- Test mode at launch — swap to live keys when ready to go live
- Stripe webhook validates signature before processing

### Refunds
- Admin clicks "Cancel Order" on any paid/shipped order
- System calls Stripe Refund API (full refund)
- Order status set to `cancelled`
- Supabase inventory restored for cancelled order items

### Tax
- Configurable in admin Site Settings:
  - `stripe` — Stripe Tax (automatic, jurisdiction-aware)
  - `flat_rate` — apply a fixed percentage stored in site_settings
  - `none` — no tax collected

---

## 12. Cart System

- Stored in localStorage (MVP)
- Persists across sessions
- Recalculated server-side at checkout (price, inventory, tax)
- No client-trusted pricing logic
- Optional: sync to Supabase in future for abandoned cart tracking

---

## 13. SEO Requirements

### Global
- Dynamic metadata per page
- OpenGraph + Twitter cards
- Canonical URLs
- sitemap.xml auto-generation
- robots.txt

### Product
- schema.org Product JSON-LD
- Unique slug per product
- Meta title + description per product (editable in admin)

### Performance SEO
- Server components (Next.js App Router)
- Image optimization via Next/Image
- Lazy loading
- Caching headers

---

## 14. Security Requirements

### Authentication
- Supabase Auth only
- Role-based access: admin / customer
- Admin role manually assigned via Supabase dashboard

### API Security
- Input validation with Zod on all API routes
- Server-side enforcement of pricing (no client-trusted totals)
- Stripe webhook signature validation
- Rate limiting on API routes
- CSRF protection for admin actions
- File upload validation (images only, Supabase Storage)

### HTTP Security Headers (Required)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: restrictive defaults
Content-Security-Policy: strict baseline
```

---

## 15. Email System (Resend)

| Email | Trigger |
|---|---|
| Registration confirmation | User signs up |
| Order confirmation | Stripe webhook confirms payment |
| Shipping update | Admin generates EasyPost label |
| Password reset | User requests reset |

---

## 16. Performance Requirements

- Lighthouse score: 90+
- Mobile-first rendering priority
- Image CDN optimization via Next/Image (Supabase Storage as origin)
- Minimal JS on storefront pages (server components)
- Edge caching where possible

---

## 17. Environment Setup

| Service | Launch State |
|---|---|
| Vercel | Live |
| Supabase | Live |
| EasyPost | Live |
| Resend | Live |
| Stripe | Test mode (swap keys to go live) |

No separate staging environment. Single deployment.

No automated tests for MVP.

---

## 18. MVP Development Phases

### Phase 1 — Foundation
- Next.js project setup (App Router, TypeScript, Tailwind)
- Supabase integration (schema, auth, storage)
- profiles table + role-based access
- HTTP security headers
- Resend integration + email templates

### Phase 2 — Products & Storefront
- Categories CRUD (admin)
- Products CRUD (admin) — including weight, dimensions, images, SEO fields, published toggle
- Site Settings admin (all fields, no hardcoding)
- Storefront: home, category listing, product listing, product detail pages
- SEO: metadata, OpenGraph, JSON-LD, sitemap.xml, robots.txt
- Fully responsive storefront UI

### Phase 3 — Cart & Checkout
- Cart (localStorage)
- Checkout flow: address → EasyPost rate selection → tax calculation → Stripe session
- Stripe Checkout integration
- Stripe webhook handler (create order, send confirmation email)

### Phase 4 — Orders & Admin
- Orders table with card/table responsive views
- Bulk order selection + EasyPost label generation
- Order detail view (shipping address, items, totals)
- Order status management
- Cancel order + Stripe refund flow
- Shipping update email via Resend

### Phase 5 — SEO & Security Hardening
- Lighthouse audit + fixes
- CSP + security headers audit
- Rate limiting
- Input validation audit (Zod everywhere)
- Stripe webhook signature validation audit

---

## 19. Responsive UI Rules (Non-Negotiable)

Every component MUST:
- Use flex/grid
- Use responsive breakpoints
- Avoid fixed pixel layouts
- Support overflow handling
- Stack vertically on mobile

Tables MUST:
- Scroll horizontally on mobile OR convert to card layout on mobile

Forms MUST:
- Be single-column on mobile
- Use full-width inputs
- Have large touch targets (min 44px)

Navigation MUST:
- Collapse into hamburger menu on mobile
- Remain as visible sidebar on desktop admin

---

## 20. Optional Features (Post-MVP)

- Product variants (size, color) — schema is ready, no rewrite needed
- Cart sync to Supabase (abandoned cart tracking)
- Product reviews
- Wishlist
- Coupons / discounts
- Analytics dashboard
- Inventory alerts
- Bulk product import/export

---

## 21. Final Design Principle

> "Mobile is the default, tablet is the transition, desktop is the expansion."
> "Admin is the single source of truth — nothing is hardcoded."
