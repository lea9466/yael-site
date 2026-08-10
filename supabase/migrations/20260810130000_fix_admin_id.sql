-- Fix admin_users ID to match the new auth user
-- Run this after manually changing the email in Supabase Auth

DO $$
DECLARE
  target_email TEXT := 'berkovich.yael@gmail.com';
  auth_user_id UUID;
  admin_id UUID;
BEGIN
  -- Find the auth user with the new email
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = target_email;
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found with email %', target_email;
  END IF;
  
  RAISE NOTICE 'Found auth user ID: %', auth_user_id;
  
  -- Check current admin_users
  SELECT id INTO admin_id
  FROM admin_users
  LIMIT 1;
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin_users row found';
  END IF;
  
  RAISE NOTICE 'Current admin_users ID: %', admin_id;
  
  -- Update admin_users to point to the new auth user
  UPDATE admin_users
  SET id = auth_user_id,
      email = target_email,
      full_name = 'יעל קנייבסקי'
  WHERE id = admin_id;
  
  RAISE NOTICE '✅ Updated admin_users to point to auth user %', auth_user_id;
  
  -- Optionally delete the old auth user if it exists and is different
  IF admin_id IS DISTINCT FROM auth_user_id THEN
    DELETE FROM auth.users WHERE id = admin_id;
    RAISE NOTICE '✅ Deleted old auth user %', admin_id;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '❌ Failed: %', SQLERRM;
END $$;
