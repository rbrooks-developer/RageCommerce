ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS font_family TEXT NOT NULL DEFAULT 'default';
