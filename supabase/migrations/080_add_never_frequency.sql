-- Add 'never' as a valid frequency option for one-time courses
-- Drop the old constraint and create a new one with 'never' included

ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_frequency_check;

ALTER TABLE courses ADD CONSTRAINT courses_frequency_check 
CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'custom', 'never'));
