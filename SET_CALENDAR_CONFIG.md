# Set Calendar Configuration

Since you can't set database parameters from SQL Editor, you need to use one of these methods:

## Option 1: Use Supabase CLI (Recommended)

```bash
# Connect to your database with service role
supabase db remote set --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Then run:
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -c "ALTER DATABASE postgres SET app.supabase_url = 'https://[YOUR-PROJECT-REF].supabase.co';"

psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -c "ALTER DATABASE postgres SET app.supabase_anon_key = '[YOUR-ANON-KEY]';"
```

## Option 2: Contact Supabase Support

Ask them to run these commands for you:
```sql
ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE postgres SET app.supabase_anon_key = 'your-anon-key';
```

## Option 3: Temporary Workaround - Hardcode in Migration

Since enrollment emails are working, they must have the config set somehow. Let me create a version that hardcodes your project URL:

**Run this migration with YOUR actual values:**

```sql
-- Replace YOUR_PROJECT_REF with your actual project reference
-- Replace YOUR_ANON_KEY with your actual anon key

CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT := 'https://YOUR_PROJECT_REF.supabase.co';
  auth_header TEXT := 'YOUR_ANON_KEY';
BEGIN
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  BEGIN
    PERFORM
      net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || auth_header
        ),
        body := jsonb_build_object(
          'type', 'enrollment_created',
          'enrollment_id', NEW.id,
          'course_id', NEW.course_id
        )
      );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue calendar invite: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## How to Get Your Values

1. **Project URL**: Go to Project Settings → API → Project URL
2. **Anon Key**: Same page → anon public key

## After Setting

Run `SIMPLE_CALENDAR_TEST.sql` again - the first check should pass.
