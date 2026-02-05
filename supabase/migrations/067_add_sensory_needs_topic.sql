-- =====================================================
-- Add Sensory Needs & Products Topic
-- =====================================================

INSERT INTO topics (name, slug, description, cover_image_url, created_by, is_featured) 
SELECT 
  'Sensory Needs & Products',
  'sensory-needs',
  'Share sensory challenges, solutions, and products that work! From fidget toys to weighted blankets, noise-canceling headphones to chewable jewelry - discover what helps and what doesn''t.',
  'https://media.istockphoto.com/id/2195621626/photo/girl-playing-with-slime.webp?a=1&b=1&s=612x612&w=0&k=20&c=JziHt0zdP1tXnzXBiGz5uyCDOUkeqig6lWbe_vexPrs=',
  id,
  true
FROM profiles 
WHERE email = (SELECT email FROM auth.users ORDER BY created_at LIMIT 1)
LIMIT 1;
