# UniqueBrains Learning Marketplace

**Where every brain learns differently.**

A modern, responsive learning management system designed specifically for neurodivergent children, built with React and Vite. UniqueBrains connects unique learners with specialized instructors for personalized, live classes.

## Features

### Student Features
- **Neurodiversity Profile**: Select learning needs during registration (Autism, ADHD, Dyslexia, etc.)
- **Browse Marketplace**: Search and filter courses by category
- **Course Details**: View course information, lessons, reviews, and session schedules
- **Enroll in Courses**: Enroll in free or paid courses
- **My Courses**: Track enrolled courses and progress
- **Course Learning**: Access lessons, homework, and resources
- **Rate & Review**: Submit ratings and reviews for completed courses

### Instructor Features
- **Dashboard**: View statistics, courses, and recent activity
- **Create Courses**: Create and publish new courses with session timing and frequency
- **Session Scheduling**: Configure session duration, frequency (daily/weekly/bi-weekly), and specific days
- **Student Profiles**: View neurodiversity profiles to understand student needs
- **Manage Content**: Add lessons, homework, and assessments
- **Track Performance**: Monitor student enrollments and ratings

### General Features
- **Authentication**: Login and registration for students and instructors
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Rating System**: 5-star rating with aggregated instructor ratings
- **Progress Tracking**: Visual progress bars for course completion

## Tech Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with CSS variables

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Demo Accounts

**Student Account:**
- Email: `student@demo.com`
- Password: any

**Instructor Account:**
- Email: `instructor@demo.com`
- Password: any

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with header/footer
│   ├── CourseCard.jsx  # Course card component
│   └── StarRating.jsx  # Star rating component
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Marketplace.jsx # Course marketplace
│   ├── CourseDetail.jsx # Course details
│   ├── MyCourses.jsx   # Student enrolled courses
│   ├── CourseView.jsx  # Course learning interface
│   ├── InstructorDashboard.jsx # Instructor dashboard
│   └── CreateCourse.jsx # Create course form
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── data/               # Mock data
│   └── mockData.js     # Sample courses, homework, reviews
├── App.jsx             # Main app component with routing
└── main.jsx            # App entry point
```

## Key Features Implementation

### Authentication
- Mock authentication system with localStorage
- Role-based access control (student/instructor)
- Protected routes for authenticated users

### Course Marketplace
- Search functionality
- Category filtering
- Course cards with ratings and pricing
- Responsive grid layout

### Course Learning
- Lesson navigation sidebar
- Video player placeholder
- Homework assignments
- Rating modal for course completion

### Instructor Dashboard
- Statistics overview
- Course management
- Activity feed
- Create course form

### Rating System
- 5-star rating component
- Interactive rating submission
- Display average ratings
- Review list with timestamps

## Next Steps for Production

### Backend Integration
1. Replace mock data with API calls
2. Implement real authentication with JWT
3. Add WebSocket for real-time features
4. Integrate payment processing (Stripe)

### Enhanced Features
1. Video upload and streaming
2. Audio/video recording for homework
3. Live video conferencing (WebRTC)
4. Real-time messaging
5. Certificate generation
6. Progress analytics

### Testing
1. Unit tests with Jest
2. Component tests with React Testing Library
3. E2E tests with Playwright
4. Property-based tests for core logic

### Performance
1. Code splitting and lazy loading
2. Image optimization
3. CDN integration
4. Caching strategies

### Accessibility
1. ARIA labels
2. Keyboard navigation
3. Screen reader support
4. WCAG 2.1 compliance

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

MIT
