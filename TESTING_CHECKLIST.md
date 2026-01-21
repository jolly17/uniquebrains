# UniqueBrains Platform - Testing Checklist

Quick checklist for testing all major features. Check off items as you test them.

## Setup
- [ ] App running locally (`npm run dev`) OR deployed on GitHub Pages
- [ ] Two browser windows/tabs ready (one for instructor, one for student)
- [ ] Supabase backend connected and working

---

## 1. User Authentication

### Instructor Account
- [ ] Sign up as instructor (instructor@test.com)
- [ ] Verify email confirmation (if enabled)
- [ ] Login with instructor credentials
- [ ] See instructor dashboard
- [ ] Logout and login again

### Student Account
- [ ] Sign up as student (student@test.com)
- [ ] Login with student credentials
- [ ] See student dashboard
- [ ] Logout and login again

---

## 2. Course Creation (Instructor)

### Create Group Course
- [ ] Navigate to "Create Course"
- [ ] Fill in course title
- [ ] Add description
- [ ] Select category (e.g., Parenting)
- [ ] Select "Group Class" type
- [ ] Set max students (optional)
- [ ] Set session duration (e.g., 60 min)
- [ ] Set session time
- [ ] Set start date
- [ ] Set repeat pattern (e.g., every week)
- [ ] Select days of week (if weekly)
- [ ] Create course successfully
- [ ] Course appears in "My Courses"

### Create One-on-One Course
- [ ] Create another course
- [ ] Select "One-on-One" type
- [ ] Fill in basic details
- [ ] Create successfully (no schedule needed)

---

## 3. Course Management (Instructor)

- [ ] View course details
- [ ] Edit course information
- [ ] Update course description
- [ ] Change course settings
- [ ] Save changes successfully
- [ ] View list of enrolled students (should be 0 initially)

---

## 4. Course Enrollment (Student)

- [ ] Browse available courses
- [ ] View course details
- [ ] See course description and schedule
- [ ] Click "Enroll Now"
- [ ] Enrollment successful
- [ ] Course appears in "My Enrollments"
- [ ] Can access enrolled course

---

## 5. Homework Management (Instructor)

### Create Assignments
- [ ] Navigate to course homework section
- [ ] Click "Create Assignment"
- [ ] Fill in assignment title
- [ ] Add description and instructions
- [ ] Set due date
- [ ] Set max points (e.g., 100)
- [ ] Create assignment successfully
- [ ] Assignment visible in homework list
- [ ] Create 2-3 more assignments

### Manage Assignments
- [ ] View assignment details
- [ ] Edit assignment
- [ ] Update due date or points
- [ ] Save changes
- [ ] Delete an assignment (optional)

---

## 6. Homework Submission (Student)

### View Assignments
- [ ] Navigate to enrolled course
- [ ] Click "Homework" or "Assignments"
- [ ] See all assignments
- [ ] See due dates and points
- [ ] See submission status (Not Submitted)

### Submit Work
- [ ] Click on an assignment
- [ ] Read instructions
- [ ] Type or paste submission (for text)
- [ ] OR upload file (for file upload)
- [ ] Click "Submit Assignment"
- [ ] Submission successful
- [ ] Status changes to "Submitted"
- [ ] See submission timestamp
- [ ] Submit 2-3 assignments

---

## 7. Grading (Instructor)

### View Submissions
- [ ] Navigate to course homework
- [ ] Click on assignment
- [ ] Click "View Submissions"
- [ ] See student submission
- [ ] See submission date/time

### Grade Work
- [ ] Click on student submission
- [ ] Review submitted work
- [ ] Enter score (e.g., 95/100)
- [ ] Add feedback comments
- [ ] Submit grade
- [ ] Status changes to "Graded"
- [ ] Grade 2-3 submissions

### Edit Grades
- [ ] Click on graded submission
- [ ] Edit score
- [ ] Update feedback
- [ ] Save changes
- [ ] Verify updated grade

---

## 8. Real-time Messaging

### Setup (Both Windows)
- [ ] Instructor: Navigate to course chat
- [ ] Student: Navigate to same course chat
- [ ] Both: See "🟢 Connected" status

