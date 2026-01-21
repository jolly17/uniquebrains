# UniqueBrains Platform - Complete Testing Guide

This guide walks you through testing all major features of the UniqueBrains platform, from course creation to grading and messaging.

## Table of Contents
1. [Setup & Prerequisites](#setup--prerequisites)
2. [User Registration & Authentication](#user-registration--authentication)
3. [Instructor: Course Creation](#instructor-course-creation)
4. [Student: Course Enrollment](#student-course-enrollment)
5. [Instructor: Course Management](#instructor-course-management)
6. [Instructor: Homework Management](#instructor-homework-management)
7. [Student: Homework Submission](#student-homework-submission)
8. [Instructor: Grading & Feedback](#instructor-grading--feedback)
9. [Real-time Messaging](#real-time-messaging)
10. [Profile Management](#profile-management)

---

## Setup & Prerequisites

### What You Need
- Two browser windows or two different browsers (to test instructor and student roles)
- Or use Incognito/Private mode for the second user
- Your app running locally: `npm run dev` OR deployed on GitHub Pages

### Test Accounts Setup
You'll need to create:
- **1 Instructor account** (for creating and managing courses)
- **1-2 Student accounts** (for enrolling and submitting work)

---

## User Registration & Authentication

### Test 1: Create Instructor Account

1. **Open the app** in your browser
2. **Click "Sign Up"** (or navigate to `/signup`)
3. **Fill in the form:**
   - First Name: `John`
   - Last Name: `Instructor`
   - Email: `instructor@test.com`
   - Password: `Test123!@#` (min 8 characters)
   - Role: Select **"Instructor"**
4. **Click "Sign Up"**
5. **Expected Result:**
   - ✅ Account created successfully
   - ✅ Redirected to dashboard
   - ✅ See "Welcome, John!" or similar greeting
   - ✅ See instructor-specific navigation (Create Course, My Courses, etc.)

### Test 2: Create Student Account

1. **Open a second browser window** (or incognito mode)
2. **Click "Sign Up"**
3. **Fill in the form:**
   - First Name: `Jane`
   - Last Name: `Student`
   - Email: `student@test.com`
   - Password: `Test123!@#`
   - Role: Select **"Student"**
4. **Click "Sign Up"**
5. **Expected Result:**
   - ✅ Account created successfully
   - ✅ Redirected to student dashboard
   - ✅ See student-specific navigation (Browse Courses, My Enrollments, etc.)

### Test 3: Login/Logout

1. **Logout** from one account
2. **Click "Login"**
3. **Enter credentials** and login
4. **Expected Result:**
   - ✅ Successfully logged in
   - ✅ Redirected to appropriate dashboard

---

## Instructor: Course Creation

### Test 4: Create a Group Course

**Browser Window:** Instructor account

1. **Navigate to "Create Course"** (or `/instructor/create-course`)
2. **Fill in the course form:**
   - **Title:** `Introduction to Web Development`
   - **Description:** `Learn HTML, CSS, and JavaScript from scratch`
   - **Course Type:** Select **"Group"**
   - **Price:** `99.99`
   - **Category:** `Technology` (or select from dropdown)
   - **Difficulty Level:** `Beginner`
   - **Duration:** `8 weeks`
   - **Max Students:** `30`
   - **Tags:** `web development, html, css, javascript`
   - **Thumbnail URL:** (optional) `https://via.placeholder.com/400x300`
3. **Click "Create Course"**
4. **Expected Result:**
   - ✅ Success message: "Course created successfully!"
   - ✅ Redirected to course details or instructor dashboard
   - ✅ Course appears in "My Courses" list

### Test 5: Create a One-on-One Course

1. **Navigate to "Create Course"** again
2. **Fill in the form:**
   - **Title:** `Personal Math Tutoring`
   - **Description:** `One-on-one math tutoring for high school students`
   - **Course Type:** Select **"One-on-One"**
   - **Price:** `49.99`
   - **Category:** `Mathematics`
   - **Difficulty Level:** `Intermediate`
   - **Duration:** `4 weeks`
   - **Max Students:** `1` (automatically set for one-on-one)
3. **Click "Create Course"**
4. **Expected Result:**
   - ✅ One-on-one course created
   - ✅ Appears in instructor's course list

### Test 6: View Course Details

1. **Go to "My Courses"** (or `/instructor/courses`)
2. **Click on "Introduction to Web Development"**
3. **Expected Result:**
   - ✅ See full course details
   - ✅ See "Edit Course" button
   - ✅ See "Manage Homework" button
   - ✅ See enrollment count (should be 0)
   - ✅ See course status (Published/Draft)

---

## Student: Course Enrollment

### Test 7: Browse Available Courses

**Browser Window:** Student account

1. **Navigate to "Browse Courses"** (or `/courses`)
2. **Expected Result:**
   - ✅ See list of available courses
   - ✅ See "Introduction to Web Development" course
   - ✅ See course price, category, difficulty
   - ✅ See "View Details" or "Enroll" button

### Test 8: View Course Details (Student View)

1. **Click on "Introduction to Web Development"**
2. **Expected Result:**
   - ✅ See full course description
   - ✅ See instructor name
   - ✅ See "Enroll Now" button
   - ✅ See price and course details
   - ✅ Cannot see homework or internal course content yet

### Test 9: Enroll in a Course

1. **Click "Enroll Now"** on the course details page
2. **Confirm enrollment** (if prompted)
3. **Expected Result:**
   - ✅ Success message: "Successfully enrolled!"
   - ✅ Button changes to "Go to Course" or "View Course"
   - ✅ Course appears in "My Enrollments" or "My Courses"

### Test 10: Access Enrolled Course

1. **Navigate to "My Enrollments"** (or `/student/enrollments`)
2. **Click on "Introduction to Web Development"**
3. **Expected Result:**
   - ✅ Can now access course content
   - ✅ See homework assignments (if any)
   - ✅ See course chat/messaging
   - ✅ See course materials

---

## Instructor: Course Management

### Test 11: Edit Course Details

**Browser Window:** Instructor account

1. **Go to "My Courses"**
2. **Click on "Introduction to Web Development"**
3. **Click "Edit Course"**
4. **Update some fields:**
   - Change description
   - Update price to `89.99`
   - Add more tags
5. **Click "Save Changes"**
6. **Expected Result:**
   - ✅ Success message: "Course updated successfully!"
   - ✅ Changes reflected in course details
   - ✅ Students see updated information

### Test 12: View Enrolled Students

1. **On course details page, click "View Enrollments"** or similar
2. **Expected Result:**
   - ✅ See list of enrolled students
   - ✅ See "Jane Student" in the list
   - ✅ See enrollment date
   - ✅ See student status (active/completed)

### Test 13: Publish/Unpublish Course

1. **On course details page, find "Status" toggle**
2. **Toggle between Published/Draft**
3. **Expected Result:**
   - ✅ When "Draft": Course not visible to students in browse
   - ✅ When "Published": Course visible to students
   - ✅ Enrolled students can still access draft courses

---

## Instructor: Homework Management

### Test 14: Create Homework Assignment

**Browser Window:** Instructor account

1. **Go to course details page**
2. **Click "Manage Homework"** or navigate to homework section
3. **Click "Create Assignment"** or "Add Homework"
4. **Fill in the form:**
   - **Title:** `HTML Basics Assignment`
   - **Description:** `Create a simple HTML page with headings, paragraphs, and a list`
   - **Instructions:** `Use proper HTML5 structure. Include at least 3 headings and 2 paragraphs.`
   - **Due Date:** Select a date 7 days from now
   - **Max Points:** `100`
   - **Submission Type:** `File Upload` or `Text`
5. **Click "Create Assignment"**
6. **Expected Result:**
   - ✅ Success message: "Assignment created!"
   - ✅ Assignment appears in homework list
   - ✅ Students can now see the assignment

### Test 15: Create Multiple Assignments

1. **Create 2 more assignments:**
   - **Assignment 2:** `CSS Styling Challenge` (due in 14 days, 100 points)
   - **Assignment 3:** `JavaScript Functions` (due in 21 days, 150 points)
2. **Expected Result:**
   - ✅ All assignments visible in homework list
   - ✅ Sorted by due date
   - ✅ Show submission count (0/enrolled students)

### Test 16: Edit Homework Assignment

1. **Click on "HTML Basics Assignment"**
2. **Click "Edit"**
3. **Update:**
   - Change max points to `120`
   - Update instructions
   - Extend due date by 2 days
4. **Click "Save Changes"**
5. **Expected Result:**
   - ✅ Assignment updated
   - ✅ Students see updated information
   - ✅ No submissions lost

---

## Student: Homework Submission

### Test 17: View Homework Assignments

**Browser Window:** Student account

1. **Navigate to enrolled course** ("Introduction to Web Development")
2. **Click "Homework" or "Assignments" tab**
3. **Expected Result:**
   - ✅ See all 3 assignments
   - ✅ See due dates
   - ✅ See points possible
   - ✅ See submission status (Not Submitted/Submitted/Graded)
   - ✅ Assignments sorted by due date

### Test 18: Submit Homework (Text Submission)

1. **Click on "HTML Basics Assignment"**
2. **Read the instructions**
3. **In the submission area:**
   - **Type or paste your work:**
     ```html
     <!DOCTYPE html>
     <html>
     <head><title>My Page</title></head>
     <body>
       <h1>Main Heading</h1>
       <h2>Subheading</h2>
       <p>This is my first paragraph.</p>
       <p>This is my second paragraph.</p>
       <ul>
         <li>Item 1</li>
         <li>Item 2</li>
       </ul>
     </body>
     </html>
     ```
4. **Click "Submit Assignment"**
5. **Expected Result:**
   - ✅ Success message: "Assignment submitted!"
   - ✅ Status changes to "Submitted"
   - ✅ See submission timestamp
   - ✅ Can view submitted work
   - ✅ Cannot edit after submission (or see "Resubmit" option)

### Test 19: Submit Homework (File Upload)

1. **Click on "CSS Styling Challenge"**
2. **Click "Choose File" or drag-and-drop area**
3. **Select a file** (e.g., `styles.css`)
4. **Add optional comment:** `Here's my CSS solution`
5. **Click "Submit Assignment"**
6. **Expected Result:**
   - ✅ File uploaded successfully
   - ✅ See file name and size
   - ✅ Status changes to "Submitted"
   - ✅ Can download submitted file

### Test 20: View Submission Status

1. **Go back to homework list**
2. **Expected Result:**
   - ✅ "HTML Basics Assignment" shows "Submitted" with green checkmark
   - ✅ "CSS Styling Challenge" shows "Submitted"
   - ✅ "JavaScript Functions" shows "Not Submitted" or "Pending"
   - ✅ See submission dates

---

## Instructor: Grading & Feedback

### Test 21: View Submissions

**Browser Window:** Instructor account

1. **Go to course homework section**
2. **Click on "HTML Basics Assignment"**
3. **Click "View Submissions"** or similar
4. **Expected Result:**
   - ✅ See list of all submissions
   - ✅ See "Jane Student" submission
   - ✅ See submission date/time
   - ✅ See status (Submitted/Graded)
   - ✅ See "Grade" button

### Test 22: Grade a Submission

1. **Click on Jane Student's submission**
2. **Review the submitted work**
3. **Enter grading information:**
   - **Score:** `95` (out of 120)
   - **Feedback:** `Great work! Your HTML structure is clean and well-organized. Consider adding more semantic HTML elements like <article> and <section> for better structure.`
4. **Click "Submit Grade"**
5. **Expected Result:**
   - ✅ Success message: "Grade submitted!"
   - ✅ Status changes to "Graded"
   - ✅ Student can now see grade and feedback
   - ✅ Grade appears in gradebook

### Test 23: Grade Multiple Submissions

1. **Go back to submissions list**
2. **Grade the CSS assignment:**
   - Score: `88/100`
   - Feedback: `Good use of selectors. Try using CSS Grid for layouts.`
3. **Expected Result:**
   - ✅ Both assignments now graded
   - ✅ Average grade calculated
   - ✅ Gradebook updated

### Test 24: Edit a Grade

1. **Click on previously graded submission**
2. **Click "Edit Grade"**
3. **Change score to `100`**
4. **Update feedback:** `Perfect work after revision!`
5. **Click "Update Grade"**
6. **Expected Result:**
   - ✅ Grade updated
   - ✅ Student sees updated grade
   - ✅ Gradebook reflects change

---

## Real-time Messaging

### Test 25: Send Message (Instructor to Course)

**Browser Window:** Instructor account

1. **Navigate to course page**
2. **Click "Chat" or "Messages" tab**
3. **Type a message:** `Welcome to the course! Feel free to ask questions anytime.`
4. **Click "Send"**
5. **Expected Result:**
   - ✅ Message appears immediately
   - ✅ Shows your name and timestamp
   - ✅ No page refresh needed

### Test 26: Receive Message in Real-time (Student)

**Browser Window:** Student account (keep both windows visible)

1. **Navigate to the same course chat**
2. **Expected Result:**
   - ✅ Instructor's message appears INSTANTLY (no refresh!)
   - ✅ See "🟢 Connected" status indicator
   - ✅ See instructor name and timestamp

### Test 27: Two-way Real-time Chat

**Test with both windows side-by-side:**

1. **Student window:** Type `Thank you! I have a question about HTML tags.`
2. **Click "Send"**
3. **Instructor window:** Should see message appear instantly
4. **Instructor window:** Reply `Sure! What would you like to know?`
5. **Student window:** Should see reply appear instantly
6. **Expected Result:**
   - ✅ Messages appear in both windows without refresh
   - ✅ Conversation flows naturally
   - ✅ Timestamps accurate
   - ✅ Connection status shows "🟢 Connected"

### Test 28: Message Persistence

1. **Close student browser window**
2. **Instructor sends another message**
3. **Reopen student browser and login**
4. **Navigate to course chat**
5. **Expected Result:**
   - ✅ All previous messages still visible
   - ✅ Messages loaded from database
   - ✅ Chat history preserved

### Test 29: One-on-One Messaging (Optional)

**If you created a one-on-one course:**

1. **Student enrolls in one-on-one course**
2. **Both navigate to that course chat**
3. **Exchange messages**
4. **Expected Result:**
   - ✅ Private conversation between instructor and student
   - ✅ Other students cannot see messages
   - ✅ Real-time updates work

---

## Profile Management

### Test 30: Update Profile (Student)

**Browser Window:** Student account

1. **Click on profile icon or "Profile"**
2. **Click "Edit Profile"**
3. **Update information:**
   - Bio: `Aspiring web developer`
   - Add avatar URL (optional)
   - Update contact info
4. **Click "Save Changes"**
5. **Expected Result:**
   - ✅ Profile updated
   - ✅ Changes visible in chat messages
   - ✅ Changes visible to instructor

### Test 31: Update Profile (Instructor)

**Browser Window:** Instructor account

1. **Navigate to profile settings**
2. **Update:**
   - Bio: `10 years of web development experience`
   - Expertise: `HTML, CSS, JavaScript, React`
   - Add social links
3. **Click "Save"**
4. **Expected Result:**
   - ✅ Profile updated
   - ✅ Visible on course pages
   - ✅ Students can see instructor bio

---

## Advanced Testing Scenarios

### Test 32: Multiple Students Enrollment

1. **Create a 3rd student account** (student2@test.com)
2. **Enroll in the same course**
3. **Expected Result:**
   - ✅ Instructor sees 2 enrolled students
   - ✅ Both students can access course
   - ✅ Both can see chat messages
   - ✅ Both can submit homework

### Test 33: Course Capacity Limit

1. **Set max students to 2** on a course
2. **Try to enroll a 3rd student**
3. **Expected Result:**
   - ✅ Error message: "Course is full"
   - ✅ Cannot enroll
   - ✅ Shows "Full" status on course card

### Test 34: Late Submission

1. **Wait for assignment due date to pass** (or manually change due date to past)
2. **Student tries to submit**
3. **Expected Result:**
   - ✅ Warning: "This assignment is past due"
   - ✅ Can still submit (or blocked, depending on settings)
   - ✅ Marked as "Late" in submissions

### Test 35: Delete Assignment

**Browser Window:** Instructor account

1. **Go to homework management**
2. **Click "Delete" on an assignment**
3. **Confirm deletion**
4. **Expected Result:**
   - ✅ Assignment removed
   - ✅ Student no longer sees it
   - ✅ Submissions preserved (or deleted with warning)

### Test 36: Unenroll from Course

**Browser Window:** Student account

1. **Go to "My Enrollments"**
2. **Click "Unenroll" or "Leave Course"**
3. **Confirm action**
4. **Expected Result:**
   - ✅ Removed from course
   - ✅ Cannot access course content
   - ✅ Instructor sees enrollment count decrease

---

## Testing Checklist Summary

### ✅ Authentication & Users
- [ ] Instructor signup
- [ ] Student signup
- [ ] Login/Logout
- [ ] Profile updates

### ✅ Course Management
- [ ] Create group course
- [ ] Create one-on-one course
- [ ] Edit course details
- [ ] Publish/unpublish course
- [ ] View enrollments

### ✅ Student Features
- [ ] Browse courses
- [ ] View course details
- [ ] Enroll in course
- [ ] Access enrolled course
- [ ] Unenroll from course

### ✅ Homework System
- [ ] Create assignment
- [ ] Edit assignment
- [ ] Delete assignment
- [ ] Submit homework (text)
- [ ] Submit homework (file)
- [ ] View submission status

### ✅ Grading System
- [ ] View submissions
- [ ] Grade submission
- [ ] Provide feedback
- [ ] Edit grade
- [ ] View gradebook

### ✅ Real-time Messaging
- [ ] Send message
- [ ] Receive message instantly
- [ ] Two-way real-time chat
- [ ] Message persistence
- [ ] Connection status indicator

### ✅ Edge Cases
- [ ] Course capacity limit
- [ ] Late submissions
- [ ] Multiple students
- [ ] Profile updates reflected in chat

---

## Troubleshooting Common Issues

### Issue: Messages not appearing in real-time
**Solution:**
- Check connection status (should show "🟢 Connected")
- Refresh both browser windows
- Check browser console for errors
- Verify Supabase Realtime is enabled

### Issue: Cannot enroll in course
**Solution:**
- Check if course is published
- Check if course is full
- Verify student is logged in
- Check enrollment status

### Issue: Homework submission fails
**Solution:**
- Check file size (if uploading)
- Verify due date hasn't passed
- Check internet connection
- Try text submission instead

### Issue: Grades not showing
**Solution:**
- Verify instructor submitted grade
- Refresh student page
- Check if assignment is graded
- Verify student is enrolled

---

## Next Steps After Testing

Once you've completed all tests:

1. **Document any bugs** you find
2. **Note feature requests** for improvements
3. **Test on mobile devices** (responsive design)
4. **Test with real users** (beta testing)
5. **Monitor performance** (load times, database queries)
6. **Set up analytics** (track user behavior)
7. **Prepare for production** (security audit, backups)

---

## Support & Resources

- **Documentation:** Check README.md files
- **API Reference:** See backend service files
- **Database Schema:** Check Supabase dashboard
- **Real-time Guide:** See REALTIME_IMPLEMENTATION_SUMMARY.md

Happy Testing! 🚀
