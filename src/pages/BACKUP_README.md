# Course Management Pages - Backup Files

**Date**: January 26, 2026
**Reason**: Temporarily replaced with "Coming Soon" banners for production launch

## Backup Files

These files contain the original implementations of course management features that were replaced with "Coming Soon" banners. They include mock data and UI implementations that will be useful when building the real features.

### Files Backed Up:

1. **CourseStudents.jsx.backup**
   - Student roster display (group and one-on-one)
   - Student profile cards with neurodiversity badges
   - Mock enrolled students data
   - Student progress tracking
   - Action buttons (View Profile, Send Message, View Schedule)

2. **CourseHomework.jsx.backup**
   - Homework assignment creation modal
   - Assignment list with submission tracking
   - Submission review interface
   - Feedback system for student submissions
   - Form validation
   - Student notifications

3. **CourseResources.jsx.backup**
   - Resource upload (files and links)
   - Resource list display with icons
   - File type detection and validation
   - View statistics (who viewed what)
   - Download functionality
   - Resource deletion

4. **CourseChat.jsx.backup**
   - Group chat for group courses
   - One-on-one threaded chat for individual courses
   - Message list with timestamps
   - Real-time polling for new messages
   - Read receipts
   - Student thread list with unread counts

## How to Restore

When ready to implement these features:

1. Review the backup files to understand the UI/UX design
2. Extract the mock data structures to understand the data model
3. Replace mock data with real API calls
4. Integrate with Supabase backend
5. Test thoroughly before replacing the "Coming Soon" banners

## Git History

Original commit before replacement: `942253c`
Replacement commit: `060c72b`

To view the diff:
```bash
git diff 942253c 060c72b -- src/pages/CourseStudents.jsx
git diff 942253c 060c72b -- src/pages/CourseHomework.jsx
git diff 942253c 060c72b -- src/pages/CourseResources.jsx
git diff 942253c 060c72b -- src/pages/CourseChat.jsx
```

To restore a file:
```bash
git show 942253c:src/pages/CourseStudents.jsx > src/pages/CourseStudents.jsx
```

## Notes

- All backup files use mock data and localStorage
- The UI components are fully functional but not connected to backend
- Form validation is implemented
- Responsive design is included
- Accessibility features are present
