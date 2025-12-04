# UniqueBrains Platform Guides

Complete guide for instructors and administrators using the UniqueBrains platform.

---

## Table of Contents

1. [Session Scheduling Guide](#session-scheduling-guide)
2. [Course Management Guide](#course-management-guide)
3. [Deployment Guide](#deployment-guide)
4. [Backend Setup Guide](#backend-setup-guide)

---

## Session Scheduling Guide

### Overview

Instructors can schedule sessions for both **Group Courses** and **One-on-One Courses** using two methods:
- **Recurring Schedule**: Set up a weekly pattern (recommended)
- **Single Sessions**: Create individual sessions as needed

### For Group Courses

#### Set up Recurring Schedule (Recommended)

1. **Navigate to Sessions**
   - Go to your course → "Manage Course" → "Sessions" tab

2. **Click "Set up Recurring Schedule"**
   - Select days (e.g., Monday, Wednesday, Friday)
   - Set time (e.g., 10:00 AM)
   - Set duration (default: 60 minutes)
   - Choose start date
   - Optionally set end date (defaults to 3 months)

3. **Preview and Generate**
   - Review the schedule preview
   - Click "Generate Sessions"
   - All sessions created automatically!

#### Create Single Session

1. Click "+ Create Single Session"
2. Fill in date, time, topic, meeting link
3. Click "Create Session"

### For One-on-One Courses

#### Workflow

1. **Student Enrolls** → You see them in "Students" tab

2. **Discuss Availability**
   - Go to "Chat" tab
   - Message student: "When are you available?"
   - Student responds with preferred times

3. **Set up Recurring Schedule**
   - Go to "Sessions" tab
   - Click "Set Schedule" next to student's name
   - Select agreed-upon days and time
   - Set start date
   - Click "Generate Sessions"

4. **Student Sees Schedule**
   - Sessions appear in their calendar
   - They can join at scheduled times

#### Edit Schedule

- Click "⚙️ Edit Schedule" to update
- Changes apply to future sessions
- Existing sessions remain unchanged

### Best Practices

**Communication Templates:**

```
Initial Message:
"Hi [Student Name]! 👋
Thanks for enrolling in [Course Name]! 
What days and times work best for you?
Looking forward to working together!"

After Scheduling:
"Great! I've set up our recurring schedule:
[Days] at [Time]
Meeting link: [Zoom/Google Meet link]
See you then! 🎵"
```

**Scheduling Tips:**
- Set a default meeting link in "Course Meeting Link" section
- Schedule 1-2 weeks in advance
- Set topics to help students prepare
- Use recurring schedules to save time

---

## Course Management Guide

### Instructor Dashboard

Access all your courses and management tools from `/instructor/dashboard`

### Managing a Course

Click "Manage Course" on any course card to access:

#### 1. Sessions Tab
- Set up recurring schedules
- Create individual sessions
- Edit session topics and meeting links
- View attendance (coming soon)

#### 2. Students Tab
- View all enrolled students
- See neurodiversity profiles
- Track homework completion
- Send messages to students

#### 3. Homework Tab
- Create assignments (text, file, or checkmark)
- Set due dates
- Review submissions
- Provide feedback to students

#### 4. Resources Tab
- Upload files (PDF, images, documents)
- Add web links
- Track which students viewed resources
- Delete or update resources

#### 5. Chat Tab
- **Group Courses**: Single group chat with all students
- **One-on-One Courses**: Individual chat threads per student
- Real-time messaging
- Message history

### Creating Homework

1. Go to Homework tab
2. Click "+ Create New Assignment"
3. Fill in:
   - Title
   - Description
   - Due date
   - Submission type (text/file/checkmark)
4. Click "Create Assignment"
5. Students receive notification

### Reviewing Submissions

1. Click "View Submissions" on assignment
2. See all student submissions
3. Provide feedback in text area
4. Click "Save Feedback"
5. Student receives notification

### Uploading Resources

1. Go to Resources tab
2. Click "+ Add Resource"
3. Choose file or link
4. Add title
5. Click "Add Resource"
6. Immediately visible to students

---

## Deployment Guide

### Quick Deploy to GitHub Pages

Your site is configured to deploy to: `https://uniquebrains.org`

#### Prerequisites
- Git installed
- GitHub account
- Node.js installed

#### Deploy Steps

```bash
# 1. Make your changes
# 2. Build the project
npm run build

# 3. Commit changes
git add .
git commit -m "Your commit message"

# 4. Push to GitHub
git push origin main
```

#### GitHub Pages Setup

1. Go to your repo: `https://github.com/jolly17/uniquebrains`
2. Settings → Pages
3. Source: Deploy from branch
4. Branch: `main`
5. Folder: `/docs`
6. Save

#### Custom Domain (uniquebrains.org)

Already configured! The `docs/CNAME` file contains your domain.

**DNS Settings** (already set up):
- Type: A Record
- Name: @
- Value: GitHub Pages IP

#### Deployment Timeline
- **Immediate**: Code pushed to GitHub
- **2-5 minutes**: GitHub Pages rebuilds
- **5-10 minutes**: CDN cache updates

#### Troubleshooting

**Changes not showing?**
- Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Try incognito/private window
- Wait 5 minutes for deployment

**Check deployment status:**
- Visit: `https://github.com/jolly17/uniquebrains/actions`
- Look for "pages build and deployment"
- Wait for green checkmark ✅

---

## Backend Setup Guide

### Current Status

**Frontend**: ✅ Fully functional with localStorage
**Backend**: 📋 Documented, ready to implement

### Technology Stack

- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage + Cloudinary
- **Hosting**: Vercel
- **Payments**: Stripe
- **Email**: Resend/SendGrid

### Cost

- **Current**: $0/month (static site)
- **With Backend**: $0-12/month (free tiers + domain)

### Implementation

See `.kiro/specs/backend-architecture/` for:
- Complete architecture diagrams
- Database schema
- API design
- Security measures
- Implementation tasks

### Quick Start (When Ready)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Create new project
   - Save API keys

2. **Set up Database**
   - Run SQL scripts from backend spec
   - Configure Row Level Security
   - Set up authentication

3. **Connect Frontend**
   - Install: `npm install @supabase/supabase-js`
   - Add environment variables
   - Update AuthContext to use Supabase

4. **Deploy**
   - Push to GitHub
   - Vercel auto-deploys
   - Configure environment variables

Full guide: `BACKEND_SETUP.md`

---

## Additional Resources

### Documentation Files

- `README.md` - Project overview and setup
- `BACKEND_SETUP.md` - Detailed backend setup
- `BRANDING.md` - Brand guidelines
- `COURSE_TYPES.md` - Course type specifications
- `LAUNCH_CHECKLIST.md` - Pre-launch checklist

### Spec Documents

- `.kiro/specs/backend-architecture/` - Complete backend specs
- `.kiro/specs/instructor-course-management/` - Feature specs

### Support

- **Issues**: GitHub Issues
- **Email**: support@uniquebrains.org
- **Documentation**: This file!

---

**Last Updated**: December 2025
**Version**: 2.0
