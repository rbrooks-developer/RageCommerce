-- Run this entire file in the Supabase SQL editor.
-- It is safe to run multiple times (IF NOT EXISTS / ON CONFLICT DO NOTHING).

-- 010: Background and font colour columns
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS bg_color   TEXT NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS font_color TEXT NOT NULL DEFAULT '#111827';

-- 011: site-assets storage bucket for favicon / logo uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  2097152,
  ARRAY['image/png','image/svg+xml','image/x-icon','image/vnd.microsoft.icon','image/webp','image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view site assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets')
  ON CONFLICT DO NOTHING;

CREATE POLICY "Admins can manage site assets"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  ON CONFLICT DO NOTHING;

-- 012: Font family column
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS font_family TEXT NOT NULL DEFAULT 'default';
