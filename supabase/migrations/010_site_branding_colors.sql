-- ============================================================
-- 010_site_branding_colors.sql
-- Run this in the Supabase SQL editor.
--
-- Adds bg_color and font_color columns to site_settings.
-- ============================================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS bg_color  TEXT NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS font_color TEXT NOT NULL DEFAULT '#111827';
