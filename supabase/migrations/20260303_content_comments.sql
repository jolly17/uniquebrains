-- Create content_comments table for comments on content pages
-- Migration: 20260303_content_comments.sql

-- Create enum type for content pages
CREATE TYPE content_page_type AS ENUM ('neurodiversity', 'sensory_differences', 'hygiene_guide');

-- Create content_comments table
CREATE TABLE IF NOT EXISTS content_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_page content_page_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_content_comments_page ON content_comments(content_page);
CREATE INDEX idx_content_comments_user ON content_comments(user_id);
CREATE INDEX idx_content_comments_created ON content_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can read approved comments
CREATE POLICY "Anyone can read approved comments"
  ON content_comments
  FOR SELECT
  USING (is_approved = true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON content_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON content_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON content_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_content_comments_updated_at
  BEFORE UPDATE ON content_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_content_comments_updated_at();

-- Grant permissions
GRANT SELECT ON content_comments TO anon;
GRANT ALL ON content_comments TO authenticated;