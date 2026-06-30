-- ── Allow refund-related order statuses ─────────────────────────────────────
-- The original status CHECK constraint never included 'refunded' or
-- 'partially_refunded', so the charge.refunded webhook's status update has
-- been silently failing (Supabase doesn't throw on a constraint violation
-- unless the caller checks the returned error, which this code didn't).
-- This finds whatever the auto-generated constraint name is and replaces it.

DO $$
DECLARE
  con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.orders'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'paid', 'shipped', 'fulfilled', 'cancelled', 'refunded', 'partially_refunded'));
