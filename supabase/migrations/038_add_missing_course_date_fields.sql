-- Add missing date and frequency fields to courses table
-- These fields are needed to store course schedule information

-- Add start_date column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'start_date') THEN
    ALTER TABLE courses ADD COLUMN start_date DATE;
  END IF;
END $$;

-- Add end_date column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'end_date') THEN
    ALTER TABLE courses ADD COLUMN end_date DATE;
  END IF;
END $$;

-- Add has_end_date column (to track if end date is specified)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_end_date') THEN
    ALTER TABLE courses ADD COLUMN has_end_date BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add session_time column (time of day for sessions)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'session_time') THEN
    ALTER TABLE courses ADD COLUMN session_time TIME;
  END IF;
END $$;

-- Add selected_days column (days of week for sessions)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'selected_days') THEN
    ALTER TABLE courses ADD COLUMN selected_days TEXT[];
  END IF;
END $$;

-- Add frequency column (weekly, biweekly, etc.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'frequency') THEN
    ALTER TABLE courses ADD COLUMN frequency TEXT DEFAULT 'weekly';
  END IF;
END $$;

-- Add constraint for frequency values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'courses_frequency_check') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_frequency_check 
    CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'custom'));
  END IF;
END $$;

-- Create index for start_date for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_start_date ON courses(start_date);

-- Create index for selected_days for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_selected_days ON courses USING GIN(selected_days);