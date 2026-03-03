# UniqueBrains Technical Documentation

> **For Future Developers** - Everything you need to know to work on this codebase.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture](#architecture)
6. [Design System](#design-system)
7. [Authentication](#authentication)
8. [Database Schema](#database-schema)
9. [API Services](#api-services)
10. [Deployment](#deployment)
11. [Environment Variables](#environment-variables)
12. [Key Features](#key-features)
13. [Testing](#testing)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

UniqueBrains is a platform for the neurodiverse community featuring:
- **Courses**: Free online courses for neurodivergent learners
- **Community**: Q&A forum for parents and caregivers
- **Content**: Educational resources about neurodiversity
- **Care**: Interactive roadmap for care journey milestones

**Live Site**: https://uniquebrains.org  
**Repository**: https://github.com/jolly17/uniquebrains

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS Modules** - Styling (no CSS-in-JS)

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication (email + OAuth)
  - Row Level Security (RLS)
  - Edge Functions
  - Real-time subscriptions
  - File storage

### Deployment
- **GitHub Pages** - Static hosting
- **GitHub Actions** - CI/CD (optional)

### Third-Party Services
- **Sentry** - Error monitoring
- **Resend** - Email notifications
- **Google Analytics** - Analytics

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # Main layout with header/footer
│   ├── CourseCard.jsx   # Course display card
│   ├── EmptyState.jsx   # Empty state component
│   ├── Skeleton.jsx     # Loading skeletons
│   ├── Toast.jsx        # Toast notifications
│   └── ...
├── context/             # React Context providers
│   └── AuthContext.jsx  # Authentication state
├── data/                # Static data and constants
│   ├── constants.js     # App-wide constants
│   └── milestones.js    # Care roadmap milestones
├── lib/                 # Utility libraries
│   ├── supabase.js      # Supabase client
│   ├── auth.js          # Auth helper functions
│   ├── sentry.js        # Sentry configuration
│   └── errorHandler.js  # Error handling utilities
├── pages/               # Page components (routes)
│   ├── LandingPage.jsx  # Home page
│   ├── Courses.jsx      # Course marketplace
│   ├── Community.jsx    # Community Q&A
│   ├── Content.jsx      # Content resources
│   ├── CareTimeline.jsx # Care roadmap
│   └── ...
├── services/            # API service functions
│   ├── courseService.js # Course CRUD operations
│   ├── communityService.js # Community Q&A
│   ├── enrollmentService.js # Enrollments
│   └── ...
├── styles/              # Global styles and design system
│   ├── tokens.css       # Design tokens (colors, spacing)
│   ├── utilities.css    # Utility classes
│   ├── buttons.css      # Button styles
│   └── hero.css         # Shared hero section
├── utils/               # Utility functions
│   └── timezoneUtils.js # Timezone helpers
├── App.jsx              # Root component with routes
├── main.jsx             # Entry point
└── index.css            # Global styles

public/                  # Static assets
├── Uniquebrains-mascot.png  # Favicon/logo
└── ...

supabase/                # Supabase configuration
├── migrations/          # Database migrations
└── functions/           # Edge functions

scripts/                 # Build and utility scripts
├── generate-sitemap.js  # Sitemap generator
└── update-meta-tags.js  # SEO meta tags
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/jolly17/uniquebrains.git
cd uniquebrains

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_dsn (optional)
```

---

## Architecture

### Component Architecture

```
App.jsx
├── AuthProvider (context)
│   └── BrowserRouter
│       └── Routes
│           ├── Layout (shared header/footer)
│           │   ├── LandingPage
│           │   ├── Courses
│           │   ├── CourseDetail
│           │   ├── Community
│           │   ├── Content
│           │   ├── CareTimeline
│           │   └── ...
│           └── Auth pages (no layout)
│               ├── Login
│               ├── Register
│               └── AuthCallback
```

### Data Flow

1. **User Action** → Component
2. **Component** → Service Function (e.g., `courseService.js`)
3. **Service** → Supabase Client
4. **Supabase** → PostgreSQL (with RLS)
5. **Response** → Component State → UI Update

### State Management

- **AuthContext**: User authentication state, profile, active portal
- **Local State**: Component-specific state with `useState`
- **Server State**: Fetched via services, cached in component state

---

## Design System

### Design Tokens (`src/styles/tokens.css`)

```css
/* Colors */
--color-indigo: #4f46e5;      /* Primary brand color */
--color-purple: #7c3aed;      /* Secondary brand color */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Typography */
--font-family: 'Inter', system-ui, sans-serif;
--font-size-base: 1rem;       /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.25rem;      /* 20px */

/* Spacing */
--spacing-1: 0.25rem;         /* 4px */
--spacing-2: 0.5rem;          /* 8px */
--spacing-4: 1rem;            /* 16px */
--spacing-8: 2rem;            /* 32px */

/* Shadows */
--shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Shared Components

- **Hero Section**: Use `.hero-section` class for consistent page headers
- **Buttons**: Use classes from `buttons.css` (`.btn`, `.btn-primary`, etc.)
- **Cards**: Use `.card` class for consistent card styling
- **Empty States**: Use `<EmptyState>` component
- **Loading**: Use `<Skeleton>` components

---

## Authentication

### Auth Flow

1. **Email Sign Up**: User registers → Email verification → Profile creation
2. **OAuth**: Google/GitHub → Callback → Profile creation
3. **Sign In**: Email/password or OAuth → JWT token → Session

### Auth Context (`src/context/AuthContext.jsx`)

```jsx
const { 
  user,           // Supabase user object
  profile,        // User profile from profiles table
  loading,        // Auth loading state
  activePortal,   // 'learning' or 'teaching'
  availablePortals,
  login,
  logout,
  signUp
} = useAuth();
```

### Protected Routes

```jsx
// In App.jsx
<Route element={<ProtectedRoute />}>
  <Route path="/profile" element={<Profile />} />
  <Route path="/courses/my-courses" element={<MyCourses />} />
</Route>
```

---

## Database Schema

### Core Tables

```sql
-- Users (managed by Supabase Auth)
auth.users

-- User profiles
profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  first_name text,
  last_name text,
  role text, -- 'student', 'instructor', 'admin'
  bio text,
  expertise text[],
  created_at timestamp
)

-- Courses
courses (
  id uuid PRIMARY KEY,
  instructor_id uuid REFERENCES profiles,
  title text,
  description text,
  category text,
  course_type text, -- 'group', '1-on-1'
  is_published boolean,
  timezone text,
  meeting_link text,
  created_at timestamp
)

-- Enrollments
enrollments (
  id uuid PRIMARY KEY,
  course_id uuid REFERENCES courses,
  student_id uuid REFERENCES profiles,
  status text, -- 'enrolled', 'dropped'
  enrolled_at timestamp
)

-- Sessions
sessions (
  id uuid PRIMARY KEY,
  course_id uuid REFERENCES courses,
  title text,
  start_time timestamp,
  duration_minutes integer
)

-- Community Topics
community_topics (
  id uuid PRIMARY KEY,
  name text,
  slug text,
  description text,
  cover_image_url text
)

-- Community Questions
community_questions (
  id uuid PRIMARY KEY,
  topic_id uuid REFERENCES community_topics,
  user_id uuid REFERENCES profiles,
  title text,
  content text,
  created_at timestamp
)
```

### Row Level Security (RLS)

All tables have RLS policies. Key patterns:
- **Public read**: Courses, topics, questions
- **Authenticated write**: Own profile, own enrollments
- **Instructor access**: Own courses, enrolled students
- **Admin access**: All data

---

## API Services

### Service Pattern

```javascript
// src/services/courseService.js
import { supabase } from '../lib/supabase';

export async function getAllPublishedCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(first_name, last_name)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### Available Services

| Service | Purpose |
|---------|---------|
| `courseService.js` | Course CRUD, enrollment counts |
| `enrollmentService.js` | Enroll/unenroll students |
| `communityService.js` | Topics, questions, answers |
| `sessionService.js` | Course sessions |
| `messageService.js` | Chat messages |
| `accessService.js` | Access control checks |

---

## Deployment

### Build Process

```bash
# Build for production
npm run build

# Output goes to /docs folder (for GitHub Pages)
```

### GitHub Pages Setup

1. Repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `main`, folder: `/docs`
4. Custom domain: `uniquebrains.org`

### Build Scripts

- `npm run build` - Full build with sitemap and meta tags
- `npm run dev` - Development server
- `npm run preview` - Preview production build

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_SENTRY_DSN` | No | Sentry error tracking DSN |
| `VITE_GA_ID` | No | Google Analytics ID |

---

## Key Features

### 1. Course Marketplace
- Browse published courses
- Filter by category
- Search by title/description
- Enroll in courses

### 2. Community Q&A
- Topic-based organization
- Ask and answer questions
- Upvote answers

### 3. Care Roadmap
- Interactive milestone timeline
- Resource listings by location
- Provider directory

### 4. Content Library
- Neurodiversity education
- Sensory differences guide
- Shareable resources

---

## Testing

### Manual Testing Checklist

- [ ] User registration (email)
- [ ] User login/logout
- [ ] OAuth (Google)
- [ ] Course browsing
- [ ] Course enrollment
- [ ] Community Q&A
- [ ] Profile editing
- [ ] Mobile responsiveness

### Running Tests

```bash
# Run unit tests (if configured)
npm run test

# Run linting
npm run lint
```

---

## Troubleshooting

### Common Issues

**1. Supabase connection errors**
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Check RLS policies allow the operation

**2. Build failures**
- Clear `node_modules` and reinstall
- Check for TypeScript/ESLint errors
- Verify all imports are correct

**3. Styling issues**
- Check CSS variable definitions in `tokens.css`
- Verify class names match CSS files
- Check for CSS specificity conflicts

**4. Auth issues**
- Clear browser storage
- Check Supabase auth settings
- Verify redirect URLs are configured

### Debug Mode

```javascript
// Enable Supabase debug logging
import { supabase } from './lib/supabase';
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

---

## Contributing

### Code Style

- Use functional components with hooks
- Use CSS modules (no inline styles)
- Use design tokens for colors/spacing
- Follow existing file naming conventions

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with clear commits
3. Test locally
4. Create PR with description
5. Wait for review

---

## Contact

- **Email**: hello@uniquebrains.org
- **GitHub Issues**: For bug reports and feature requests

---

*Last updated: March 2026*