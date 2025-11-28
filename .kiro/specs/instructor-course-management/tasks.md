# Implementation Plan

## Phase 2: Instructor Course Management

This plan breaks down the implementation into focused, incremental tasks. Each task builds on previous work and includes clear objectives and requirements references.

---

- [x] 1. Set up routing and base course management structure



  - Create new routes for course management pages
  - Set up tab-based navigation component
  - Implement route protection for instructor-only pages
  - _Requirements: 1.1, 1.2_

---

- [ ] 2. Implement Students Tab (Instructor View)

- [ ] 2.1 Create CourseStudents component with course statistics
  - Display enrolled count, spots remaining, completion rate
  - Show different layouts for group vs one-on-one courses
  - _Requirements: 5.1, 5.2_

- [ ] 2.2 Build student list with neurodiversity profiles
  - Display student cards with names and profiles
  - Show homework completion indicators
  - Add "View Profile" and "Send Message" buttons
  - _Requirements: 5.3, 5.4_

- [ ] 2.3 Add individual session schedule display for one-on-one courses
  - Show next session time for each student
  - Link to session management
  - _Requirements: 5.4_

---

- [ ] 3. Implement Homework Tab (Instructor View)

- [ ] 3.1 Create CourseHomework component with assignment list
  - Display existing assignments with due dates
  - Show submission statistics
  - Add "Create New Assignment" button
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 Build homework creation modal
  - Form with title, description, due date fields
  - Submission type selector (text/file/checkmark)
  - Form validation with clear error messages
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.3 Implement homework submission review interface
  - List all student submissions
  - Show submission status (submitted/pending)
  - Display submitted content (text/file)
  - _Requirements: 2.4, 2.5_

- [ ] 3.4 Add feedback functionality
  - Text area for instructor feedback
  - Save feedback button with confirmation
  - Trigger student notification on feedback submission
  - _Requirements: 2.6, 2.7_

---

- [ ] 4. Implement Resources Tab (Instructor View)

- [ ] 4.1 Create CourseResources component with resource list
  - Display uploaded files and links
  - Show view statistics
  - Add "Add Resource" button
  - _Requirements: 3.4, 3.5_

- [ ] 4.2 Build resource upload modal
  - Toggle between file upload and link addition
  - File input with type validation
  - URL input for web links
  - Title field for both types
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4.3 Implement resource management
  - Delete functionality with confirmation
  - Update resource titles
  - Track which students have viewed resources
  - _Requirements: 3.6_

---

- [ ] 5. Implement Chat Tab (Instructor View - Group Courses)

- [ ] 5.1 Create CourseChat component for group courses
  - Display single chat interface
  - Show participant count
  - Add helpful info banner explaining group chat
  - _Requirements: 4.1, 4.3_

- [ ] 5.2 Build message display area
  - Show messages in chronological order
  - Display sender name and timestamp
  - Distinguish instructor vs student messages visually
  - _Requirements: 4.5, 4.6_

- [ ] 5.3 Implement message input and sending
  - Text input with send button
  - Handle message submission
  - Show confirmation when sent
  - _Requirements: 4.7_

- [ ] 5.4 Add real-time message updates
  - Poll for new messages or use WebSocket
  - Show notification badge for unread messages
  - _Requirements: 4.4_

---

- [ ] 6. Implement Chat Tab (Instructor View - One-on-One Courses)

- [ ] 6.1 Create chat thread list for one-on-one courses
  - Display list of students with last message preview
  - Show unread indicators
  - Add helpful info banner explaining individual chats
  - _Requirements: 4.2, 4.3_

- [ ] 6.2 Build individual chat view
  - Show conversation with specific student
  - Display student name in header
  - Add back button to thread list
  - _Requirements: 4.3, 4.5, 4.6_

- [ ] 6.3 Implement private messaging
  - Ensure messages only visible to instructor and specific student
  - Show confirmation when sent
  - _Requirements: 4.7_

---

- [ ] 7. Implement Student Course View Structure

- [ ] 7.1 Create StudentCourseView component with tab navigation
  - Display course title and instructor name
  - Implement tab switching (Sessions, Homework, Resources, Chat)
  - Add back button to My Courses
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7.2 Add visual indicators for new content
  - Badge for unread messages
  - Badge for new homework assignments
  - Badge for new resources
  - _Requirements: 6.4_

---

- [ ] 8. Implement Homework Tab (Student View)

