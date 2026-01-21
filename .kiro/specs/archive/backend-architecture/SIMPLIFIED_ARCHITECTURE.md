# Simplified Architecture for MVP Launch

## Overview

UniqueBrains will launch with a simplified, cost-effective architecture that eliminates unnecessary complexity while maintaining all core functionality.

## Architecture Changes

### ✅ What We're Using

| Component | Technology | Cost | Purpose |
|-----------|-----------|------|---------|
| **Frontend Hosting** | GitHub Pages | FREE | Static site hosting with CDN |
| **Database** | Supabase PostgreSQL | FREE | User data, courses, enrollments |
| **Authentication** | Supabase Auth | FREE | Email/password + OAuth (Google) |
| **File Storage** | Supabase Storage | FREE | Profile pics, course materials, homework |
| **Realtime** | Supabase Realtime | FREE | Chat and notifications |
| **Video Conferencing** | Manual Links | FREE | Instructors provide their own Zoom/Meet/Teams links |

**Total Monthly Cost: $0** 🎉

### ❌ What We're NOT Using (Deferred to Post-Launch)

| Component | Reason for Deferral |
|-----------|-------------------|
| **Vercel** | GitHub Pages is sufficient for static hosting |
| **Cloudinary** | Supabase Storage handles all file needs |
| **Stripe** | Payment integration not needed for free courses at launch |
| **Zoom API** | Manual meeting links are simpler and more flexible |
| **Email Service** | Supabase handles auth emails; marketing emails can wait |

## Key Benefits

### 1. **Zero Cost**
- Entire platform runs on free tiers
- No credit card required to launch
- Can support 50,000 users before any costs

### 2. **Simplicity**
- Only 2 platforms to manage (GitHub + Supabase)
- No complex integrations
- Faster development and deployment

### 3. **Flexibility**
- Instructors can use any video platform they prefer
- Easy to add paid features later
- Simple to scale when needed

### 4. **Security**
- Supabase RLS protects all data
- Built-in rate limiting and CAPTCHA
- OAuth for secure authentication

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Users (Browser)                 │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│    GitHub Pages (Frontend)              │
│    - React + Vite                       │
│    - Static HTML/CSS/JS                 │
│    - FREE unlimited bandwidth           │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│    Supabase (All Backend Services)      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  PostgreSQL Database               │ │
│  │  - Users, courses, enrollments     │ │
│  │  - Row Level Security (RLS)        │ │
│  │  - 500MB storage (free tier)       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Authentication                    │ │
│  │  - Email/password                  │ │
│  │  - OAuth (Google)                  │ │
│  │  - JWT tokens                      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  File Storage                      │ │
│  │  - Profile pictures                │ │
│  │  - Course materials                │ │
│  │  - Homework submissions            │ │
│  │  - 1GB storage (free tier)         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Realtime (WebSocket)              │ │
│  │  - Chat messages                   │ │
│  │  - Notifications                   │ │
│  │  - Live updates                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  FREE Tier: 50k users, 500MB DB, 1GB    │
└─────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│    External Video Platforms             │
│    (Instructor's own accounts)          │
│    - Zoom (free tier: 40 min meetings)  │
│    - Google Meet (free: 60 min)         │
│    - Microsoft Teams (free: 60 min)     │
└─────────────────────────────────────────┘
```

## Video Conferencing Approach

### How It Works

1. **Instructor Creates Session**
   - Instructor creates their own meeting on Zoom/Meet/Teams
   - Copies the meeting link
   - Pastes link into UniqueBrains session form
   - Optionally adds meeting password

2. **Student Joins Session**
   - Student sees session in their dashboard
   - Clicks "Join Meeting" button
   - Opens meeting link in new tab
   - Joins using their own Zoom/Meet/Teams account

### Benefits

- ✅ **No API Integration Needed**: No complex Zoom API setup
- ✅ **Instructor Choice**: Instructors use their preferred platform
- ✅ **Free Tier Friendly**: Instructors use their own free accounts
- ✅ **Flexible**: Works with any video platform
- ✅ **Simple**: Just copy/paste a link

### Database Schema

```sql
sessions {
  id: uuid
  course_id: uuid
  title: text
  description: text
  session_date: timestamptz
  duration_minutes: integer
  meeting_link: text          -- Any video platform URL
  meeting_id: text            -- Optional meeting ID
  meeting_password: text      -- Optional password
  meeting_platform: text      -- zoom, google_meet, microsoft_teams, other
  status: text                -- scheduled, in_progress, completed, cancelled
}
```

## Scaling Path

### Phase 1: 0-10k Users (FREE)
- Current architecture
- No changes needed
- $0/month

### Phase 2: 10k-50k Users ($25/month)
- Upgrade to Supabase Pro
- 8GB database, 100k MAU
- Still very affordable

### Phase 3: Add Monetization
- Integrate Stripe for payments
- Add automated Zoom API (optional)
- Email marketing service
- Estimated: $50-100/month

### Phase 4: 50k+ Users
- Supabase Team plan ($599/month)
- Advanced features as needed
- Consider dedicated infrastructure

## Migration Strategy

All deferred features can be added later without major refactoring:

### Adding Stripe Payments
1. Add Stripe SDK to frontend
2. Create Supabase Edge Function for webhooks
3. Update enrollment flow
4. Estimated: 1-2 weeks

### Adding Zoom API
1. Create Zoom app
2. Add Supabase Edge Function for meeting creation
3. Update session creation flow
4. Keep manual links as fallback
5. Estimated: 1 week

### Adding Email Marketing
1. Integrate Resend or SendGrid
2. Create email templates
3. Add subscription management
4. Estimated: 1 week

## Security Measures

### Implemented
- ✅ Row Level Security (RLS) on all tables
- ✅ JWT authentication with 24-hour expiration
- ✅ OAuth with Google
- ✅ Email verification required
- ✅ Password hashing (bcrypt)
- ✅ HTTPS everywhere

### To Configure
- [ ] Enable CAPTCHA in Supabase (prevent bot sign-ups)
- [ ] Set allowed origins to your domain
- [ ] Configure rate limiting
- [ ] Set up monitoring alerts

## Deployment Process

### Development
```bash
npm run dev  # Local development server
```

### Production Deployment
```bash
npm run build           # Build static files to docs/
git add docs/           # Stage built files
git commit -m "..."     # Commit changes
git push origin main    # Push to GitHub
# GitHub Pages auto-deploys!
```

### Database Migrations
```bash
# Apply migrations via Supabase Dashboard
# Or use Supabase CLI:
supabase db push
```

## Monitoring

### Supabase Dashboard
- Database size and usage
- API request counts
- Authentication events
- Error logs
- Storage usage

### GitHub Pages
- Deployment status
- Traffic analytics (via GitHub)

### Browser DevTools
- Frontend performance
- Console errors
- Network requests

## Documentation Updates

The following documents have been updated to reflect the simplified architecture:

1. ✅ **design.md** - Updated technology stack and architecture
2. ✅ **tasks.md** - Removed unnecessary tasks, updated relevant ones
3. ✅ **Migration 007** - Updated sessions table for generic meeting links

## Next Steps

1. **Review and approve** this simplified architecture
2. **Continue with Task 5.1**: Configure Supabase Storage
3. **Implement core features** following the updated task list
4. **Launch MVP** with free courses
5. **Add monetization** when ready (post-launch)

---

**Questions or Concerns?**

This simplified approach gets you to launch faster while maintaining all core functionality. You can always add complexity later when you need it!
