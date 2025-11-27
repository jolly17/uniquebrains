import { useState } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { mockCourses } from '../data/mockData'
import './Marketplace.css'

function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'parenting', 'music', 'dance', 'drama', 'art', 'language']

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory && course.isPublished
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

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="no-results">
            <p>No courses found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketplace
