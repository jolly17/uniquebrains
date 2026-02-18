-- Fix vote count trigger functions to return proper values
-- The issue is that AFTER triggers should return NULL or the row value

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_question_vote_count ON votes;
DROP TRIGGER IF EXISTS trigger_update_answer_vote_count ON votes;

-- Recreate the question vote count function
CREATE OR REPLACE FUNCTION update_question_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.question_id IS NOT NULL THEN
    UPDATE questions
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.question_id IS NOT NULL THEN
    -- When changing vote type, we need to adjust by 2 (remove old, add new)
    UPDATE questions
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 2 ELSE -2 END
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.question_id IS NOT NULL THEN
    UPDATE questions
    SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the answer vote count function
CREATE OR REPLACE FUNCTION update_answer_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.answer_id IS NOT NULL THEN
    UPDATE answers
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.answer_id IS NOT NULL THEN
    -- When changing vote type, we need to adjust by 2 (remove old, add new)
    UPDATE answers
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 2 ELSE -2 END
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.answer_id IS NOT NULL THEN
    UPDATE answers
    SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.answer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
CREATE TRIGGER trigger_update_question_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_question_vote_count();

CREATE TRIGGER trigger_update_answer_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_vote_count();
