# Deployment Steps - Simplified Model

## ✅ Completed
- [x] Migration 060 run successfully
- [x] Invalid enrollments deleted
- [x] All code changes made

## 🚀 Deploy Now

### 1. Build the application
```bash
npm run build
```

### 2. Deploy to production
```bash
# If using GitHub Pages (based on your docs folder)
npm run deploy

# Or if deploying manually
# Copy the dist folder contents to your hosting
```

### 3. Verify deployment
- [ ] Visit your production URL
- [ ] Check browser console for errors
- [ ] Test registration flow
- [ ] Test login flow

## 🧪 Post-Deployment Testing

### Critical Flows to Test:

#### 1. Student Registration & Onboarding
- [ ] Register as new student
- [ ] Complete onboarding (select neurodiversity profile, add bio)
- [ ] Redirects to `/learn/dashboard`
- [ ] No errors in console

#### 2. Instructor Registration & Onboarding
- [ ] Register as new instructor
- [ ] Complete onboarding (select expertise, add bio)
- [ ] Redirects to `/teach/dashboard`
- [ ] No errors in console

#### 3. Course Enrollment (Student)
- [ ] Browse marketplace
- [ ] Enroll in a course
- [ ] View "My Courses"
- [ ] Open course details

#### 4. Course Management (Instructor)
- [ ] Create new course
- [ ] View Students tab (should show enrolled students)
- [ ] Create sessions
- [ ] View sessions

#### 5. Chat Feature
- [ ] Instructor opens chat tab
- [ ] Student opens chat tab
- [ ] Send messages both ways
- [ ] Messages appear in real-time
- [ ] No console errors

#### 6. Profile Management
- [ ] View profile
- [ ] Edit profile
- [ ] No "Child Management" section visible
- [ ] Changes save correctly

## 🔍 What to Watch For

### Expected Changes:
- ✅ Role selection shows "Student" instead of "Parent"
- ✅ Onboarding is simplified (no child profiles)
- ✅ Profile page has no child management
- ✅ Chat works without errors
- ✅ Students tab shows enrolled students

### Red Flags:
- ❌ Console errors about "students table"
- ❌ Console errors about "student_profile_id"
- ❌ RLS policy errors
- ❌ "Parent" role still visible
- ❌ Child management UI still showing

## 📊 Monitor These

After deployment, check:
- [ ] Error logs in browser console
- [ ] Supabase logs for RLS errors
- [ ] User registration success rate
- [ ] Course enrollment success rate

## 🆘 Rollback Plan

If critical issues occur:

### Quick Rollback:
```bash
# Revert to previous deployment
git revert HEAD
npm run build
npm run deploy
```

### Database Rollback:
- Restore from backup taken before migration 060
- Contact Supabase support if needed

## 📝 Notes

- All parent accounts have been migrated to student accounts
- Parent-managed enrollments have been removed
- Students table no longer exists
- All enrollments now use student_id only

## ✅ Success Criteria

Deployment is successful when:
- [x] Application builds without errors
- [ ] Application deploys successfully
- [ ] All critical flows work
- [ ] No console errors
- [ ] Chat feature works
- [ ] Students can enroll
- [ ] Instructors can view students

---

**Ready to deploy!** Run `npm run build` to start.
