-- ── eBay Sync ─────────────────────────────────────────────────────────────────

-- Store eBay credentials + OAuth tokens alongside other site settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS ebay_config JSONB NOT NULL DEFAULT '{
    "app_id": "",
    "dev_id": "",
    "cert_id": "",
    "ru_name": "",
    "access_token": null,
    "refresh_token": null,
    "token_expires_at": null,
    "ebay_user_id": null,
    "ebay_username": null,
    "categories_synced_at": null,
    "categories_count": null
  }'::jsonb;

-- Local cache of the eBay category tree (re-synced on demand from Taxonomy API)
CREATE TABLE IF NOT EXISTS public.ebay_categories (
  ebay_category_id        TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  category_path           TEXT NOT NULL,
  parent_ebay_category_id TEXT,
  level                   INTEGER NOT NULL DEFAULT 1,
  is_leaf                 BOOLEAN NOT NULL DEFAULT false,
  synced_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast ilike search on the full path string
CREATE INDEX IF NOT EXISTS idx_ebay_categories_path
  ON public.ebay_categories (category_path);

CREATE INDEX IF NOT EXISTS idx_ebay_categories_leaf
  ON public.ebay_categories (is_leaf);

ALTER TABLE public.ebay_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ebay_categories"
  ON public.ebay_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage ebay_categories"
  ON public.ebay_categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cross-reference from website category → eBay category
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS ebay_category_id   TEXT,
  ADD COLUMN IF NOT EXISTS ebay_category_name TEXT;
