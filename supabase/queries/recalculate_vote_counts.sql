-- Recalculate vote counts for all questions and answers
-- Run this after fixing the triggers to correct any existing data

-- Update question vote counts
UPDATE questions q
SET vote_count = COALESCE((
  SELECT SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE -1 END)
  FROM votes v
  WHERE v.question_id = q.id
), 0);

-- Update answer vote counts
UPDATE answers a
SET vote_count = COALESCE((
  SELECT SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE -1 END)
  FROM votes v
  WHERE v.answer_id = a.id
), 0);

-- Verify the counts
SELECT 'Questions' as table_name, COUNT(*) as updated_count
FROM questions
WHERE vote_count != 0
UNION ALL
SELECT 'Answers' as table_name, COUNT(*) as updated_count
FROM answers
WHERE vote_count != 0;
