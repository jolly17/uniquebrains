import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import CourseDetail from './pages/CourseDetail'
import MyCourses from './pages/MyCourses'
import StudentCourseView from './pages/StudentCourseView'
import ManageStudents from './pages/ManageStudents'
import InstructorDashboard from './pages/InstructorDashboard'
import CreateCourse from './pages/CreateCourse'
import ManageSessions from './pages/ManageSessions'
import ManageCourse from './pages/ManageCourse'
import StudentProfile from './pages/StudentProfile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import { AuthCallback } from './pages/AuthCallback'
import Onboarding from './pages/Onboarding'
import RoleSelection from './pages/RoleSelection'
import BackendTestComponent from './components/BackendTestComponent'
import RLSSecurityTest from './components/RLSSecurityTest'
import ComingSoon from './pages/ComingSoon'

// Import debug utilities (only in development)
if (import.meta.env.DEV) {
  import('./utils/fixProfile.js')
}

function ProtectedRoute({ children, requirePortal }) {
  const { user, profile, availablePortals } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  // Check if user has access to the required portal
  if (requirePortal && !availablePortals.includes(requirePortal)) {
    // Redirect to their available portal
    const defaultPortal = profile?.role === 'instructor' ? 'teach' : 'learn'
    return <Navigate to={`/${defaultPortal}/dashboard`} />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          
          {/* Main layout routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            
            {/* Teaching Portal Routes */}
            <Route path="teach">
              <Route path="dashboard" element={
                <ProtectedRoute requirePortal="teach">
                  <InstructorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="marketplace" element={
                <ProtectedRoute requirePortal="teach">
                  <Marketplace portal="teach" />
                </ProtectedRoute>
              } />
              
              <Route path="my-courses" element={
                <ProtectedRoute requirePortal="teach">
                  <InstructorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="create-course" element={
                <ProtectedRoute requirePortal="teach">
                  <CreateCourse />
                </ProtectedRoute>
              } />
              
              <Route path="sessions/:courseId" element={
                <ProtectedRoute requirePortal="teach">
                  <ManageSessions />
                </ProtectedRoute>
              } />
              
              <Route path="course/:courseId/manage" element={
                <ProtectedRoute requirePortal="teach">
                  <ManageCourse />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Learning Portal Routes */}
            <Route path="learn">
              <Route path="dashboard" element={
                <ProtectedRoute requirePortal="learn">
                  <MyCourses />
                </ProtectedRoute>
              } />
              
              <Route path="marketplace" element={
                <ProtectedRoute requirePortal="learn">
                  <Marketplace portal="learn" />
                </ProtectedRoute>
              } />
              
              <Route path="my-courses" element={
                <ProtectedRoute requirePortal="learn">
                  <MyCourses />
                </ProtectedRoute>
              } />
              
              <Route path="course/:courseId/view" element={
                <ProtectedRoute requirePortal="learn">
                  <StudentCourseView />
                </ProtectedRoute>
              } />
              
              <Route path="onboarding" element={
                <ProtectedRoute requirePortal="learn">
                  <Onboarding />
                </ProtectedRoute>
              } />
              
              <Route path="manage-students" element={
                <ProtectedRoute requirePortal="learn">
                  <ManageStudents />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Legacy routes - redirect to appropriate portal */}
            <Route path="my-courses" element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            } />
            
            <Route path="manage-students" element={
              <ProtectedRoute>
                <ManageStudents />
              </ProtectedRoute>
            } />
            
            <Route path="instructor/dashboard" element={
              <Navigate to="/teach/dashboard" replace />
            } />
            
            <Route path="instructor/create-course" element={
              <Navigate to="/teach/create-course" replace />
            } />
            
            <Route path="profile" element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            } />
            
            <Route path="test-backend" element={
              <ProtectedRoute requirePortal="teach">
                <BackendTestComponent />
              </ProtectedRoute>
            } />
            
            <Route path="test-security" element={
              <ProtectedRoute>
                <RLSSecurityTest />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
