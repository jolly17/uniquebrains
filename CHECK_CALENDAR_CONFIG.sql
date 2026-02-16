-- =====================================================
-- CHECK CALENDAR CONFIGURATION
-- Run this in Supabase SQL Editor to see current config
-- =====================================================

-- Check existing enrollment email configuration (should be set)
SELECT 
  'app.supabase_url' as setting_name,
  current_setting('app.supabase_url', true) as value
UNION ALL
SELECT 
  'app.supabase_anon_key' as setting_name,
  LEFT(current_setting('app.supabase_anon_key', true), 20) || '...' as value
UNION ALL
SELECT 
  'app.settings.supabase_url' as setting_name,
  current_setting('app.settings.supabase_url', true) as value
UNION ALL
SELECT 
  'app.settings.service_role_key' as setting_name,
  LEFT(current_setting('app.settings.service_role_key', true), 20) || '...' as value;

-- Check if pg_net extension is enabled
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension 
WHERE extname = 'pg_net';

-- Check if calendar triggers exist
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE '%calendar%';

-- Check if enrollment email triggers exist (for comparison)
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE '%enrollment%';
