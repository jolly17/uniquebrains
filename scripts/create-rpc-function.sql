-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_care_resources_with_coords(text,text[],boolean,integer,integer);

-- Create RPC function to get care resources with extracted coordinates
-- This function extracts lat/lng from PostGIS geometry for easier client-side use

CREATE OR REPLACE FUNCTION get_care_resources_with_coords(
  p_milestone TEXT,
  p_tags TEXT[] DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  milestone VARCHAR(50),
  name VARCHAR(255),
  description TEXT,
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(2),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),
  experience_years INTEGER,
  tags TEXT[],
  rating NUMERIC(3,2),
  review_count INTEGER,
  verified BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.milestone,
    cr.name,
    cr.description,
    cr.address,
    cr.city,
    cr.state,
    cr.zip_code,
    cr.country,
    ST_Y(cr.coordinates::geometry) as lat,
    ST_X(cr.coordinates::geometry) as lng,
    cr.phone,
    cr.email,
    cr.website,
    cr.experience_years,
    cr.tags,
    cr.rating,
    cr.review_count,
    cr.verified,
    cr.created_at,
    cr.updated_at
  FROM care_resources cr
  WHERE cr.milestone = p_milestone
    AND (p_tags IS NULL OR cr.tags && p_tags)
    AND (p_verified_only = FALSE OR cr.verified = TRUE)
  ORDER BY cr.name
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
