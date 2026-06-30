-- ── Shipping Insurance & Signature Thresholds ───────────────────────────────

-- Admin-configurable order-subtotal thresholds. 0 = disabled (never require).
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS insurance_min_subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signature_min_subtotal numeric(10, 2) NOT NULL DEFAULT 0;

-- Freeze the decision made at checkout time on the order itself, so label
-- purchase later honors exactly what the customer was quoted/shown — even if
-- the admin thresholds change in between.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS insurance_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signature_required  boolean NOT NULL DEFAULT false;
