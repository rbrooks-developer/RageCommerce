-- ============================================================
-- 005_profile_trigger_metadata.sql
-- Updates the handle_new_user trigger to pull first_name,
-- last_name, and phone from user metadata passed at signup.
-- Run this in the Supabase SQL editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$;