### Send Messages (Instructor)
- [ ] Type a message
- [ ] Click "Send"
- [ ] Message appears immediately (no refresh)
- [ ] See timestamp

### Receive Messages (Student)
- [ ] Message appears instantly in student window
- [ ] No page refresh needed
- [ ] See instructor name
- [ ] See timestamp

### Two-way Chat
- [ ] Student: Send reply message
- [ ] Instructor: See reply instantly
- [ ] Instructor: Send another message
- [ ] Student: See message instantly
- [ ] Exchange 5-10 messages
- [ ] All messages appear in real-time

### Message Persistence
- [ ] Close student browser
- [ ] Instructor sends message
- [ ] Reopen student browser and login
- [ ] Navigate to course chat
- [ ] All previous messages visible
- [ ] New message from instructor visible

---

## 9. Profile Management

### Student Profile
- [ ] Click profile icon
- [ ] Click "Edit Profile"
- [ ] Update bio
- [ ] Update contact info
- [ ] Add avatar URL (optional)
- [ ] Save changes
- [ ] Changes visible in chat messages

### Instructor Profile
- [ ] Update instructor bio
- [ ] Add expertise/skills
- [ ] Add social links (optional)
- [ ] Save changes
- [ ] Changes visible on course pages

---

## 10. Edge Cases & Advanced Features

### Course Capacity
- [ ] Create course with max students = 1
- [ ] Enroll first student
- [ ] Try to enroll second student
- [ ] Should see "Course is full" error

### Multiple Students
- [ ] Create third student account
- [ ] Enroll in same course
- [ ] Both students can access course
- [ ] Both can see chat messages
- [ ] Both can submit homework
- [ ] Instructor sees both enrollments

### Unenrollment
- [ ] Student: Click "Unenroll" or "Leave Course"
- [ ] Confirm action
- [ ] Removed from course
- [ ] Cannot access course content
- [ ] Instructor sees enrollment count decrease

### Late Submission (if applicable)
- [ ] Wait for assignment due date to pass
- [ ] OR manually change due date to past
- [ ] Student tries to submit
- [ ] See "Late" warning or blocked submission

---

## 11. Cross-Browser Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari (Mac)
- [ ] Test on Edge
- [ ] Test on mobile browser (responsive design)

---

## 12. Performance & UX

- [ ] Pages load quickly (< 3 seconds)
- [ ] No console errors
- [ ] Forms validate properly
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Navigation is intuitive
- [ ] Buttons work as expected
- [ ] Real-time updates are instant

---

## Issues Found

Document any bugs or issues here:

1. **Issue:** 
   - **Steps to reproduce:** 
   - **Expected:** 
   - **Actual:** 
   - **Severity:** High / Medium / Low

2. **Issue:** 
   - **Steps to reproduce:** 
   - **Expected:** 
   - **Actual:** 
   - **Severity:** High / Medium / Low

---

## Testing Summary

**Date Tested:** _______________

**Tested By:** _______________

**Total Tests:** _____ / _____

**Pass Rate:** _____%

**Critical Issues:** _____

**Medium Issues:** _____

**Low Issues:** _____

**Overall Status:** ✅ Pass / ⚠️ Pass with Issues / ❌ Fail

---

## Quick Test Scenarios

### Scenario 1: Complete Course Flow (15 min)
1. Instructor creates course
2. Student enrolls
3. Instructor creates homework
4. Student submits homework
5. Instructor grades homework
6. Both exchange messages in real-time

### Scenario 2: Multiple Students (10 min)
1. Create 2 student accounts
2. Both enroll in same course
3. Both submit homework
4. Instructor grades both
5. All three chat together

### Scenario 3: Real-time Stress Test (5 min)
1. Open 2 browser windows side-by-side
2. Send 20+ messages rapidly
3. Verify all appear instantly
4. Check for lag or errors
5. Verify message order is correct

---

## Notes

- Keep the detailed guide (COMPLETE_TESTING_GUIDE.md) for reference
- Use this checklist for quick daily testing
- Update checklist as new features are added
- Share with team members for collaborative testing

**Happy Testing! 🚀**
