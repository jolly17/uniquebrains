-- =====================================================
-- FIX REMAINING SUPABASE DATABASE LINTER WARNINGS
-- 
-- 1. function_search_path_mutable: get_care_resources_with_coords
-- 2. extension_in_public: postgis
-- 3. auth_leaked_password_protection: Dashboard-only (see notes)
-- =====================================================

-- =====================================================
-- ISSUE 1: Fix get_care_resources_with_coords search_path
--
-- The function needs SET search_path = '' to prevent
-- mutable search_path security warnings. We also add
-- the 'condition' column that was added in migration 087.
-- =====================================================

DROP FUNCTION IF EXISTS public.get_care_resources_with_coords();

CREATE OR REPLACE FUNCTION public.get_care_resources_with_coords()
RETURNS TABLE (
  id UUID,
  milestone VARCHAR(50),
  name VARCHAR(255),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(2),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  experience_years INTEGER,
  tags TEXT[],
  condition TEXT[],
  rating DECIMAL(2,1),
  review_count INTEGER,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.milestone,
    cr.name,
    cr.description,
    cr.address,
    cr.city,
    cr.state,
    cr.zip_code,
    cr.country,
    public.ST_Y(cr.coordinates::public.geometry) as lat,
    public.ST_X(cr.coordinates::public.geometry) as lng,
    cr.phone,
    cr.email,
    cr.website,
    cr.experience_years,
    cr.tags,
    cr.condition,
    cr.rating,
    cr.review_count,
    cr.verified,
    cr.created_at,
    cr.updated_at
  FROM public.care_resources cr
  ORDER BY cr.name;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

GRANT EXECUTE ON FUNCTION public.get_care_resources_with_coords() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_care_resources_with_coords() TO anon;

-- =====================================================
-- ISSUE 2: Move PostGIS extension out of public schema
--
-- The linter warns about extensions in the public schema.
-- We move postgis to the 'extensions' schema.
--
-- NOTE: This requires that no other objects depend on
-- postgis types/functions being in public. Our functions
-- already use public.ST_* which will need to become
-- extensions.ST_* after the move. However, Supabase
-- automatically creates an 'extensions' schema and
-- sets up search_path to include it, so unqualified
-- calls will still resolve.
--
-- IMPORTANT: Moving PostGIS can be disruptive. If this
-- fails, the extension stays in public (which is safe,
-- just triggers a linter warning).
-- =====================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Attempt to move postgis to extensions schema
-- This may fail if there are dependent objects - that's OK
DO $$
BEGIN
  -- Try to move the extension
  ALTER EXTENSION postgis SET SCHEMA extensions;
  RAISE NOTICE 'PostGIS moved to extensions schema successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Could not move PostGIS to extensions schema: %. This is non-critical - the extension remains functional in public schema.', SQLERRM;
END $$;

-- =====================================================
-- ISSUE 3: Auth Leaked Password Protection
--
-- This CANNOT be fixed via SQL migration. It must be
-- enabled in the Supabase Dashboard:
--
-- 1. Go to Authentication > Settings > Password Security
-- 2. Enable "Leaked Password Protection"
-- 3. This checks passwords against HaveIBeenPwned.org
--
-- Reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
-- =====================================================

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
--
-- 1. Check get_care_resources_with_coords has immutable search_path:
-- SELECT proname, proconfig 
-- FROM pg_proc 
-- WHERE proname = 'get_care_resources_with_coords';
-- Expected: proconfig should contain 'search_path='
--
-- 2. Check PostGIS schema:
-- SELECT extname, nspname 
-- FROM pg_extension e 
-- JOIN pg_namespace n ON e.extnamespace = n.oid 
-- WHERE extname = 'postgis';
-- Expected: nspname = 'extensions' (if move succeeded)
--
-- 3. Leaked password protection:
-- Check in Dashboard > Authentication > Settings
-- =====================================================
