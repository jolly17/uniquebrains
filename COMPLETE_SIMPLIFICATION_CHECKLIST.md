# Complete Simplification Checklist

## Pre-Migration Checklist

Before running migration 060, ensure:

- [ ] All code changes have been reviewed
- [ ] Backup of current database exists
- [ ] All files are committed to git
- [ ] You understand that parent-managed enrollments will be lost

## Migration 060 - Run This First

```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/060_simplify_to_single_student_model.sql
```

**What it does:**
- Drops `students` table
- Removes `student_profile_id` columns from enrollments, sessions, homework_submissions
- Drops all parent-related RLS policies
- Simplifies all RLS policies to use only `student_id`

## Post-Migration Data Cleanup

After migration 060 succeeds, run this SQL to migrate existing parent accounts:

```sql
-- Migrate parent role to student role
UPDATE profiles 
SET role = 'student' 
WHERE role = 'parent';

-- Verify the change
SELECT role, COUNT(*) 
FROM profiles 
GROUP BY role;
```

## Deployment Checklist

### 1. Database Changes
- [ ] Run migration 060 in Supabase SQL Editor
- [ ] Verify migration completed without errors
- [ ] Run data cleanup SQL (migrate parent → student)
- [ ] Verify all profiles have valid roles (student or instructor)

### 2. Code Deployment
- [ ] Deploy updated backend services
- [ ] Deploy updated frontend pages
- [ ] Clear any cached builds
- [ ] Restart application if needed

### 3. Functional Testing

#### Authentication & Registration
- [ ] Register new student account
- [ ] Register new instructor account
- [ ] Login as student
- [ ] Login as instructor
- [ ] OAuth signup as student
- [ ] OAuth signup as instructor

#### Onboarding
- [ ] Complete onboarding as student
- [ ] Complete onboarding as instructor
- [ ] Neurodiversity profile saves correctly
- [ ] Bio field saves correctly
- [ ] Redirects to correct dashboard after onboarding

#### Course Management (Instructor)
- [ ] Create new course
- [ ] View course details
- [ ] View enrolled students in Students tab
- [ ] Create sessions for group course
- [ ] Create sessions for 1-on-1 course
- [ ] View sessions

#### Course Enrollment (Student)
- [ ] Browse marketplace
- [ ] Enroll in group course
- [ ] Enroll in 1-on-1 course
- [ ] View "My Courses"
- [ ] View course details
- [ ] View sessions

#### Chat Feature
- [ ] Instructor sends message in group course
- [ ] Student sends message in group course
- [ ] Instructor sends message in 1-on-1 course
- [ ] Student sends message in 1-on-1 course
- [ ] Messages appear in real-time
- [ ] Conversation threads load correctly
- [ ] No errors in console

#### Profile Management
- [ ] View student profile
- [ ] Edit student profile
- [ ] View instructor profile
- [ ] Edit instructor profile
- [ ] No "Child Management" section visible
- [ ] Profile updates save correctly

#### Sessions
- [ ] Student can view sessions for enrolled courses
- [ ] Instructor can create sessions
- [ ] Instructor can edit sessions
- [ ] Instructor can delete sessions
- [ ] Sessions show correct student for 1-on-1 courses

### 4. Error Checking

Check browser console for:
- [ ] No RLS policy errors
- [ ] No "students table" errors
- [ ] No "student_profile_id" errors
- [ ] No infinite recursion errors
- [ ] No join errors

Check Supabase logs for:
- [ ] No policy violations
- [ ] No missing column errors
- [ ] No foreign key errors

### 5. Data Integrity

Verify in database:
```sql
-- Check no orphaned enrollments
SELECT COUNT(*) FROM enrollments 
WHERE student_id NOT IN (SELECT id FROM profiles);
-- Should return 0

-- Check no orphaned sessions
SELECT COUNT(*) FROM sessions 
WHERE student_id IS NOT NULL 
AND student_id NOT IN (SELECT id FROM profiles);
-- Should return 0

-- Check all enrollments have student_id
SELECT COUNT(*) FROM enrollments WHERE student_id IS NULL;
-- Should return 0

-- Check students table is gone
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'students'
);
-- Should return false
```

## Rollback Plan (If Needed)

If critical issues are found:

### 1. Database Rollback
```sql
-- Restore from backup taken before migration 060
-- Contact Supabase support or use your backup strategy
```

### 2. Code Rollback
```bash
# Revert to previous commit
git revert HEAD
git push

# Or restore specific files
git checkout HEAD~1 src/services/enrollmentService.js
git checkout HEAD~1 src/services/sessionService.js
git checkout HEAD~1 src/services/messageService.js
git checkout HEAD~1 src/pages/Onboarding.jsx
# ... etc
```

### 3. Restore Onboarding
```bash
# If only onboarding needs rollback
cp src/pages/Onboarding.jsx.backup src/pages/Onboarding.jsx
```

## Success Criteria

Migration is successful when:
- ✅ All tests pass
- ✅ No console errors
- ✅ Students can enroll in courses
- ✅ Instructors can view enrolled students
- ✅ Chat works for both group and 1-on-1 courses
- ✅ Sessions work for both course types
- ✅ No parent/child UI elements visible
- ✅ All roles are either 'student' or 'instructor'

## Known Limitations

After simplification:
- Parents must create separate accounts for each child
- No parent dashboard to manage multiple children
- Each student account is independent
- No parent-child relationship tracking

## Future Considerations

Can add back as P1 (post-launch):
- Parent accounts with child management
- Family subscriptions
- Parent dashboard
- Parental controls

## Support

If issues arise:
1. Check browser console for errors
2. Check Supabase logs
3. Review migration 060 output
4. Check this checklist for missed steps
5. Consider rollback if critical

## Files Changed

### Database:
- `supabase/migrations/060_simplify_to_single_student_model.sql`

### Backend Services:
- `src/services/enrollmentService.js`
- `src/services/sessionService.js`
- `src/services/messageService.js`

### Frontend Pages:
- `src/pages/Register.jsx`
- `src/pages/RoleSelection.jsx`
- `src/pages/Login.jsx`
- `src/pages/AuthCallback.jsx`
- `src/pages/Onboarding.jsx`
- `src/pages/StudentProfile.jsx`
- `src/pages/TermsOfService.jsx`
- `src/pages/PrivacyPolicy.jsx`
- `src/pages/CourseStudents.jsx`
- `src/pages/ManageSessions.jsx`

### Documentation:
- `SIMPLIFICATION_SUMMARY.md`
- `FRONTEND_SIMPLIFICATION_SUMMARY.md`
- `COMPLETE_SIMPLIFICATION_CHECKLIST.md` (this file)

## Timeline

1. **Pre-Migration** (5 min)
   - Review checklist
   - Backup database
   - Commit code

2. **Migration** (2 min)
   - Run migration 060
   - Run data cleanup SQL

3. **Deployment** (5 min)
   - Deploy code
   - Restart services

4. **Testing** (15-20 min)
   - Run through all test scenarios
   - Check for errors

5. **Monitoring** (ongoing)
   - Watch for errors
   - Monitor user feedback

**Total Estimated Time: 30-35 minutes**

## Contact

If you need help:
- Review error messages carefully
- Check Supabase dashboard
- Review git history for changes
- Consider rollback if needed

---

**Ready to proceed?**
1. ✅ Review this checklist
2. ✅ Backup database
3. ✅ Run migration 060
4. ✅ Run data cleanup SQL
5. ✅ Deploy code
6. ✅ Test thoroughly
