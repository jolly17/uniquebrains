-- Migration: Add email notification triggers for enrollments
-- This will automatically send emails when students enroll or unenroll

-- Create function to send enrollment email via Edge Function
CREATE OR REPLACE FUNCTION send_enrollment_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_data RECORD;
  course_data RECORD;
  instructor_data RECORD;
  email_payload JSONB;
BEGIN
  -- Get student information
  SELECT email, first_name, last_name
  INTO student_data
  FROM profiles
  WHERE id = NEW.student_id;

  -- Get course information
  SELECT id, title, instructor_id
  INTO course_data
  FROM courses
  WHERE id = NEW.course_id;

  -- Get instructor information
  SELECT email, first_name, last_name
  INTO instructor_data
  FROM profiles
  WHERE id = course_data.instructor_id;

  -- Send student enrollment confirmation email
  email_payload := jsonb_build_object(
    'type', 'student_enrolled',
    'studentEmail', student_data.email,
    'studentName', student_data.first_name || ' ' || student_data.last_name,
    'courseTitle', course_data.title,
    'courseId', course_data.id
  );

  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-enrollment-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := email_payload
  );

  -- Send instructor notification email
  email_payload := jsonb_build_object(
    'type', 'instructor_notification',
    'instructorEmail', instructor_data.email,
    'instructorName', instructor_data.first_name || ' ' || instructor_data.last_name,
    'studentName', student_data.first_name || ' ' || student_data.last_name,
    'courseTitle', course_data.title,
    'courseId', course_data.id
  );

  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-enrollment-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := email_payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send unenrollment email via Edge Function
CREATE OR REPLACE FUNCTION send_unenrollment_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_data RECORD;
  course_data RECORD;
  email_payload JSONB;
BEGIN
  -- Only send email if status changed to 'dropped'
  IF NEW.status = 'dropped' AND OLD.status != 'dropped' THEN
    -- Get student information
    SELECT email, first_name, last_name
    INTO student_data
    FROM profiles
    WHERE id = NEW.student_id;

    -- Get course information
    SELECT title
    INTO course_data
    FROM courses
    WHERE id = NEW.course_id;

    -- Send unenrollment confirmation email
    email_payload := jsonb_build_object(
      'type', 'student_unenrolled',
      'studentEmail', student_data.email,
      'studentName', student_data.first_name || ' ' || student_data.last_name,
      'courseTitle', course_data.title
    );

    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-enrollment-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := email_payload
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new enrollments
DROP TRIGGER IF EXISTS on_enrollment_created ON enrollments;
CREATE TRIGGER on_enrollment_created
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION send_enrollment_notification();

-- Create trigger for unenrollments
DROP TRIGGER IF EXISTS on_enrollment_updated ON enrollments;
CREATE TRIGGER on_enrollment_updated
  AFTER UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION send_unenrollment_notification();

-- Add comment
COMMENT ON FUNCTION send_enrollment_notification() IS 'Sends email notifications when a student enrolls in a course';
COMMENT ON FUNCTION send_unenrollment_notification() IS 'Sends email notification when a student unenrolls from a course';
