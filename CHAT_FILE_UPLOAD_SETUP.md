# Course Chat File Upload Setup

## Overview
Added file upload functionality to course chat, allowing instructors and students to share documents and images.

## Features
- Upload images (JPEG, PNG, GIF, WebP)
- Upload documents (PDF, Word, TXT)
- 10MB file size limit
- Image preview in chat
- Document download links
- Works in both group chat and 1-on-1 conversations

## Database Migration Required

Run the migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/070_create_course_attachments_bucket.sql
```

This migration:
1. Creates the `course-attachments` storage bucket
2. Sets up storage policies for upload/view/delete permissions
3. Allows authenticated course participants to upload files
4. Makes attachments publicly viewable

## How to Apply

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/070_create_course_attachments_bucket.sql`
3. Run the migration
4. Verify the bucket was created in Storage section

## Usage

### For Instructors and Students:
1. Open course chat (group or 1-on-1)
2. Click the 📎 attachment button next to the message input
3. Select a file (max 10MB)
4. File name appears below input
5. Type optional message and click Send
6. File uploads and appears in chat

### Viewing Attachments:
- Images: Display inline with preview, click to open full size
- Documents: Show as download link with 📎 icon

## Technical Details

### Frontend Changes:
- `src/pages/CourseChat.jsx`: Added file upload UI and logic
- `src/pages/CourseChat.css`: Added styling for attachments
- `src/services/messageService.js`: Updated to support `attachment_url` field

### Storage:
- Bucket: `course-attachments`
- Path structure: `course-chat/{courseId}/{randomId}.{ext}`
- Public read access
- Authenticated upload for course participants

### Security:
- Only enrolled students and course instructors can upload
- File size limited to 10MB
- File types restricted to images and common documents
- Users can delete their own attachments

## Testing

1. Create or join a course
2. Go to course chat
3. Try uploading an image - should display inline
4. Try uploading a PDF - should show download link
5. Verify file appears for other participants
6. Test in both group chat and 1-on-1 conversations
