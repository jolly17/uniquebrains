-- Enable password leak protection
-- This helps prevent users from using compromised passwords

-- Note: This setting is typically configured in Supabase dashboard
-- under Authentication > Settings > Password Protection

-- If you want to enable it via SQL, you would need to update the auth config
-- However, this is best done through the Supabase dashboard:
-- 1. Go to Authentication > Settings
-- 2. Scroll to "Password Protection"
-- 3. Enable "Leaked Password Protection"

-- This migration serves as documentation that this setting should be enabled
-- The actual configuration must be done in the Supabase dashboard

-- For reference, when enabled, Supabase checks passwords against the
-- Have I Been Pwned database to prevent use of compromised passwords