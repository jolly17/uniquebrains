-- Check if vote triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%vote%';

-- Check current vote counts for answers
SELECT 
    a.id,
    a.content,
    a.vote_count,
    COUNT(v.id) as actual_vote_count,
    SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE -1 END) as calculated_vote_count
FROM answers a
LEFT JOIN votes v ON v.answer_id = a.id
GROUP BY a.id, a.content, a.vote_count
ORDER BY a.created_at DESC
LIMIT 10;

-- Check if the trigger function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%vote%';
