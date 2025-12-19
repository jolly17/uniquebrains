import { useState } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { mockCourses } from '../data/mockData'
import ComingSoon from './ComingSoon'
import './Marketplace.css'

function Marketplace() {
  // TEMPORARY: Force coming soon for all environments until deployment works
  // This ensures the production site shows coming soon immediately
  const hostname = window.location.hostname
  const urlParams = new URLSearchParams(window.location.search)
  const forceComingSoon = urlParams.get('coming-soon') === 'true'
  const showMarketplace = urlParams.get('dev') === 'true' // Override for development
  
  const isProduction = hostname.includes('uniquebrains.org') || 
                      hostname === 'uniquebrains.org' ||
                      hostname === 'www.uniquebrains.org'
  
  // Debug logging
  console.log('Current hostname:', hostname)
  console.log('Is production:', isProduction)
  console.log('Force coming soon:', forceComingSoon)
  console.log('Show marketplace:', showMarketplace)
  
  // NUCLEAR OPTION: Force coming soon for EVERYONE until deployment works
  // Only show marketplace if explicitly requested with ?dev=true
  if (showMarketplace) {
    console.log('Showing marketplace due to ?dev=true')
    // Continue to show marketplace (for development testing)
  } else {
    console.log('Forcing coming soon page for everyone')
    // Force coming soon for everyone (production and localhost)
    return <ComingSoon />
  }
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
