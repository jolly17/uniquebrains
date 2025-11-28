# Design Document: Instructor Course Management

## Overview

This feature extends the UniqueBrains platform with comprehensive course management tools for instructors. The design prioritizes simplicity, clarity, and accessibility for neurodivergent users through consistent patterns, clear visual hierarchy, and helpful guidance at every step.

## Architecture

### High-Level Structure

```
Instructor Dashboard
  └── Course Card (with "Manage Course" button)
       └── Course Management Interface (Tab-based)
            ├── Sessions Tab (existing)
            ├── Students Tab (new)
            ├── Homework Tab (new)
            ├── Resources Tab (new)
            └── Chat Tab (new)

Student Course View
  └── Course Tabs
       ├── Sessions Tab
       ├── Homework Tab (new)
       ├── Resources Tab (new)
       └── Chat Tab (new)
```

### Navigation Flow

**Instructor:**
1. Dashboard → Click "Manage Course" on course card
2. Lands on Course Management page with tab navigation
3. Each tab shows focused content for that specific task
4. Clear "Back to Dashboard" button always visible

**Student:**
1. My Courses → Click course card
2. Lands on Course View page with tab navigation
3. Each tab shows relevant content
4. Clear "Back to My Courses" button always visible

## Components and Interfaces

### 1. Course Management Page (Instructor)

**Component:** `ManageCourse.jsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← Back to Dashboard                     │
│                                         │
│ 🎵 Piano for Beginners                 │
│ Manage your course content and students │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Sessions | Students | Homework |    ││
│ │ Resources | Chat                    ││
│ └─────────────────────────────────────┘│
│                                         │
│ [Active Tab Content Here]              │
│                                         │
└─────────────────────────────────────────┘
```

**Props:**
```javascript
{
  courseId: string,
  course: Course object
}
```

### 2. Students Tab (Instructor)

**Component:** `CourseStudents.jsx`

**For Group Courses:**
```
┌─────────────────────────────────────────┐
│ 📊 Course Statistics                    │
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │  8  │ │  2  │ │ 80% │               │
│ │Enrol│ │Spots│ │Comp │               │
│ └─────┘ └─────┘ └─────┘               │
│                                         │
│ 👥 Enrolled Students                    │
│ ℹ️ All students attend the same group  │
│    sessions together                    │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 Emma Thompson                    ││
│ │    🧩 Autism                        ││
│ │    ✅ 5/6 homework completed        ││
│ │    [View Profile] [Send Message]   ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 Liam Chen                        ││
│ │    🧩 ADHD, Dyslexia                ││
│ │    ✅ 4/6 homework completed        ││
│ │    [View Profile] [Send Message]   ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**For One-on-One Courses:**
```
┌─────────────────────────────────────────┐
│ 👤 Individual Students                  │
│ ℹ️ Each student has their own schedule │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 Emma Thompson                    ││
│ │    🧩 Autism                        ││
│ │    📅 Next session: Mon 10:00 AM    ││
│ │    ✅ 5/6 homework completed        ││
│ │    [View Schedule] [Send Message]  ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 3. Homework Tab (Instructor)

**Component:** `CourseHomework.jsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ 📝 Homework Assignments                 │
│ ℹ️ Create assignments and review        │
│    student submissions                  │
│                                         │
│ [+ Create New Assignment]               │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Practice Scales                     ││
│ │ Due: Jan 20, 2024                   ││
│ │ Type: Audio Recording               ││
│ │ 📊 6/8 students submitted           ││
│ │ ⚠️ 2 pending reviews                ││
│ │ [View Submissions] [Edit] [Delete] ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Music Theory Quiz                   ││
│ │ Due: Jan 25, 2024                   ││
│ │ Type: Text Response                 ││
│ │ 📊 3/8 students submitted           ││
│ │ ✅ All reviewed                     ││
│ │ [View Submissions] [Edit] [Delete] ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Create Assignment Modal:**
```
┌─────────────────────────────────────────┐
│ Create Homework Assignment              │
│                                         │
│ Title *                                 │
│ [_________________________________]     │
│                                         │
│ Description *                           │
│ [_________________________________]     │
│ [_________________________________]     │
│ [_________________________________]     │
│                                         │
│ Due Date *                              │
│ [📅 Select Date]                        │
│                                         │
│ Submission Type *                       │
│ ○ Text Response                         │
│ ○ File Upload                           │
│ ○ Checkmark Only                        │
│                                         │
│ ℹ️ Students will be notified when you  │
│    create this assignment               │
│                                         │
│ [Cancel] [Create Assignment]            │
└─────────────────────────────────────────┘
```

**View Submissions:**
```
┌─────────────────────────────────────────┐
│ ← Back to Homework                      │
│                                         │
│ Practice Scales - Submissions           │
│ Due: Jan 20, 2024                       │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 Emma Thompson                    ││
│ │ Submitted: Jan 18, 2024 3:45 PM     ││
│ │ 🎵 scales-practice.mp3              ││
│ │                                     ││
│ │ Your Feedback:                      ││
│ │ [_____________________________]     ││
│ │ [_____________________________]     ││
│ │                                     ││
│ │ [Save Feedback]                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 Liam Chen                        ││
│ │ ⚠️ Not submitted yet                ││
│ │ [Send Reminder]                     ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 4. Resources Tab (Instructor)

