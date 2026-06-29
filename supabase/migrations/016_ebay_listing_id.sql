-- Add eBay listing ID to products for upsert-on-sync
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS ebay_listing_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_products_ebay_listing_id
  ON public.products (ebay_listing_id)
  WHERE ebay_listing_id IS NOT NULL;
