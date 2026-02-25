-- Remove duplicate care resources
-- Keeps the oldest record (earliest created_at) for each unique name

-- First, let's see how many duplicates we have
-- SELECT name, COUNT(*) as count 
-- FROM care_resources 
-- GROUP BY name 
-- HAVING COUNT(*) > 1;

-- Delete duplicates, keeping only the oldest record for each name
DELETE FROM care_resources
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY name, milestone 
             ORDER BY created_at ASC
           ) as row_num
    FROM care_resources
  ) t
  WHERE row_num > 1
);

-- Verify the cleanup
SELECT COUNT(*) as total_resources FROM care_resources;
SELECT milestone, COUNT(*) as count FROM care_resources GROUP BY milestone;
