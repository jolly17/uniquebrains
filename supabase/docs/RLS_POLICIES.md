# Row Level Security (RLS) Policies Documentation

This document provides a comprehensive overview of all Row Level Security policies implemented in the UniqueBrains platform.

## Overview

Row Level Security (RLS) is enabled on all tables to ensure data access is properly restricted based on user roles and relationships. All policies follow the principle of least privilege.

## User Roles

- **Student**: Can view and manage their own data, enrolled courses, and submissions
- **Instructor**: Can manage their own courses and view enrolled students
- **Parent**: Can manage their children's profiles and view their activities
- **Admin**: Has full access to all data for platform management

---

## Profiles Table

### Read Policies
- ✅ **Public profiles are viewable by everyone** - All users can discover instructors and students
- ✅ **Parents can view children profiles** - Parents can access their children's information
- ✅ **Admins have full access** - Admins can view all profiles

### Write Policies
- ✅ **Users can insert own profile** - Users can create their profile during registration
- ✅ **Users can update own profile** - Users can modify their own information
- ✅ **Parents can update children profiles** - Parents can manage their children's profiles
- ✅ **Admins have full access** - Admins can modify any profile

---

## Courses Table

### Read Policies
- ✅ **Published courses are viewable by everyone** - Public course catalog
- ✅ **Instructors can view own courses** - Instructors see all their courses (published or not)
- ✅ **Enrolled students can view their courses** - Students can access courses they're enrolled in
- ✅ **Admins have full access** - Admins can view all courses

### Write Policies
- ✅ **Instructors can create courses** - Instructors can add new courses
- ✅ **Instructors can update own courses** - Instructors can modify their courses
- ✅ **Instructors can delete own courses** - Instructors can remove their courses
- ✅ **Admins have full access** - Admins can manage any course

---

## Enrollments Table

### Read Policies
- ✅ **Students can view own enrollments** - Students see their course enrollments
- ✅ **Instructors can view course enrollments** - Instructors see who's enrolled in their courses
- ✅ **Admins have full access** - Admins can view all enrollments

### Write Policies
- ✅ **Students can create enrollments** - Students can enroll in courses
- ✅ **Students can update own enrollments** - Students can modify their enrollment status
- ✅ **Instructors can update course enrollments** - Instructors can manage student enrollments
- ✅ **Admins have full access** - Admins can manage any enrollment

---

## Sessions Table

### Read Policies
- ✅ **Enrolled students can view course sessions** - Students see sessions for their courses
- ✅ **Instructors can view course sessions** - Instructors see sessions for their courses
- ✅ **Admins have full access** - Admins can view all sessions

### Write Policies
- ✅ **Instructors can create course sessions** - Instructors can schedule sessions
- ✅ **Instructors can update course sessions** - Instructors can modify session details
- ✅ **Instructors can delete course sessions** - Instructors can cancel sessions
- ✅ **Admins have full access** - Admins can manage any session

---

## Homework Table

### Read Policies
- ✅ **Enrolled students can view published homework** - Students see assignments for their courses
- ✅ **Instructors can view course homework** - Instructors see all homework (published or not)
- ✅ **Admins have full access** - Admins can view all homework

### Write Policies
- ✅ **Instructors can create course homework** - Instructors can create assignments
- ✅ **Instructors can update course homework** - Instructors can modify assignments
- ✅ **Instructors can delete course homework** - Instructors can remove assignments
- ✅ **Admins have full access** - Admins can manage any homework

---

## Submissions Table

### Read Policies
- ✅ **Students can view own submissions** - Students see their homework submissions
- ✅ **Instructors can view course submissions** - Instructors see all submissions for their homework
- ✅ **Admins have full access** - Admins can view all submissions

### Write Policies
- ✅ **Students can create own submissions** - Students can submit homework
- ✅ **Students can update own submissions** - Students can modify ungraded submissions
- ✅ **Instructors can update course submissions** - Instructors can grade submissions
- ✅ **Admins have full access** - Admins can manage any submission

---

## Resources Table

### Read Policies
- ✅ **Enrolled students can view course resources** - Students access materials for their courses
- ✅ **Public resources are viewable by everyone** - Public materials are accessible to all
- ✅ **Instructors can view course resources** - Instructors see all resources for their courses
- ✅ **Admins have full access** - Admins can view all resources

### Write Policies
- ✅ **Instructors can create course resources** - Instructors can upload materials
- ✅ **Instructors can update course resources** - Instructors can modify materials
- ✅ **Instructors can delete course resources** - Instructors can remove materials
- ✅ **Admins have full access** - Admins can manage any resource

---

## Messages Table

### Read Policies
- ✅ **Course participants can view messages** - Enrolled students and instructors see course chat
- ✅ **Admins have full access** - Admins can view all messages

### Write Policies
- ✅ **Course participants can create messages** - Enrolled students and instructors can send messages
- ✅ **Users can update own messages** - Users can edit their messages
- ✅ **Users can delete own messages** - Users can delete their messages
- ✅ **Admins have full access** - Admins can manage any message

---

## Reviews Table

### Read Policies
- ✅ **Published reviews are viewable by everyone** - Public reviews are visible to all
- ✅ **Students can view own reviews** - Students see their reviews (published or not)
- ✅ **Instructors can view course reviews** - Instructors see reviews for their courses
- ✅ **Admins have full access** - Admins can view all reviews

### Write Policies
- ✅ **Students can create reviews for enrolled courses** - Students can review courses they've taken
- ✅ **Students can update own reviews** - Students can modify their reviews
- ✅ **Students can delete own reviews** - Students can remove their reviews
- ✅ **Admins have full access** - Admins can manage any review

---

## Payments Table

### Read Policies
- ✅ **Students can view own payments** - Students see their payment history
- ✅ **Instructors can view course payments** - Instructors see payments for their courses
- ✅ **Admins have full access** - Admins can view all payments

### Write Policies
- ✅ **Authenticated users can create payments** - Users can initiate payments
- ✅ **System can update payments** - Backend can update payment status via webhooks
- ✅ **Admins have full access** - Admins can manage any payment

---

## Notifications Table

### Read Policies
- ✅ **Users can view own notifications** - Users see their notifications
- ✅ **Admins have full access** - Admins can view all notifications

### Write Policies
- ✅ **System can create notifications** - Backend can send notifications to users
- ✅ **Users can update own notifications** - Users can mark notifications as read
- ✅ **Users can delete own notifications** - Users can dismiss notifications
- ✅ **Admins have full access** - Admins can manage any notification

---

## Security Principles

1. **Least Privilege**: Users can only access data they need
2. **Defense in Depth**: Multiple layers of security (RLS + application logic)
3. **Explicit Permissions**: All access must be explicitly granted
4. **Audit Trail**: All policies are documented and version controlled
5. **Role-Based Access**: Permissions based on user roles and relationships

## Testing RLS Policies

To test RLS policies, use the following approach:

```sql
-- Test as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-uuid-here';

-- Run your query
SELECT * FROM courses;

-- Reset
RESET ROLE;
```

## Migration Files

RLS policies are defined in the following migration files:
- `001_create_core_tables.sql` - Profiles, Courses, Enrollments, Sessions
- `002_create_content_tables.sql` - Homework, Submissions, Resources, Messages
- `003_create_supporting_tables.sql` - Reviews, Payments, Notifications
- `005_add_missing_rls_policies.sql` - Additional admin policies and student course access

## Maintenance

When adding new tables:
1. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Create appropriate policies for each role
3. Test policies thoroughly
4. Document policies in this file
5. Update migration files
