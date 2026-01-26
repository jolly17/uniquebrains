import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CourseCard from '../components/CourseCard'
import { api, handleApiCall } from '../services/api'
import './Marketplace.css'

function Marketplace() {
  const location = useLocation()
  const { user, activePortal } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Detect portal from route or activePortal
  const portal = location.pathname.startsWith('/teach') ? 'teach' : 
                 location.pathname.startsWith('/learn') ? 'learn' : 
                 activePortal || 'learn'

  const categories = ['all', 'parenting', 'music', 'dance', 'drama', 'art', 'language']

  // Fetch all published courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const coursesData = await handleApiCall(api.courses.getAll)
        // Filter to only show published courses
        const publishedCourses = coursesData.filter(course => course.status === 'published')
        
        // Add ownership information if user is logged in
        if (user) {
          const coursesWithOwnership = publishedCourses.map(course => ({
            ...course,
            isOwned: course.instructor_id === user.id
          }))
          setCourses(coursesWithOwnership)
        } else {
          setCourses(publishedCourses)
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h1>Discover Courses</h1>
        <p className="tagline">Here every brain learns differently</p>
        <p className="subtitle">Personalized live classes for unique learners</p>
      </div>

      <div className="marketplace-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading courses...</p>
        </div>
      ) : error ? (
        <div className="error-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>{error}</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <div key={course.id} className="marketplace-course-item">
                <CourseCard course={course} />
                <div className="course-card-actions">
                  {portal === 'teach' && course.isOwned ? (
                    <Link to={`/teach/course/${course.id}/manage`} className="btn-primary btn-full">
                      Manage Course
                    </Link>
                  ) : (
                    <Link to={`/courses/${course.id}`} className="btn-primary btn-full">
                      {portal === 'teach' ? 'Enroll' : 'View Details'}
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No courses found matching your criteria</p>
              {courses.length === 0 && (
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                  No courses have been published yet. Check back soon!
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Marketplace
