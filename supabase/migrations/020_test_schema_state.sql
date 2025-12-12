-- =====================================================
-- Schema State Test - Run this to check current state
-- This helps verify what columns exist before running migration 020
-- =====================================================

-- Check courses table columns
SELECT 'COURSES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- Check sessions table columns  
SELECT 'SESSIONS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- Check homework table columns
SELECT 'HOMEWORK TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'homework'
ORDER BY ordinal_position;

-- Check submissions table columns
SELECT 'SUBMISSIONS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

-- Check messages table columns
SELECT 'MESSAGES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Check what constraints exist
SELECT 'EXISTING CONSTRAINTS:' as info;
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('courses', 'sessions', 'homework', 'submissions', 'messages')
  AND tc.constraint_type IN ('CHECK', 'UNIQUE', 'FOREIGN KEY')
ORDER BY tc.table_name, tc.constraint_type;