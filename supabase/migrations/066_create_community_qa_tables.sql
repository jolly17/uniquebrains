-- =====================================================
-- Community Q&A Platform Tables
-- Creates: topics, questions, answers, votes
-- =====================================================

-- =====================================================
-- TOPICS TABLE
-- Stores community discussion topics/themes
-- =====================================================
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  question_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for topics table
CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_created_by ON topics(created_by);
CREATE INDEX idx_topics_is_featured ON topics(is_featured);

-- Enable Row Level Security on topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics
-- Everyone can view topics
CREATE POLICY "Topics are viewable by everyone"
  ON topics FOR SELECT
  USING (true);

-- Authenticated users can create topics
CREATE POLICY "Authenticated users can create topics"
  ON topics FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own topics
CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  USING (auth.uid() = created_by);

-- =====================================================
-- QUESTIONS TABLE
-- Stores questions posted in topics
-- =====================================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  answer_count INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  best_answer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for questions table
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_author_id ON questions(author_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_vote_count ON questions(vote_count DESC);

-- Enable Row Level Security on questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
-- Everyone can view questions
CREATE POLICY "Questions are viewable by everyone"
  ON questions FOR SELECT
  USING (true);

-- Authenticated users can create questions
CREATE POLICY "Authenticated users can create questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own questions
CREATE POLICY "Users can update own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete own questions"
  ON questions FOR DELETE
  USING (auth.uid() = author_id);

-- =====================================================
-- ANSWERS TABLE
-- Stores answers to questions
-- =====================================================
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  is_best_answer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for answers table
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_author_id ON answers(author_id);
CREATE INDEX idx_answers_vote_count ON answers(vote_count DESC);

-- Enable Row Level Security on answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for answers
-- Everyone can view answers
CREATE POLICY "Answers are viewable by everyone"
  ON answers FOR SELECT
  USING (true);

-- Authenticated users can create answers
CREATE POLICY "Authenticated users can create answers"
  ON answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own answers
CREATE POLICY "Users can update own answers"
  ON answers FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete own answers"
  ON answers FOR DELETE
  USING (auth.uid() = author_id);

-- =====================================================
-- VOTES TABLE
-- Stores upvotes/downvotes for questions and answers
-- =====================================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vote_target_check CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL)
  ),
  UNIQUE(user_id, question_id),
  UNIQUE(user_id, answer_id)
);

-- Indexes for votes table
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_question_id ON votes(question_id);
CREATE INDEX idx_votes_answer_id ON votes(answer_id);

-- Enable Row Level Security on votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
-- Users can view all votes
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

-- Users can create their own votes
CREATE POLICY "Users can create own votes"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR VOTE COUNTING
-- =====================================================

-- Function to update question vote count
CREATE OR REPLACE FUNCTION update_question_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE questions
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE questions
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 2 ELSE -2 END
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions
    SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update answer vote count
CREATE OR REPLACE FUNCTION update_answer_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE answers
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE answers
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 2 ELSE -2 END
    WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE answers
    SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.answer_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for vote counting
CREATE TRIGGER trigger_update_question_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  WHEN (NEW.question_id IS NOT NULL OR OLD.question_id IS NOT NULL)
  EXECUTE FUNCTION update_question_vote_count();

CREATE TRIGGER trigger_update_answer_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  WHEN (NEW.answer_id IS NOT NULL OR OLD.answer_id IS NOT NULL)
  EXECUTE FUNCTION update_answer_vote_count();

-- =====================================================
-- SEED DATA - Initial Topics
-- =====================================================
INSERT INTO topics (name, slug, description, cover_image_url, created_by, is_featured) VALUES
(
  'Food & Recipe Ideas',
  'food-recipes',
  'Share your favorite neurodiversity-friendly recipes, meal planning tips, and food sensory accommodations. From picky eaters to texture preferences, let''s make mealtime easier!',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  true
),
(
  'Traveling Tips',
  'traveling-tips',
  'Planning trips with neurodivergent family members? Share your travel hacks, sensory-friendly destinations, airport strategies, and accommodation recommendations.',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  true
),
(
  'School Suggestions',
  'school-suggestions',
  'Navigate the education system together! Discuss IEPs, 504 plans, school accommodations, homeschooling, and finding the right learning environment for your child.',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  true
),
(
  'Book Club',
  'book-club',
  'Recommend books about neurodiversity, parenting, self-advocacy, and more. Share what you''re reading and discover new perspectives from our community.',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  true
),
(
  'Unfiltered Parenting',
  'unfiltered-parenting',
  'Real talk about the challenges and joys of parenting neurodivergent children. No judgment, just honest conversations and mutual support.',
  'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=400&fit=crop',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  true
);
