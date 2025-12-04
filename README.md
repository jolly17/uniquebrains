# UniqueBrains Learning Platform

**Where every brain learns differently.**

A modern learning management system designed for neurodivergent learners, connecting students with specialized instructors for personalized education.

🌐 **Live Site**: [https://uniquebrains.org](https://uniquebrains.org)
📚 **Documentation**: See [GUIDES.md](./GUIDES.md)

---

## ✨ Current Status

### ✅ Implemented Features

**Student Experience:**
- Browse and enroll in courses
- View course schedules and sessions
- Submit homework (text, file, or checkmark)
- Access course resources
- Chat with instructors (group or private)
- Track progress and completion
- Neurodiversity profile support

**Instructor Experience:**
- Create and manage courses
- **Recurring session scheduling** (weekly patterns)
- Create individual sessions
- Assign and review homework
- Provide feedback to students
- Upload resources (files and links)
- Chat with students (group or 1-on-1)
- View student profiles and progress

**Platform Features:**
- Role-based authentication (student/instructor/parent)
- Responsive design (mobile, tablet, desktop)
- Real-time notifications
- LocalStorage data persistence
- Course ratings and reviews

### 📋 Documented (Ready to Implement)

- Complete backend architecture (Supabase + Vercel)
- Database schema and API design
- Payment processing (Stripe)
- Email notifications
- Video conferencing integration (Zoom)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/jolly17/uniquebrains.git
cd uniquebrains

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

**Student:**
- Email: `student@demo.com`
- Password: any

**Instructor:**
- Email: `instructor@demo.com`
- Password: any

**Parent:**
- Email: `parent@demo.com`
- Password: any

---

## 📁 Project Structure

```
uniquebrains/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main layout with header/footer
│   │   ├── CourseCard.jsx   # Course display card
│   │   ├── HomeworkSubmissionModal.jsx
│   │   └── HomeworkDetailsModal.jsx
│   ├── pages/               # Page components
│   │   ├── LandingPage.jsx
│   │   ├── Marketplace.jsx
│   │   ├── InstructorDashboard.jsx
│   │   ├── ManageCourse.jsx
│   │   ├── ManageSessions.jsx  # Session scheduling
│   │   ├── CourseHomework.jsx  # Homework management
│   │   ├── CourseResources.jsx # Resource management
│   │   ├── CourseChat.jsx      # Chat system
│   │   ├── StudentCourseView.jsx
│   │   ├── StudentHomework.jsx
│   │   ├── StudentResources.jsx
│   │   └── StudentChat.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state
│   └── data/
│       └── mockData.js      # Sample data
├── .kiro/specs/             # Feature specifications
│   ├── backend-architecture/
│   └── instructor-course-management/
├── docs/                    # Production build (GitHub Pages)
├── GUIDES.md               # Complete user guides
├── BACKEND_SETUP.md        # Backend implementation guide
└── README.md               # This file
```

---

## 🎯 Key Features

### Session Scheduling

**Recurring Schedules:**
- Set up weekly patterns (e.g., Mon/Wed/Fri at 10 AM)
- Auto-generate sessions for weeks/months
- Individual schedules per student (1-on-1 courses)
- Edit schedules when availability changes

**Single Sessions:**
- Create one-off sessions as needed
- Set custom topics and meeting links
- Override recurring patterns

### Homework System

**For Instructors:**
- Create assignments with due dates
- Support text, file, or checkmark submissions
- Review submissions
- Provide written feedback
- Track completion rates

**For Students:**
- View "To Do" and "Completed" sections
- Submit homework before due date
- Receive instructor feedback
- Track days remaining

### Resource Management

**Instructors can:**
- Upload files (PDF, images, documents)
- Add web links
- Track which students viewed resources

**Students can:**
- Download files
- Preview supported formats
- Access links
- View all course materials

### Chat System

**Group Courses:**
- Single group chat with all students
- Real-time messaging
- Message history

**One-on-One Courses:**
- Individual chat threads per student
- Private conversations
- Coordinate scheduling

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Custom styling with variables

### Backend (Documented, Not Yet Implemented)
- **Supabase** - PostgreSQL database + Auth + Storage
- **Vercel** - Hosting and serverless functions
- **Stripe** - Payment processing
- **Cloudinary** - Image/video CDN
- **Resend/SendGrid** - Email notifications
- **Zoom API** - Video conferencing

### Current Data Storage
- **LocalStorage** - Client-side persistence
- **Mock Data** - Sample courses and users

---

## 📖 Documentation

### User Guides
- **[GUIDES.md](./GUIDES.md)** - Complete platform guides
  - Session scheduling guide
  - Course management guide
  - Deployment guide
  - Backend setup guide

### Technical Documentation
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend implementation
- **[.kiro/specs/backend-architecture/](./kiro/specs/backend-architecture/)** - Complete backend specs
  - Architecture diagrams
  - Database schema
  - API design
  - Security measures

### Other Docs
- **[BRANDING.md](./BRANDING.md)** - Brand guidelines
- **[COURSE_TYPES.md](./COURSE_TYPES.md)** - Course type specifications
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions

---

## 🚢 Deployment

### Current Setup

**Hosting**: GitHub Pages
**Domain**: uniquebrains.org
**Build Output**: `/docs` folder

### Deploy Process

```bash
# 1. Build the project
npm run build

# 2. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 3. Wait 2-5 minutes for GitHub Pages to rebuild
```

### Deployment Status

Check: [https://github.com/jolly17/uniquebrains/actions](https://github.com/jolly17/uniquebrains/actions)

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅ (Current)
- [x] Student and instructor dashboards
- [x] Course creation and management
- [x] Session scheduling (recurring + single)
- [x] Homework system
- [x] Resource management
- [x] Chat system
- [x] Responsive design

### Phase 2: Backend Integration 📋 (Next)
- [ ] Supabase database setup
- [ ] Real authentication
- [ ] File storage (Cloudinary)
- [ ] API integration
- [ ] Real-time features (WebSocket)

### Phase 3: Payments & Video 💰
- [ ] Stripe payment processing
- [ ] Zoom API integration
- [ ] Video upload and streaming
- [ ] Certificate generation

### Phase 4: Advanced Features 🚀
- [ ] AI-powered course recommendations
- [ ] Progress analytics
- [ ] Parent dashboard enhancements
- [ ] Mobile apps (iOS/Android)

---

## 🧪 Testing

### Current
- Manual testing
- Browser compatibility testing

### Planned
- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)
- Property-based tests for core logic

---

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

- **Website**: [https://uniquebrains.org](https://uniquebrains.org)
- **Email**: support@uniquebrains.org
- **Documentation**: [GUIDES.md](./GUIDES.md)

---

**Built with ❤️ for neurodivergent learners**

*Last Updated: December 2025*
