-- =====================================================
-- Migration: Add session reminder log table
-- Purpose: Prevent duplicate session reminder emails by tracking
--          which sessions have already had reminders sent.
-- 
-- Root Cause: The pg_cron job using net.http_post can trigger
--   the edge function multiple times due to retries, and the
--   edge function had no idempotency guard.
-- =====================================================

-- Create a table to log sent session reminders
CREATE TABLE IF NOT EXISTS session_reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL, -- The date the reminder was sent for (i.e., the session date)
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  emails_sent INTEGER NOT NULL DEFAULT 0,
  emails_failed INTEGER NOT NULL DEFAULT 0,
  UNIQUE(session_id, reminder_date) -- Prevent duplicate entries for same session + date
);

-- Add index for quick lookups
CREATE INDEX idx_session_reminder_log_session_date 
  ON session_reminder_log(session_id, reminder_date);

-- Add index for cleanup queries
CREATE INDEX idx_session_reminder_log_sent_at 
  ON session_reminder_log(sent_at);

-- RLS: Only service role should access this table (edge functions use service role key)
ALTER TABLE session_reminder_log ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - the edge function uses the service role key
-- which bypasses RLS. This ensures no regular user can read/write this table.

COMMENT ON TABLE session_reminder_log IS 'Tracks sent session reminders to prevent duplicate emails. Used by the send-session-reminders edge function for idempotency.';
COMMENT ON COLUMN session_reminder_log.session_id IS 'The session that the reminder was sent for';
COMMENT ON COLUMN session_reminder_log.reminder_date IS 'The date the session occurs (used with session_id for uniqueness)';
COMMENT ON COLUMN session_reminder_log.sent_at IS 'When the reminder emails were actually sent';
COMMENT ON COLUMN session_reminder_log.emails_sent IS 'Number of emails successfully sent for this session reminder';
COMMENT ON COLUMN session_reminder_log.emails_failed IS 'Number of emails that failed to send for this session reminder';
