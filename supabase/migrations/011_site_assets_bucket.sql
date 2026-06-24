-- ============================================================
-- 011_site_assets_bucket.sql
-- Run this in the Supabase SQL editor.
--
-- Creates a site-assets bucket for favicon, logos, etc.
-- Requires migration 007 (is_admin function) to be run first.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  2097152,  -- 2 MB
  ARRAY['image/png', 'image/svg+xml', 'image/x-icon', 'image/webp', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Site assets are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "Admins can update site assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "Admins can delete site assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin());
