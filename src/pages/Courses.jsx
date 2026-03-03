import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CourseCard from '../components/CourseCard'
import { getAllPublishedCourses } from '../services/courseService'
import { getUserFriendlyMessage } from '../lib/errorHandler'
import { addBreadcrumb } from '../lib/sentry'
import SEO from '../components/SEO'
import './Courses.css'

function Courses() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const categories = [
    { value: 'all', label: 'All', icon: '🌟' },
    { value: 'performing-arts', label: 'Performing Arts', icon: '🎭' },
    { value: 'visual-arts', label: 'Visual Arts', icon: '🎨' },
    { value: 'parenting', label: 'Parenting', icon: '👨‍👩‍👧‍👦' },
    { value: 'academics', label: 'Academics', icon: '📚' },
    { value: 'language', label: 'Language', icon: '🌍' },
    { value: 'spirituality', label: 'Spirituality', icon: '🧘' },
    { value: 'lifeskills', label: 'Life Skills', icon: '🐷' },
    { value: 'hobbies', label: 'Hobbies & Fun', icon: '🎮' }
  ]

  // Fetch all published courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Add breadcrumb for user action
        addBreadcrumb({
          category: 'navigation',
          message: 'Courses page loaded',
          level: 'info',
          data: {
            userId: user?.id,
            retryCount,
          },
        });

        const coursesData = await getAllPublishedCourses()
        setCourses(coursesData)
      } catch (err) {
        console.error('Error fetching courses:', err)
        const friendlyMessage = getUserFriendlyMessage(err)
        setError(friendlyMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <SEO 
        title="Free Courses for Neurodivergent Learners | UniqueBrains"
        description="Explore free courses taught by passionate instructors who celebrate unique learning styles. From arts to academics, find courses designed for neurodivergent children and adults."
        keywords="neurodiversity courses, free online learning, ADHD courses, autism education, special education courses, neurodivergent learning"
      />
      <div className="courses">
      <div className="courses-hero">
        <div className="hero-content">
          <h1>📚 Discover Courses</h1>
          <p className="hero-subtitle">
            Here every brain learns differently. Explore free courses taught by passionate instructors 
            who celebrate unique learning styles.
          </p>
          {user && (
            <div className="hero-actions">
              <Link to="/courses/my-courses" className="btn-hero-primary">
                📖 My Courses
              </Link>
              <Link to="/teach/create-course" className="btn-hero-secondary">
                ✏️ Create Course
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="courses-filters">
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
              key={category.value}
              className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading courses...</p>
        </div>
      ) : error ? (
        <div className="error-state" style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          margin: '2rem auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>Failed to load courses</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
          <button 
            onClick={handleRetry}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
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
    </>
  )
}

export default Courses
