import { Link } from 'react-router-dom'
import StarRating from './StarRating'
import { generateCourseImage, getCategoryIcon } from '../utils/courseImageGenerator'
import './CourseCard.css'

function CourseCard({ course }) {
  const isFull = course.enrollmentLimit && course.currentEnrollment >= course.enrollmentLimit
  const spotsLeft = course.enrollmentLimit ? course.enrollmentLimit - course.currentEnrollment : null
  const imageData = generateCourseImage(course.category)
  const categoryIcon = getCategoryIcon(course.category)

  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-image">
        <div className="generated-image" style={imageData.style}>
          <div className="category-icon-large">{categoryIcon}</div>
        </div>
        {course.price === 0 && <span className="free-badge">Free</span>}
        {isFull && <span className="full-badge">Class Full</span>}
        {!isFull && spotsLeft !== null && spotsLeft <= 3 && spotsLeft > 0 && (
          <span className="spots-badge">{spotsLeft} spots left</span>
        )}
      </div>
      
      <div className="course-content">
        <div className="course-metadata">
          <div className="course-category">{course.category}</div>
          {course.age_group && (
            <div className="course-age-group">{course.age_group}</div>
          )}
        </div>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        
        <div className="course-instructor">
          <span>By {course.instructorName}</span>
        </div>
        
        <div className="course-footer">
          <div className="course-rating">
            <StarRating rating={course.averageRating} />
            <span className="rating-count">({course.totalRatings})</span>
          </div>
          
          <div className="course-price">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
