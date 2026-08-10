-- Provision Yael Kanievsky as the main admin
-- Run this manually in Supabase SQL Editor
-- This script:
-- 1. Creates/updates Yael in Supabase Auth
-- 2. Creates/updates admin_users row
-- 3. Removes old admin(s)
-- 4. Updates business profile email

-- Configuration
DO $$
DECLARE
  yael_email TEXT := 'berkovich.yael@gmail.com';
  yael_password TEXT := '1234';
  yael_full_name TEXT := 'יעל קנייבסקי';
  yael_auth_id UUID;
  old_admin_id UUID;
  old_admin_full_name TEXT;
  old_admin_email TEXT;
  current_bp_email TEXT;
BEGIN
  RAISE NOTICE '🚀 Starting Yael admin provisioning...';
  RAISE NOTICE '📋 Configuration: Email: %, Name: %', yael_email, yael_full_name;
  
  -- Step 1: Check if Yael exists in auth.users
  SELECT id INTO yael_auth_id
  FROM auth.users
  WHERE email = yael_email;
  
  IF yael_auth_id IS NOT NULL THEN
    RAISE NOTICE '🔄 Yael already exists in Auth, updating password...';
    
    -- Update password using auth.admin API (requires service role)
    -- Note: This may fail in SQL Editor without proper permissions
    -- If it fails, you may need to update password via Supabase Dashboard
    PERFORM auth.admin.update_user(yael_auth_id, '{"password": "' || yael_password || '"}');
    RAISE NOTICE '✅ Password updated (or attempted)';
  ELSE
    RAISE NOTICE '➕ Creating Yael in Supabase Auth...';
    
    -- Create user in auth.users
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES (
      yael_email,
      crypt(yael_password, gen_salt('bf')),
      now(),
      '{"full_name": "' || yael_full_name || '"}'::jsonb
    )
    RETURNING id INTO yael_auth_id;
    
    RAISE NOTICE '✅ Created Yael in Auth with ID: %', yael_auth_id;
  END IF;
  
  -- Step 2: Create or update admin_users row
  RAISE NOTICE '📝 Updating admin_users table...';
  
  INSERT INTO admin_users (id, full_name, email, last_login_at)
  VALUES (yael_auth_id, yael_full_name, yael_email, NULL)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  
  RAISE NOTICE '✅ Admin user updated';
  
  -- Step 3: Remove old admin(s) (excluding Yael)
  FOR old_admin_id, old_admin_full_name, old_admin_email IN
    SELECT id, full_name, email FROM admin_users WHERE id != yael_auth_id
  LOOP
    RAISE NOTICE '🗑️  Removing old admin: % (%)', old_admin_full_name, COALESCE(old_admin_email, 'no email');
    
    -- Delete from admin_users (cascades to auth.users via FK)
    DELETE FROM admin_users WHERE id = old_admin_id;
    
    -- Also delete from auth.users for cleanup
    DELETE FROM auth.users WHERE id = old_admin_id;
    
    RAISE NOTICE '✅ Removed old admin';
  END LOOP;
  
  -- Step 4: Update business profile email
  RAISE NOTICE '📧 Updating business profile email...';
  
  SELECT data->>'email' INTO current_bp_email
  FROM site_content
  WHERE key = 'business_profile';
  
  IF current_bp_email IS DISTINCT FROM yael_email THEN
    UPDATE site_content
    SET data = jsonb_set(
      data,
      '{email}',
      to_jsonb(yael_email)
    )
    WHERE key = 'business_profile';
    
    RAISE NOTICE '✅ Updated business profile email from "%" to "%"', COALESCE(current_bp_email, 'null'), yael_email;
  ELSE
    RAISE NOTICE '✅ Business profile email already matches';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Provisioning completed successfully!';
  RAISE NOTICE '📝 Summary:';
  RAISE NOTICE '  - Yael (%) is now the primary admin', yael_email;
  RAISE NOTICE '  - Login with: % / %', yael_email, yael_password;
  RAISE NOTICE '  - Old admin(s) removed';
  RAISE NOTICE '  - Business profile email synchronized';
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '❌ Provisioning failed: %', SQLERRM;
END $$;
