import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import CourseDetail from './pages/CourseDetail'
import MyCourses from './pages/MyCourses'
import CourseView from './pages/CourseView'
import InstructorDashboard from './pages/InstructorDashboard'
import CreateCourse from './pages/CreateCourse'
import ManageSessions from './pages/ManageSessions'
import ManageCourse from './pages/ManageCourse'
import StudentProfile from './pages/StudentProfile'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/" />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/uniquebrains">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            
            <Route path="my-courses" element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            } />
            
            <Route path="learn/:courseId" element={
              <ProtectedRoute>
                <CourseView />
              </ProtectedRoute>
            } />
            
            <Route path="instructor/dashboard" element={
              <ProtectedRoute role="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="instructor/create-course" element={
              <ProtectedRoute role="instructor">
                <CreateCourse />
              </ProtectedRoute>
            } />
            
            <Route path="instructor/sessions/:courseId" element={
              <ProtectedRoute role="instructor">
                <ManageSessions />
              </ProtectedRoute>
            } />
            
            <Route path="instructor/course/:courseId/manage" element={
              <ProtectedRoute role="instructor">
                <ManageCourse />
              </ProtectedRoute>
            } />
            
            <Route path="profile" element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
