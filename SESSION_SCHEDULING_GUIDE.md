# Session Scheduling Guide for Instructors

## Overview

This guide explains how instructors schedule and manage sessions for both **Group Courses** and **One-on-One Courses**.

---

## For Group Courses

### Workflow:

1. **Navigate to Sessions**
   - Go to your course → Click "Manage Course" → Select "Sessions" tab
   - Or directly access: `/instructor/sessions/{courseId}`

2. **Create New Session**
   - Click the **"+ Create New Session"** button
   - Fill in the modal:
     - **Date**: Select the session date
     - **Time**: Select the session time
     - **Topic** (Optional): e.g., "Introduction to scales"
     - **Meeting Link** (Optional): Zoom/Google Meet link
   - Click **"Create Session"**

3. **All Students See the Same Schedule**
   - The session appears for all enrolled students
   - Students can see the topic and join the meeting

### Features:
- ✅ Set a default meeting link for all sessions
- ✅ Create multiple sessions at once
- ✅ Edit session topics and meeting links
- ✅ See how many students are enrolled

---

## For One-on-One Courses

### Workflow:

1. **Student Enrolls in Your Course**
   - You receive a notification (future feature)
   - Student appears in your "Students" tab

2. **Discuss Availability via Chat**
   - Go to "Chat" tab
   - Select the student from the list
   - Send a message: *"Hi! When are you available for our first session?"*
   - Student responds with their preferred times

3. **Create Session**
   - Go to "Sessions" tab
   - Click **"+ Create New Session"**
   - Fill in the modal:
     - **Student**: Select the student from dropdown
     - **Date**: The agreed-upon date
     - **Time**: The agreed-upon time
     - **Topic** (Optional): e.g., "Review scales and introduce new piece"
     - **Meeting Link** (Optional): Your Zoom/Google Meet link
   - Click **"Create Session"**

4. **Student Sees the Session**
   - Session appears in their "Sessions" tab
   - They can join at the scheduled time

### Features:
- ✅ Each student has their own schedule
- ✅ Private chat with each student
- ✅ Flexible scheduling based on individual availability
- ✅ Set different topics for each student based on their progress

---

## Best Practices

### Communication Tips:

**Initial Message Template:**
```
Hi [Student Name]! 👋

Thanks for enrolling in [Course Name]! 

I'd love to schedule our first session. What days and times work best for you?

Looking forward to working together!
```

**Follow-up After Scheduling:**
```
Great! I've scheduled our session for [Date] at [Time].

Meeting link: [Zoom/Google Meet link]

See you then! 🎵
```

### Scheduling Tips:

1. **Set a Default Meeting Link**
   - Use the same Zoom/Google Meet link for all sessions
   - Set it once in the "Course Meeting Link" section
   - It will auto-fill when creating new sessions

2. **Plan Ahead**
   - Schedule sessions 1-2 weeks in advance
   - Give students time to prepare

3. **Set Topics**
   - Help students know what to expect
   - They can prepare questions or materials

4. **Be Flexible**
   - Students may need to reschedule
   - Use chat to coordinate changes

---

## Session Management

### Editing Sessions:

1. Find the session in the list
2. Click **"Edit"** or **"Set Details"**
3. Update topic or meeting link
4. Click **"Save"**

### Session Status:

- **✓ Ready**: Topic and meeting link are set
- **⚠ Pending**: Topic not set yet (students see "Topic to be announced")

---

## Student View

### What Students See:

**Group Courses:**
- All upcoming sessions for the class
- Session topics (if set)
- Meeting link to join
- "Join Class" button

**One-on-One Courses:**
- Only their own sessions
- Personalized topics based on their progress
- Private meeting link
- "Join Session" button

---

## Technical Details

### Data Storage:
- Sessions are currently stored in **localStorage** (mock data)
- When backend is connected, sessions will sync to database
- Meeting links are stored securely

### Meeting Links:
- Supports Zoom, Google Meet, Microsoft Teams, or any video platform
- Links are only visible to enrolled students
- Can be different for each session or use course default

---

## Future Enhancements

Coming soon:
- 📧 Email notifications when sessions are created
- 📅 Calendar integration (Google Calendar, iCal)
- 🔄 Recurring session templates
- ⏰ Automatic reminders 24 hours before session
- 📊 Session attendance tracking
- 🎥 Automatic Zoom meeting creation

---

## Troubleshooting

**Q: Student says they can't see the session?**
- A: Make sure you selected the correct student when creating the session
- Check that the session date is in the future

**Q: How do I change a session time?**
- A: Currently, edit the session details. In the future, you'll be able to reschedule with one click.

**Q: Can I create recurring sessions?**
- A: Not yet, but this feature is coming soon. For now, create sessions individually.

**Q: What if a student needs to reschedule?**
- A: Discuss via chat, then edit the session details with the new time.

---

## Support

Need help? 
- Check the info banners (ℹ️) on each page
- Contact support: support@uniquebrains.org
- Join our instructor community forum

---

**Last Updated:** December 2025
**Version:** 1.0
