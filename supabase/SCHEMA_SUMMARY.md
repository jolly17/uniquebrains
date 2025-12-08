# Database Schema Summary

## Overview
Complete PostgreSQL database schema for UniqueBrains learning platform with Row Level Security (RLS) policies.

## Tables Created

### Core Tables (Migration 001)
✅ **profiles** - User accounts with roles (student, instructor, parent, admin)
- 11 columns including role, avatar, bio, parent relationships
- RLS policies for public read, self-update, parent access
- Automatic updated_at trigger

✅ **courses** - Course catalog and metadata
- 13 columns including title, description, price, category, tags
- Indexes on instructor_id, is_published, category, created_at
- RLS policies for public published courses, instructor management
- Automatic updated_at trigger

✅ **enrollments** - Student-course relationships
- 9 columns including status, progress, completion tracking
- Unique constraint on (student_id, course_id)
- Indexes on student_id, course_id, status
- RLS policies for student/instructor access
- Automatic updated_at trigger

✅ **sessions** - Scheduled class sessions
- 12 columns including Zoom integration, recording URLs
- Indexes on course_id, session_date, status
- RLS policies for enrolled students and instructors
- Automatic updated_at trigger

### Content Tables (Migration 002)
✅ **homework** - Course assignments
- 9 columns including due dates, points, attachments
- Indexes on course_id, due_date, is_published
- RLS policies for students (published only) and instructors
- Automatic updated_at trigger

✅ **submissions** - Student homework submissions
- 11 columns including grades, feedback, status
- Unique constraint on (homework_id, student_id)
- Indexes on homework_id, student_id, status
- RLS policies for student self-access and instructor grading
- Automatic updated_at trigger

✅ **resources** - Course materials and files
- 9 columns including file type, size, public flag
- Indexes on course_id, resource_type
- RLS policies for enrolled students and instructors
- Automatic updated_at trigger

✅ **messages** - Course chat and communication
- 7 columns including content, attachments, announcements
- Indexes on course_id, sender_id, created_at
- RLS policies for course participants only
- Automatic updated_at trigger

### Supporting Tables (Migration 003)
✅ **reviews** - Course ratings and feedback
- 8 columns including 1-5 star rating, comments
- Unique constraint on (course_id, student_id)
- Indexes on course_id, student_id, rating
- RLS policies for public published reviews
- Automatic updated_at trigger

✅ **payments** - Transaction records
- 14 columns including Stripe integration, refunds, metadata
- Indexes on student_id, course_id, stripe_payment_intent_id, status
- RLS policies for student/instructor access
- Automatic updated_at trigger

✅ **notifications** - User notifications
- 10 columns including type, read status, related entities
- Indexes on user_id, is_read, created_at, type
- RLS policies for user self-access
- Automatic read_at timestamp trigger

### Performance Indexes (Migration 004)
✅ **Composite Indexes** - 14 composite indexes for common queries:
- Published courses by category
- Active enrollments by student/course
- Upcoming sessions
- Published homework by due date
- Submissions by status
- Recent messages
- Course ratings
- Successful payments
- Unread notifications

✅ **Full-Text Search** - Course search functionality:
- search_vector column on courses table
- GIN index for fast text search
- Automatic update trigger for title, description, category, tags
- Weighted search (title > description > category > tags)

## Security Features

### Row Level Security (RLS)
All 11 tables have RLS enabled with comprehensive policies:
- **Authentication**: All policies use auth.uid() for user identification
- **Authorization**: Role-based access control via profile roles
- **Data Isolation**: Users can only access their own data or authorized data
- **Instructor Access**: Instructors can manage their courses and view enrolled students
- **Student Access**: Students can access enrolled courses and own submissions
- **Parent Access**: Parents can manage children's profiles

### Foreign Key Constraints
All relationships enforce referential integrity:
- CASCADE deletes for dependent data
- SET NULL for optional relationships
- Prevents orphaned records

## Performance Optimizations

### Indexes (Total: 50+)
- Single-column indexes on all foreign keys
- Composite indexes for common query patterns
- Partial indexes for filtered queries (e.g., WHERE is_published = true)
- GIN index for full-text search

### Triggers
- Automatic updated_at timestamps on all tables
- Automatic read_at timestamp on notifications
- Automatic search_vector updates on courses

### Query Optimization
- ANALYZE commands run on all tables
- Statistics collection enabled
- Query planner optimization ready

## Data Integrity

### Constraints
- NOT NULL on required fields
- CHECK constraints for valid values (ratings 1-5, positive prices, etc.)
- UNIQUE constraints to prevent duplicates
- Foreign key constraints for relationships

### Validation
- Email uniqueness on profiles
- One enrollment per student per course
- One review per student per course
- One submission per student per homework

## Requirements Validation

✅ **Requirement 2.1**: PostgreSQL database with all core tables
✅ **Requirement 2.2**: Appropriate indexes for performance
✅ **Requirement 2.3**: Row Level Security policies on all tables
✅ **Requirement 2.6**: Foreign key constraints for referential integrity

## Migration Files
1. `001_create_core_tables.sql` (4 tables, 16 indexes, 20 RLS policies)
2. `002_create_content_tables.sql` (4 tables, 12 indexes, 20 RLS policies)
3. `003_create_supporting_tables.sql` (3 tables, 11 indexes, 15 RLS policies)
4. `004_create_additional_indexes.sql` (14 composite indexes, full-text search)

## Total Schema Stats
- **Tables**: 11
- **Indexes**: 50+
- **RLS Policies**: 55+
- **Triggers**: 13
- **Functions**: 3
- **Constraints**: 30+

## Next Steps
1. Run migrations using Supabase CLI or dashboard
2. Verify schema with test queries
3. Set up authentication (Task 4)
4. Configure storage buckets (Task 5)
5. Test RLS policies with different user roles