**Component:** `CourseResources.jsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ 📚 Course Resources                     │
│ ℹ️ Upload files and links for students │
│    to access anytime                    │
│                                         │
│ [+ Add Resource]                        │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 📄 Beginner Piano Guide.pdf         ││
│ │ Added: Jan 10, 2024                 ││
│ │ 👁️ Viewed by 7/8 students           ││
│ │ [Download] [Delete]                 ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🔗 Music Theory Video Tutorial      ││
│ │ https://youtube.com/watch?v=...     ││
│ │ Added: Jan 12, 2024                 ││
│ │ 👁️ Viewed by 5/8 students           ││
│ │ [Open Link] [Delete]                ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Add Resource Modal:**
```
┌─────────────────────────────────────────┐
│ Add Course Resource                     │
│                                         │
│ Resource Type                           │
│ ○ Upload File                           │
│ ○ Add Web Link                          │
│                                         │
│ [If File Selected]                      │
│ Title *                                 │
│ [_________________________________]     │
│                                         │
│ File *                                  │
│ [Choose File] No file chosen            │
│ ℹ️ Accepted: PDF, DOC, images          │
│                                         │
│ [If Link Selected]                      │
│ Title *                                 │
│ [_________________________________]     │
│                                         │
│ URL *                                   │
│ [_________________________________]     │
│                                         │
│ ℹ️ Students will see this resource     │
│    immediately after you add it         │
│                                         │
│ [Cancel] [Add Resource]                 │
└─────────────────────────────────────────┘
```

### 5. Chat Tab (Instructor - Group Course)

**Component:** `CourseChat.jsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ 💬 Group Chat                           │
│ ℹ️ All 8 students can see these        │
│    messages                             │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │                                     ││
│ │ Emma Thompson - 2:30 PM             ││
│ │ When is our next session?           ││
│ │                                     ││
│ │           You (Instructor) - 2:35 PM││
│ │           Next session is Monday at ││
│ │           10 AM. See you there! 🎵  ││
│ │                                     ││
│ │ Liam Chen - 3:15 PM                 ││
│ │ Can we review scales again?         ││
│ │                                     ││
│ │           You (Instructor) - 3:20 PM││
│ │           Absolutely! I'll add that ││
│ │           to Monday's session.      ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ Type your message...                    │
│ [_________________________________] [Send]│
└─────────────────────────────────────────┘
```

### 6. Chat Tab (Instructor - One-on-One Course)

**Layout:**
```
┌─────────────────────────────────────────┐
│ 💬 Student Messages                     │
│ ℹ️ Private conversations with each     │
│    student                              │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 Emma Thompson            🔴 New  ││
│ │ Last message: 10 min ago            ││
│ │ "Can we reschedule Tuesday?"        ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 Liam Chen                        ││
│ │ Last message: 2 hours ago           ││
│ │ "Thanks for the feedback!"          ││
│ └─────────────────────────────────────┘│
│                                         │
│ [Click a student to open chat]          │
└─────────────────────────────────────────┘
```

**Individual Chat View:**
```
┌─────────────────────────────────────────┐
│ ← Back to Messages                      │
│                                         │
│ 💬 Chat with Emma Thompson              │
│ ℹ️ Private conversation - only you and │
│    Emma can see these messages          │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │                                     ││
│ │ Emma - 2:30 PM                      ││
│ │ Can we reschedule Tuesday's lesson? ││
│ │                                     ││
│ │                   You - 2:35 PM     ││
│ │                   Of course! What   ││
│ │                   time works for you?││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ Type your message...                    │
│ [_________________________________] [Send]│
└─────────────────────────────────────────┘
```

### 7. Student Course View

**Component:** `StudentCourseView.jsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ ← Back to My Courses                    │
│                                         │
│ 🎵 Piano for Beginners                 │
│ with Michael Chen                       │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Sessions | Homework | Resources |   ││
│ │ Chat                                ││
│ └─────────────────────────────────────┘│
│                                         │
│ [Active Tab Content]                    │
│                                         │
└─────────────────────────────────────────┘
```

### 8. Homework Tab (Student)

**Component:** `StudentHomework.jsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ 📝 Your Homework                        │
│ ℹ️ Complete assignments and submit     │
│    them before the due date             │
│                                         │
│ ⚠️ To Do (2)                            │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Practice Scales                     ││
│ │ Due: Jan 20, 2024 (2 days left)     ││
│ │ Type: Audio Recording               ││
│ │                                     ││
│ │ Record yourself playing C major     ││
│ │ and G major scales.                 ││
│ │                                     ││
│ │ [Upload Recording]                  ││
│ └─────────────────────────────────────┘│
│                                         │
│ ✅ Completed (3)                        │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ ✓ Music Theory Quiz                 ││
│ │ Submitted: Jan 15, 2024             ││
│ │ Feedback: "Great work! Keep it up!" ││
│ │ [View Details]                      ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 9. Resources Tab (Student)

