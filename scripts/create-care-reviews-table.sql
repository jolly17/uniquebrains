-- Create care_reviews table for care resource reviews
-- This is separate from the course reviews table

CREATE TABLE IF NOT EXISTS care_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES care_resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_care_reviews_resource_id ON care_reviews(resource_id);
CREATE INDEX IF NOT EXISTS idx_care_reviews_user_id ON care_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_care_reviews_approved ON care_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_care_reviews_created_at ON care_reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE care_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON care_reviews
  FOR SELECT
  USING (is_approved = true);

-- Policy: Anyone can insert reviews (authenticated or anonymous)
CREATE POLICY "Anyone can insert reviews"
  ON care_reviews
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own reviews (before approval)
CREATE POLICY "Users can update own reviews"
  ON care_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_approved = false)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all reviews"
  ON care_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to update resource rating when reviews change
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the care_resources table with new average rating and count
  UPDATE care_resources
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM care_reviews
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
      AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM care_reviews
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
      AND is_approved = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update resource rating
DROP TRIGGER IF EXISTS update_resource_rating_trigger ON care_reviews;
CREATE TRIGGER update_resource_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON care_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();

-- Add comment
COMMENT ON TABLE care_reviews IS 'Reviews for care resources - separate from course reviews';
