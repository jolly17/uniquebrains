import { useAuth } from '../context/AuthContext'
import MyCourses from './MyCourses'
import InstructorDashboard from './InstructorDashboard'

/**
 * MyCoursesUnified - Single unified dashboard component
 * Renders different content based on activePortal state:
 * - activePortal === 'teach' → InstructorDashboard
 * - activePortal === 'learn' → MyCourses (student dashboard)
 * 
 * URL stays at /courses/my-courses regardless of portal
 * Portal switching updates activePortal state, triggering re-render
 */
function MyCoursesUnified() {
  const { activePortal } = useAuth()
  
  // Render instructor dashboard for teaching portal
  if (activePortal === 'teach') {
    return <InstructorDashboard />
  }
  
  // Render student dashboard for learning portal (default)
  return <MyCourses />
}

export default MyCoursesUnified
