-- Fix RLS policies to allow parents to see messages they send on behalf of their children
-- Issue: Parents couldn't see their own sent messages because sender_id = parent but we only checked auth.uid()

-- Drop the 1-on-1 message policy
DROP POLICY IF EXISTS "Users can view their own 1-on-1 messages" ON messages;

-- Recreate with parent support
CREATE POLICY "Users can view their own 1-on-1 messages"
  ON messages FOR SELECT
  USING (
    recipient_id IS NOT NULL
    AND (
      -- User is the sender
      sender_id = auth.uid() 
      -- User is the recipient
      OR recipient_id = auth.uid()
      -- User is a parent whose child is the sender (parent sent on behalf of child)
      OR EXISTS (
        SELECT 1 FROM students
        WHERE students.parent_id = auth.uid()
        AND students.id = messages.sender_id
      )
      -- User is a parent whose child is the recipient
      OR EXISTS (
        SELECT 1 FROM students
        WHERE students.parent_id = auth.uid()
        AND students.id = messages.recipient_id
      )
    )
  );
