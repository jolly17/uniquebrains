# Frontend Simplification Summary

## Date: January 27, 2026

## Overview
Updated all frontend pages to reflect the simplified **1 Account = 1 Student** model, removing all parent/child profile management UI.

## Changes Made

### 1. Role Changes: "Parent" → "Student"

All references to "parent" role have been changed to "student" role throughout the application.

#### Files Updated:

**Authentication & Onboarding:**
- `src/pages/Register.jsx`
  - Changed default role from 'parent' to 'student'
  - Updated role card: "Parent" → "Student" with 🎓 icon
  - Removed note about "Student profiles are created by parents"
  - Updated Google OAuth button text

- `src/pages/RoleSelection.jsx`
  - Changed default role from 'parent' to 'student'
  - Updated role card: "Parent" → "Student" with 🎓 icon
  - Updated button text to show "Student" instead of "Parent"

- `src/pages/Login.jsx`
  - Changed navigation logic: 'parent' → 'student'

- `src/pages/AuthCallback.jsx`
  - Updated OAuth callback to use 'student' as default role
  - Changed role validation logic

**Onboarding:**
- `src/pages/Onboarding.jsx` (COMPLETELY REWRITTEN)
  - Removed all parent/child profile creation logic
  - Removed student management section
  - Removed "Add Your Children" form
  - Simplified to just: Role selection + Neurodiversity profile + Bio
  - Default role changed to 'student'
  - Backup created: `Onboarding.jsx.backup`

**Profile Management:**
- `src/pages/StudentProfile.jsx`
  - Removed "Child Management" section entirely
  - Removed "Manage Children" button
  - No more navigation to `/learn/manage-students`

**Legal Pages:**
- `src/pages/TermsOfService.jsx`
  - Removed "Parent Accounts" from account types
  - Changed from 3 account types to 2 (Student, Instructor)
  - Updated age requirements (removed parent-specific language)
  - Updated communication tools description

- `src/pages/PrivacyPolicy.jsx`
  - Updated "Student Information" section
  - Removed parent-specific data collection language
  - Simplified children's privacy section
  - Updated age consent requirements

### 2. Removed Features

**Completely Removed:**
- ❌ Parent account type
- ❌ Child profile creation
- ❌ "Add Your Children" form in onboarding
- ❌ Student management page link
- ❌ Child Management section in profile
- ❌ Parent-child relationship UI
- ❌ Multiple student profiles per account

**Simplified:**
- ✅ Single role selection: Student or Instructor
- ✅ Direct enrollment (no parent intermediary)
- ✅ One account = one user = one student

### 3. New User Flow

#### Student Registration:
1. User signs up → Creates account
2. Selects role: **Student** or Instructor
3. Completes onboarding:
   - Neurodiversity profile (optional)
   - Bio
4. Redirected to `/learn/dashboard`
5. Can enroll in courses directly

#### Instructor Registration:
1. User signs up → Creates account
2. Selects role: Student or **Instructor**
3. Completes onboarding:
   - Teaching specializations
   - Neurodiversity profile (optional)
   - Bio
4. Redirected to `/teach/dashboard`
5. Can create and manage courses

### 4. UI Changes

**Role Cards:**
```
Before:                    After:
👨‍👩‍👧‍👦 Parent                  🎓 Student
Manage children's learning  Enroll in courses and learn

👨‍🏫 Instructor               👨‍🏫 Instructor
Create and teach courses    Create and teach courses
```

**Onboarding Sections:**
```
Before:                    After:
- Role Selection           - Role Selection
- Teaching Specializations - Teaching Specializations (instructors)
- Personal Neurodiversity  - Neurodiversity Profile (all users)
- Add Your Children        - About You (bio)
- Submit                   - Submit
```

### 5. Navigation Changes

**Removed Routes:**
- `/learn/manage-students` (no longer accessible)

**Updated Redirects:**
- After onboarding:
  - Instructor → `/teach/dashboard`
  - Student → `/learn/dashboard` (was `/learn/dashboard` for parents)

### 6. Backup Files Created

For safety, backups were created:
- `src/pages/Onboarding.jsx.backup` - Original onboarding with parent/child logic
- `src/pages/Onboarding_SIMPLIFIED.jsx` - New simplified version (source)

## Testing Checklist

After deploying these changes, test:

**Registration Flow:**
- [ ] Register as Student
- [ ] Register as Instructor
- [ ] OAuth signup as Student
- [ ] OAuth signup as Instructor

**Onboarding Flow:**
- [ ] Complete onboarding as Student
- [ ] Complete onboarding as Instructor
- [ ] Neurodiversity profile selection works
- [ ] Bio field saves correctly
- [ ] Redirects to correct dashboard

**Profile Management:**
- [ ] View profile as Student
- [ ] View profile as Instructor
- [ ] Edit profile works
- [ ] No "Child Management" section visible

**Course Enrollment:**
- [ ] Student can browse courses
- [ ] Student can enroll in courses
- [ ] Enrollment shows in "My Courses"

**Legal Pages:**
- [ ] Terms of Service displays correctly
- [ ] Privacy Policy displays correctly
- [ ] No parent-specific language visible

## Migration Impact

**Existing Users:**
- Users with role='parent' will need to be migrated to role='student'
- This can be done with a simple SQL update:
  ```sql
  UPDATE profiles SET role = 'student' WHERE role = 'parent';
  ```

**Data Cleanup:**
- Any existing child profiles in the students table will be deleted by migration 060
- Parent-managed enrollments (student_profile_id) will be lost

## Rollback Plan

If needed to rollback:
1. Restore `Onboarding.jsx` from `Onboarding.jsx.backup`
2. Revert all other file changes from git
3. Do NOT run migration 060

## Files Modified

### Authentication & Onboarding:
- `src/pages/Register.jsx`
- `src/pages/RoleSelection.jsx`
- `src/pages/Login.jsx`
- `src/pages/AuthCallback.jsx`
- `src/pages/Onboarding.jsx` (completely rewritten)

### Profile:
- `src/pages/StudentProfile.jsx`

### Legal:
- `src/pages/TermsOfService.jsx`
- `src/pages/PrivacyPolicy.jsx`

### Backups Created:
- `src/pages/Onboarding.jsx.backup`
- `src/pages/Onboarding_SIMPLIFIED.jsx`

## Status

✅ All frontend pages updated  
✅ Role changed from "parent" to "student"  
✅ Child management UI removed  
✅ Onboarding simplified  
✅ Legal pages updated  
✅ Backups created  
⏳ Ready to test with migration 060  
