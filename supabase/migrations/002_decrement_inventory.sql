-- Atomic inventory decrement used by the Stripe webhook
CREATE OR REPLACE FUNCTION decrement_inventory(product_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET inventory = GREATEST(0, inventory - amount)
  WHERE id = product_id;
END;
$$;