- [ ] 8.1 Create StudentHomework component
  - Separate "To Do" and "Completed" sections
  - Display assignment cards with due dates
  - Show days remaining for pending assignments
  - _Requirements: 2.1, 2.2_

- [ ] 8.2 Build homework submission interface
  - Text input for text responses
  - File upload for file submissions
  - Checkmark button for checkmark-only
  - Show submission confirmation
  - _Requirements: 2.3_

- [ ] 8.3 Display completed homework with feedback
  - Show submission date
  - Display instructor feedback
  - Add "View Details" option
  - _Requirements: 2.6, 2.7_

---

- [ ] 9. Implement Resources Tab (Student View)

- [ ] 9.1 Create StudentResources component
  - Display all course resources
  - Show file type icons
  - Add helpful info banner
  - _Requirements: 3.4, 3.5_

- [ ] 9.2 Implement resource access
  - Download button for files
  - Open link button for URLs
  - Preview option for supported file types
  - Track when student views resource
  - _Requirements: 3.5_

---

- [ ] 10. Implement Chat Tab (Student View - Group Courses)

- [ ] 10.1 Create student group chat interface
  - Display group chat messages
  - Show participant count
  - Add helpful info banner
  - _Requirements: 7.1, 7.2_

- [ ] 10.2 Implement student messaging in group chat
  - Message input and send functionality
  - Distinguish instructor vs student messages
  - Show message history
  - _Requirements: 7.3, 7.4, 7.5_

---

- [ ] 11. Implement Chat Tab (Student View - One-on-One Courses)

- [ ] 11.1 Create student private chat interface
  - Display conversation with instructor
  - Add helpful info banner about privacy
  - Show message history
  - _Requirements: 8.1, 8.2_

- [ ] 11.2 Implement private messaging for students
  - Message input and send functionality
  - Notification when instructor replies
  - Ensure privacy (no other students can see)
  - _Requirements: 8.3, 8.4, 8.5_

---

- [ ] 12. Implement notification system

- [ ] 12.1 Create notification component
  - Toast notifications for new messages
  - Notifications for homework assignments
  - Notifications for feedback received
  - _Requirements: 2.4, 2.7, 4.4_

- [ ] 12.2 Add notification badges
  - Unread message count on chat tab
  - New homework indicator
  - New resource indicator
  - _Requirements: 6.4_

---

- [ ] 13. Add accessibility features

- [ ] 13.1 Implement keyboard navigation
  - Tab through all interactive elements
  - Enter to submit forms
  - Escape to close modals
  - _Requirements: 1.2, 1.3_

- [ ] 13.2 Add ARIA labels and screen reader support
  - Label all form inputs
  - Announce notifications
  - Describe button actions
  - _Requirements: All_

- [ ] 13.3 Ensure color contrast and visual clarity
  - Check all text meets WCAG standards
  - Add focus indicators
  - Use clear icons with labels
  - _Requirements: All_

---

- [ ] 14. Implement data persistence and state management

- [ ] 14.1 Set up mock data for homework, resources, and chat
  - Create sample assignments
  - Add sample resources
  - Generate sample chat messages
  - _Requirements: All_

- [ ] 14.2 Implement local storage for offline support
  - Save draft messages
  - Cache viewed resources
  - Store notification preferences
  - _Requirements: 1.3_

---

- [ ] 15. Add helpful guidance and info banners

- [ ] 15.1 Create info banner component
  - Blue background with info icon
  - Clear, concise explanatory text
  - Consistent styling across all pages
  - _Requirements: 1.4, 6.5_

- [ ] 15.2 Add contextual help text
  - Explain what each tab does
  - Provide guidance on forms
  - Clarify group vs individual features
  - _Requirements: 1.4, 6.5_

---

- [ ] 16. Polish and testing

- [ ] 16.1 Test all user flows
  - Instructor creates homework → Student submits → Instructor gives feedback
  - Instructor uploads resource → Student accesses it
  - Chat in both group and one-on-one courses
  - _Requirements: All_

- [ ] 16.2 Test with different course types
  - Verify group course shows group chat
  - Verify one-on-one course shows individual chats
  - Test session management integration
  - _Requirements: 4.1, 4.2_

- [ ] 16.3 Responsive design testing
  - Test on mobile devices
  - Ensure tabs work on small screens
  - Verify modals are mobile-friendly
  - _Requirements: All_

---

- [ ] 17. Final checkpoint

- Ensure all tests pass, ask the user if questions arise.
- Verify all accessibility features work correctly
- Confirm all requirements are met
