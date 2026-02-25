-- Add separate lat/lng columns for easier querying
-- This avoids the PostGIS type matching issues

ALTER TABLE care_resources 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Create index for faster location queries
CREATE INDEX IF NOT EXISTS idx_care_resources_lat_lng ON care_resources(lat, lng);

-- Update existing records to extract lat/lng from PostGIS coordinates
UPDATE care_resources 
SET 
  lat = ST_Y(coordinates::geometry),
  lng = ST_X(coordinates::geometry)
WHERE coordinates IS NOT NULL;
