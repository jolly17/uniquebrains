-- Migration: Remove database triggers for email notifications
-- We're switching to frontend-triggered emails instead

-- Drop the triggers
DROP TRIGGER IF EXISTS on_enrollment_created ON enrollments;
DROP TRIGGER IF EXISTS on_enrollment_updated ON enrollments;

-- Drop the trigger functions
DROP FUNCTION IF EXISTS send_enrollment_notification();
DROP FUNCTION IF EXISTS send_unenrollment_notification();

-- Add comment
COMMENT ON TABLE enrollments IS 'Email notifications are now handled by frontend after enrollment, not by database triggers';
