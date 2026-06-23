-- ============================================================
-- 004_user_addresses.sql
-- Run this in the Supabase SQL editor.
-- ============================================================

-- Add display fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT,
  ADD COLUMN IF NOT EXISTS phone      TEXT;

-- Saved addresses
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label                TEXT        NOT NULL DEFAULT 'Home',
  first_name           TEXT        NOT NULL,
  last_name            TEXT        NOT NULL,
  company              TEXT,
  address_line1        TEXT        NOT NULL,
  address_line2        TEXT,
  city                 TEXT        NOT NULL,
  state                TEXT        NOT NULL,
  zip                  TEXT        NOT NULL,
  country              TEXT        NOT NULL DEFAULT 'US',
  phone                TEXT,
  is_default_shipping  BOOLEAN     NOT NULL DEFAULT false,
  is_default_billing   BOOLEAN     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id);
