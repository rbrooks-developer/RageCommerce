-- Paste each block separately in the Supabase SQL editor if needed.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS bg_color TEXT NOT NULL DEFAULT '#ffffff';

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS font_color TEXT NOT NULL DEFAULT '#111827';

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS font_family TEXT NOT NULL DEFAULT 'default';