**Component:** `StudentResources.jsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│ 📚 Course Materials                     │
│ ℹ️ Download files and access links     │
│    shared by your instructor            │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 📄 Beginner Piano Guide.pdf         ││
│ │ Added: Jan 10, 2024                 ││
│ │ [Download] [Preview]                ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🔗 Music Theory Video Tutorial      ││
│ │ Added: Jan 12, 2024                 ││
│ │ [Open Link]                         ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 📄 Practice Sheet Music.pdf         ││
│ │ Added: Jan 15, 2024                 ││
│ │ [Download] [Preview]                ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 10. Chat Tab (Student - Group Course)

**Layout:**
```
┌─────────────────────────────────────────┐
│ 💬 Class Chat                           │
│ ℹ️ Chat with your instructor and       │
│    classmates (8 students total)        │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │                                     ││
│ │ You - 2:30 PM                       ││
│ │ When is our next session?           ││
│ │                                     ││
│ │           Instructor - 2:35 PM      ││
│ │           Next session is Monday at ││
│ │           10 AM. See you there! 🎵  ││
│ │                                     ││
│ │ Liam - 3:15 PM                      ││
│ │ Can we review scales again?         ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ Type your message...                    │
│ [_________________________________] [Send]│
└─────────────────────────────────────────┘
```

### 11. Chat Tab (Student - One-on-One Course)

**Layout:**
```
┌─────────────────────────────────────────┐
│ 💬 Chat with Your Instructor            │
│ ℹ️ Private conversation - only you and │
│    your instructor can see these        │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │                                     ││
│ │ You - 2:30 PM                       ││
│ │ Can we reschedule Tuesday's lesson? ││
│ │                                     ││
│ │           Instructor - 2:35 PM      ││
│ │           Of course! What time      ││
│ │           works for you?            ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ Type your message...                    │
│ [_________________________________] [Send]│
└─────────────────────────────────────────┘
```

## Data Models

### Homework Assignment
```javascript
{
  id: string,
  courseId: string,
  title: string,
  description: string,
  dueDate: Date,
  submissionType: 'text' | 'file' | 'checkmark',
  createdAt: Date,
  createdBy: string (instructorId)
}
```

### Homework Submission
```javascript
{
  id: string,
  homeworkId: string,
  studentId: string,
  studentName: string,
  submittedAt: Date,
  content: string | File,
  feedback: string | null,
  feedbackAt: Date | null
}
```

### Resource
```javascript
{
  id: string,
  courseId: string,
  title: string,
  type: 'file' | 'link',
  url: string,
  fileName: string | null,
  fileSize: number | null,
  addedAt: Date,
  addedBy: string (instructorId),
  viewedBy: string[] (studentIds)
}
```

### Chat Message
```javascript
{
  id: string,
  courseId: string,
  senderId: string,
  senderName: string,
  senderRole: 'instructor' | 'student',
  recipientId: string | null, // null for group chat
  message: string,
  sentAt: Date,
  readBy: string[] (userIds)
}
```

### Chat Thread (for one-on-one courses)
```javascript
{
  id: string,
  courseId: string,
  instructorId: string,
  studentId: string,
  lastMessageAt: Date,
  lastMessagePreview: string,
  unreadCount: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tab Navigation Consistency
*For any* course management or course view page, switching between tabs should preserve unsaved work and maintain consistent navigation patterns.
**Validates: Requirements 1.3**

### Property 2: Homework Notification
*For any* homework assignment created by an instructor, all enrolled students should receive a notification immediately.
**Validates: Requirements 2.4**

### Property 3: Resource Visibility
*For any* resource added by an instructor, it should be immediately visible to all enrolled students in that course.
**Validates: Requirements 3.5**

### Property 4: Chat Privacy for One-on-One
*For any* one-on-one course, messages between an instructor and a specific student should only be visible to those two users.
**Validates: Requirements 8.5**

### Property 5: Group Chat Visibility
*For any* group course, all messages in the chat should be visible to all enrolled students and the instructor.
**Validates: Requirements 7.3**

### Property 6: Submission Feedback Notification
*For any* homework submission that receives feedback, the student should be notified immediately.
**Validates: Requirements 2.7**

### Property 7: Course Type Determines Chat Type
*For any* course, the chat interface should display group chat if courseType is 'group', and individual chats if courseType is 'one-on-one'.
**Validates: Requirements 4.1, 4.2**

## Error Handling

### User-Friendly Error Messages

All errors should be displayed in plain language with clear next steps:

**File Upload Errors:**
- "This file is too large. Please choose a file smaller than 10MB."
- "This file type isn't supported. Please upload a PDF, DOC, or image file."

**Form Validation:**
- "Please fill in all required fields marked with *"
- "Please select a due date for this assignment"

**Network Errors:**
- "Couldn't save your changes. Please check your internet connection and try again."
- "Message not sent. Click here to try again."

**Permission Errors:**
- "You don't have permission to do that. Please contact support if you think this is a mistake."

## Testing Strategy

### Unit Tests
- Test tab switching logic
- Test form validation for homework and resources
- Test chat message filtering (group vs individual)
- Test file upload validation
- Test notification triggering

### Integration Tests
- Test complete homework creation and submission flow
- Test resource upload and student access
- Test chat message delivery in both course types
- Test feedback submission and notification

### Accessibility Tests
- Keyboard navigation through all tabs
- Screen reader compatibility for all content
- Color contrast for all text and buttons
- Focus indicators on all interactive elements

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load tab content only when tab is clicked
2. **Message Pagination**: Load chat messages in chunks of 50
3. **File Upload**: Show progress indicator for large files
4. **Caching**: Cache student list and course data to reduce API calls
5. **Debouncing**: Debounce chat input to reduce unnecessary renders

### Loading States

All async operations should show clear loading indicators:
- Skeleton screens for lists
- Spinner for button actions
- Progress bar for file uploads
- "Sending..." indicator for chat messages

## Accessibility Features

### For Neurodivergent Users

1. **Clear Visual Hierarchy**: Important actions are prominent
2. **Consistent Patterns**: Same layout across all tabs
3. **Helpful Hints**: Blue info boxes explain what each section does
4. **Confirmation Messages**: Clear feedback after every action
5. **Forgiving Design**: Easy to undo actions, no data loss
6. **Minimal Distractions**: Clean layouts with plenty of white space
7. **Plain Language**: No jargon, simple instructions

### WCAG Compliance

- All interactive elements keyboard accessible
- Proper ARIA labels for screen readers
- Color contrast ratio of at least 4.5:1
- Focus indicators on all interactive elements
- Alt text for all images and icons

## Implementation Notes

### Routing Structure

```
/instructor/course/:courseId/manage
  - Default tab: sessions
  - Query param: ?tab=students|homework|resources|chat

/learn/:courseId
  - Default tab: sessions
  - Query param: ?tab=homework|resources|chat
```

### State Management

Use React Context for:
- Current course data
- Active tab state
- User role (instructor/student)
- Unread message counts

### Real-time Updates

For chat functionality, consider:
- WebSocket connection for real-time messages
- Polling as fallback (every 5 seconds)
- Optimistic UI updates for sent messages

## Future Enhancements

- Video/audio recording directly in browser
- Rich text editor for homework descriptions
- File preview without download
- Message reactions and threading
- Bulk feedback for multiple students
- Progress analytics dashboard
