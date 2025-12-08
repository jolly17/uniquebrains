-- =====================================================
-- Content Tables Migration
-- Creates: homework, submissions, resources, messages
-- Requirements: 2.1
-- =====================================================

-- =====================================================
-- HOMEWORK TABLE
-- Stores assignments and due dates
-- =====================================================
CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  max_points INTEGER NOT NULL DEFAULT 100 CHECK (max_points > 0),
  attachment_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for homework table
CREATE INDEX idx_homework_course_id ON homework(course_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_homework_is_published ON homework(is_published);

-- Enable Row Level Security on homework
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homework
-- Enrolled students can view published homework for their courses
CREATE POLICY "Enrolled students can view published homework"
  ON homework FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = homework.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Instructors can view all homework for their courses
CREATE POLICY "Instructors can view course homework"
  ON homework FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = homework.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can create homework for their courses
CREATE POLICY "Instructors can create course homework"
  ON homework FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = homework.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can update homework for their courses
CREATE POLICY "Instructors can update course homework"
  ON homework FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = homework.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can delete homework for their courses
CREATE POLICY "Instructors can delete course homework"
  ON homework FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = homework.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- =====================================================
-- SUBMISSIONS TABLE
-- Stores student homework submissions
-- =====================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade INTEGER CHECK (grade >= 0),
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'resubmit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(homework_id, student_id)
);

-- Indexes for submissions table
CREATE INDEX idx_submissions_homework_id ON submissions(homework_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- Enable Row Level Security on submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submissions
-- Students can view their own submissions
CREATE POLICY "Students can view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = student_id);

-- Instructors can view submissions for their course homework
CREATE POLICY "Instructors can view course submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM homework
      JOIN courses ON courses.id = homework.course_id
      WHERE homework.id = submissions.homework_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Students can create their own submissions
CREATE POLICY "Students can create own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own submissions (before grading)
CREATE POLICY "Students can update own submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() = student_id AND status != 'graded');

-- Instructors can update submissions for their course homework (for grading)
CREATE POLICY "Instructors can update course submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM homework
      JOIN courses ON courses.id = homework.course_id
      WHERE homework.id = submissions.homework_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- =====================================================
-- RESOURCES TABLE
-- Stores course materials and files
-- =====================================================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('document', 'video', 'link', 'image', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER CHECK (file_size > 0),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for resources table
CREATE INDEX idx_resources_course_id ON resources(course_id);
CREATE INDEX idx_resources_resource_type ON resources(resource_type);

-- Enable Row Level Security on resources
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources
-- Enrolled students can view resources for their courses
CREATE POLICY "Enrolled students can view course resources"
  ON resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = resources.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Public resources are viewable by everyone
CREATE POLICY "Public resources are viewable by everyone"
  ON resources FOR SELECT
  USING (is_public = true);

-- Instructors can view resources for their courses
CREATE POLICY "Instructors can view course resources"
  ON resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = resources.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can create resources for their courses
CREATE POLICY "Instructors can create course resources"
  ON resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = resources.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can update resources for their courses
CREATE POLICY "Instructors can update course resources"
  ON resources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = resources.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can delete resources for their courses
CREATE POLICY "Instructors can delete course resources"
  ON resources FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = resources.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- =====================================================
-- MESSAGES TABLE
-- Stores chat and communication
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_announcement BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for messages table
CREATE INDEX idx_messages_course_id ON messages(course_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
-- Course participants (enrolled students and instructor) can view messages
CREATE POLICY "Course participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = messages.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = messages.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Course participants can create messages
CREATE POLICY "Course participants can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.course_id = messages.course_id
        AND enrollments.student_id = auth.uid()
        AND enrollments.status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = messages.course_id
        AND courses.instructor_id = auth.uid()
      )
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- Automatically update updated_at timestamp
-- =====================================================
CREATE TRIGGER update_homework_updated_at
  BEFORE UPDATE ON homework
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
