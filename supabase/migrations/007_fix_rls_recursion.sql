-- ============================================================
-- 007_fix_rls_recursion.sql
-- Run this in the Supabase SQL editor.
--
-- All admin RLS policies use:
--   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
--
-- That subquery on profiles triggers the profiles RLS policies,
-- which run the same subquery again → infinite recursion.
--
-- Fix: a SECURITY DEFINER function that bypasses RLS on its
-- internal query, so the recursion never starts.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── profiles ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- ── products ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ── categories ───────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- ── orders ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- ── order_items ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- ── site_settings ────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin());
