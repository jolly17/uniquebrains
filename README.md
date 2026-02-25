# UniqueBrains Learning Platform

**Where every brain learns differently.**

A modern learning management system designed for neurodivergent learners, connecting students with specialized instructors for personalized education.

🌐 **Live Site**: [https://uniquebrains.org](https://uniquebrains.org)  
📚 **Documentation**: Complete guides below

---

## ✨ Features

### Core Platform
- ✅ **User Authentication** - Role-based access (Instructor, Parent)
- ✅ **Dual Portal System** - Separate teaching and learning portals
- ✅ **Course Management** - Create, edit, and publish courses
- ✅ **Marketplace** - Browse and enroll in courses
- ✅ **Session Scheduling** - Recurring and one-time sessions
- ✅ **Homework System** - Assignments, submissions, and grading
- ✅ **Real-time Messaging** - Instant chat with WebSocket
- ✅ **Resource Management** - Upload and share course materials
- ✅ **Child Management** - Parents manage multiple children profiles
- ✅ **Care Roadmap** - Interactive location-based resource discovery
- ✅ **Responsive Design** - Works on all devices

### Technical Highlights
- 🚀 **Real-time Communication** - Sub-second message delivery
- 🔒 **Secure Authentication** - JWT tokens with Supabase Auth
- 📊 **Supabase Backend** - PostgreSQL with Row Level Security
- ⚡ **Fast Performance** - Vite build system
- 🎨 **Modern UI** - Clean, accessible interface

---

## 📚 Documentation

### Quick Links
- **[FEATURES.md](./FEATURES.md)** - Complete feature documentation
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Quick testing reference
- **[COMPLETE_TESTING_GUIDE.md](./COMPLETE_TESTING_GUIDE.md)** - Detailed testing guide

### Setup & Configuration
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend configuration
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Initial setup steps

### Feature Documentation
- **[CARE_ROADMAP.md](./CARE_ROADMAP.md)** - Care Roadmap feature guide

### Additional Resources
- **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)** - Pre-launch checklist
- **[BRANDING.md](./BRANDING.md)** - Brand guidelines
- **[COURSE_TYPES.md](./COURSE_TYPES.md)** - Course specifications
- **[GUIDES.md](./GUIDES.md)** - User guides
- **[AUTH_README.md](./AUTH_README.md)** - Authentication details

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/jolly17/uniquebrains.git
cd uniquebrains

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router 6** - Navigation
- **Vite** - Build tool
- **CSS3** - Custom styling

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication (JWT)
  - Real-time subscriptions
  - Row Level Security
  - File storage
- **Supabase Realtime** - WebSocket messaging

### Deployment
- **GitHub Pages** - Static hosting
- **Custom Domain** - uniquebrains.org

---

## 📁 Project Structure

```
uniquebrains/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   │   ├── api.js           # Unified API interface
│   │   ├── courseService.js
│   │   ├── messageService.js
│   │   ├── realtimeService.js
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   └── lib/                 # Utilities and config
├── docs/                    # Production build
├── .kiro/specs/             # Feature specifications
└── [documentation files]    # See Documentation section
```

---

## 🎯 Key Features Explained

### Dual Portal System
- **Teaching Portal** (`/teach/*`) - For instructors to manage courses
- **Learning Portal** (`/learn/*`) - For parents/students to access courses
- **Automatic Portal Detection** - Based on user activities
- **Portal Switcher** - Easy switching between portals
- **Cross-Portal Actions** - Instructors can enroll in courses, parents can create courses

### Real-time Messaging
- Instant message delivery (< 1 second)
- WebSocket-based communication
- Automatic reconnection
- Connection status indicators
- Group and one-on-one chat

### Course Management
- Create group or one-on-one courses
- Auto-publish to marketplace
- Recurring session scheduling
- Enrollment management
- Student progress tracking

### Homework System
- Create assignments with due dates
- Text and file submissions
- Grading with feedback
- Completion tracking
- Late submission handling

---

## 🧪 Testing

### Manual Testing
Use the testing checklist for quick validation:
```bash
# See TESTING_CHECKLIST.md for step-by-step testing
```

### Test Accounts
Create test accounts with different roles:
- Instructor: `instructor@test.com`
- Parent: `parent@test.com`

Test dual portal functionality:
1. Create course as instructor → Teaching portal available
2. Enroll in course as instructor → Learning portal becomes available
3. Switch between portals using footer link

---

## 🚢 Deployment

### GitHub Pages Deployment

```bash
# Build and deploy
npm run build
git add docs
git commit -m "Deploy updates"
git push

# Or use the deploy script
npm run deploy
```

### Environment Variables
Required for production:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ Core platform features
- ✅ Real-time messaging
- ✅ Course management
- ✅ Homework system
- ✅ Supabase backend

### Upcoming Features
- 📹 Video conferencing integration
- 💳 Payment processing (Stripe)
- 📧 Email notifications
- 📱 Mobile app
- 📊 Analytics dashboard
- 🎓 Certificates

---

## 🐛 Troubleshooting

Having issues? Check these resources:

1. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common problems and solutions
2. **Browser Console** - Check for error messages (F12)
3. **Supabase Dashboard** - Verify backend status
4. **Network Tab** - Inspect API requests

Common issues:
- Authentication problems → Check Supabase configuration
- Real-time not working → Enable Realtime in Supabase
- Courses not showing → Verify course status is 'published'

---

## 📞 Support

- **Documentation**: See links above
- **Issues**: Check TROUBLESHOOTING.md
- **Website**: [https://uniquebrains.org](https://uniquebrains.org)

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for neurodivergent learners**

*Last Updated: January 2026*  
*Version: 1.0.0*  
*Status: Production Ready 🚀*
