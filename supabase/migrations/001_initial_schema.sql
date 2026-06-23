-- ============================================================
-- 001_initial_schema.sql
-- Run this in the Supabase SQL editor to set up the database.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Categories ───────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references public.categories(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enforce max 3 levels of nesting
create or replace function public.check_category_depth()
returns trigger language plpgsql as $$
declare
  depth integer := 0;
  current_id uuid := new.parent_id;
begin
  while current_id is not null loop
    depth := depth + 1;
    if depth >= 3 then
      raise exception 'Category nesting cannot exceed 3 levels';
    end if;
    select parent_id into current_id from public.categories where id = current_id;
  end loop;
  return new;
end;
$$;

create trigger enforce_category_depth
  before insert or update on public.categories
  for each row execute procedure public.check_category_depth();

-- ── Products ─────────────────────────────────────────────────
create table public.products (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text not null unique,
  description     text,
  price           numeric(10, 2) not null check (price >= 0),
  inventory       integer not null default 0 check (inventory >= 0),
  images          jsonb not null default '[]',
  category_id     uuid references public.categories(id) on delete set null,
  weight_oz       numeric(8, 2) not null check (weight_oz > 0),
  length_in       numeric(8, 2) not null check (length_in > 0),
  width_in        numeric(8, 2) not null check (width_in > 0),
  height_in       numeric(8, 2) not null check (height_in > 0),
  is_published    boolean not null default false,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_products_slug on public.products(slug);
create index idx_products_category on public.products(category_id);
create index idx_products_published on public.products(is_published);

-- ── Orders ───────────────────────────────────────────────────
create table public.orders (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references public.profiles(id),
  status                   text not null default 'pending'
                             check (status in ('pending', 'paid', 'shipped', 'fulfilled', 'cancelled')),
  subtotal                 numeric(10, 2) not null,
  shipping_cost            numeric(10, 2) not null,
  tax_amount               numeric(10, 2) not null default 0,
  total_price              numeric(10, 2) not null,
  stripe_session_id        text unique,
  stripe_payment_intent_id text unique,
  selected_shipping_rate   jsonb,
  tracking_number          text,
  shipping_label_url       text,
  shipping_name            text not null,
  shipping_address_line1   text not null,
  shipping_address_line2   text,
  shipping_city            text not null,
  shipping_state           text not null,
  shipping_zip             text not null,
  shipping_country         text not null default 'US',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_stripe_session on public.orders(stripe_session_id);
create index idx_orders_created on public.orders(created_at desc);

-- ── Order Items ──────────────────────────────────────────────
create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    integer not null check (quantity > 0),
  price       numeric(10, 2) not null,
  created_at  timestamptz not null default now()
);

create index idx_order_items_order on public.order_items(order_id);

-- ── Site Settings (singleton) ────────────────────────────────
create table public.site_settings (
  id                integer primary key default 1 check (id = 1),
  site_title        text not null default 'My Store',
  meta_title        text,
  meta_description  text,
  logo_url          text,
  favicon_url       text,
  homepage_config   jsonb not null default '{
    "hero_heading": "Welcome to Our Store",
    "hero_subtext": "Shop the latest products",
    "hero_image_url": null,
    "hero_cta_text": "Shop Now",
    "hero_cta_link": "/products",
    "featured_product_ids": [],
    "featured_category_ids": [],
    "banners": []
  }',
  nav_config        jsonb not null default '{"items": []}',
  footer_config     jsonb not null default '{"links": [], "social": [], "copyright_text": ""}',
  contact_info      jsonb not null default '{"email": null, "phone": null, "address": null}',
  store_address     jsonb not null default '{
    "name": "",
    "street1": "",
    "city": "",
    "state": "",
    "zip": "",
    "country": "US"
  }',
  tax_mode          text not null default 'none' check (tax_mode in ('stripe', 'flat_rate', 'none')),
  tax_flat_rate     numeric(5, 4),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Seed the singleton row
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ── updated_at triggers ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute procedure public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.site_settings enable row level security;

-- profiles: users can read/update their own; admins can read all
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- products: published products are public; admins can do everything
create policy "Published products are publicly readable"
  on public.products for select using (is_published = true);

create policy "Admins can manage products"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- categories: publicly readable; admins can manage
create policy "Categories are publicly readable"
  on public.categories for select using (true);

create policy "Admins can manage categories"
  on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- orders: users can view their own; admins can view all
create policy "Users can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on public.orders for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- order_items: accessible through order ownership
create policy "Users can view own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));

create policy "Admins can manage order items"
  on public.order_items for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- site_settings: publicly readable; only admins can update
create policy "Site settings are publicly readable"
  on public.site_settings for select using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── Storage buckets ──────────────────────────────────────────
-- Run these in the Supabase dashboard > Storage, or via the API.
-- Bucket: product-images (public)
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 5MB
-- File size limit per product: 10 images
