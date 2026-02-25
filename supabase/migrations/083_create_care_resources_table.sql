-- Migration: Create care_resources table with PostGIS support
-- Description: Sets up the care roadmap feature with location-based resource filtering
-- Date: 2026-02-25

-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create care_resources table
-- Note: milestone field is flexible - no CHECK constraint to allow easy addition of new milestones
CREATE TABLE IF NOT EXISTS care_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Address fields
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 country code (e.g., 'US', 'IN', 'GB')
  
  -- Geographic coordinates (PostGIS type for efficient spatial queries)
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  
  -- Contact information
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  
  -- Resource metadata
  experience_years INTEGER CHECK (experience_years >= 0 AND experience_years <= 100),
  tags TEXT[] DEFAULT '{}', -- Array of tags like ['autism', 'adhd', 'speech-therapy']
  rating DECIMAL(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://')
);

-- Create indexes for performance
CREATE INDEX idx_care_resources_milestone ON care_resources(milestone);
CREATE INDEX idx_care_resources_country ON care_resources(country);
CREATE INDEX idx_care_resources_milestone_country ON care_resources(milestone, country);
CREATE INDEX idx_care_resources_coordinates ON care_resources USING GIST(coordinates);
CREATE INDEX idx_care_resources_tags ON care_resources USING GIN(tags);
CREATE INDEX idx_care_resources_verified ON care_resources(verified) WHERE verified = true;
CREATE INDEX idx_care_resources_rating ON care_resources(rating DESC NULLS LAST);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_care_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_care_resources_updated_at
  BEFORE UPDATE ON care_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_care_resources_updated_at();

-- Create PostgreSQL function for radius-based resource queries
CREATE OR REPLACE FUNCTION resources_within_radius(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION,
  milestone_filter VARCHAR(50) DEFAULT NULL
)
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
  coordinates GEOGRAPHY,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  experience_years INTEGER,
  tags TEXT[],
  rating DECIMAL(2,1),
  review_count INTEGER,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.*,
    ST_Distance(
      cr.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) as distance
  FROM care_resources cr
  WHERE 
    ST_DWithin(
      cr.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
    AND (milestone_filter IS NULL OR cr.milestone = milestone_filter)
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql STABLE;

-- Set up Row Level Security (RLS)
ALTER TABLE care_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access for all resources
CREATE POLICY "care_resources_public_read"
  ON care_resources
  FOR SELECT
  USING (true);

-- Policy: Admin write access (insert, update, delete)
CREATE POLICY "care_resources_admin_insert"
  ON care_resources
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "care_resources_admin_update"
  ON care_resources
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "care_resources_admin_delete"
  ON care_resources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment to table
COMMENT ON TABLE care_resources IS 'Care roadmap resources with location-based filtering using PostGIS';
COMMENT ON COLUMN care_resources.milestone IS 'Care stage - defined in src/data/milestones.js configuration file';
COMMENT ON COLUMN care_resources.coordinates IS 'Geographic coordinates stored as PostGIS GEOGRAPHY type for efficient spatial queries';
COMMENT ON COLUMN care_resources.tags IS 'Array of tags for filtering (e.g., autism, ADHD, dyslexia)';
COMMENT ON COLUMN care_resources.verified IS 'Admin-verified resource badge';
COMMENT ON FUNCTION resources_within_radius IS 'Find resources within a radius (in meters) of a given lat/lng point';
