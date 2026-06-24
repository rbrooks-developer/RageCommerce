-- ============================================================
-- 006_shipping_countries.sql
-- Adds a shipping_countries column to site_settings.
-- Default is US-only. Run in Supabase SQL editor.
-- ============================================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS shipping_countries JSONB NOT NULL DEFAULT '["US"]';
