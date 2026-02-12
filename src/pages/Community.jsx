import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllTopics } from '../services/communityService'
import './Community.css'

function Community() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const data = await getAllTopics()
      setTopics(data)
    } catch (err) {
      console.error('Error fetching topics:', err)
      setError('Failed to load community topics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="community-page">
        <div className="loading">Loading community...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="community-page">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="community-page">
      <div className="community-hero">
        <div className="hero-content">
          <h1>🌟 Community Hub</h1>
          <p className="hero-subtitle">
            Connect, share, and learn from our vibrant neurodiverse community. 
            Ask questions, share experiences, and find support from people who understand.
          </p>
        </div>
      </div>

      <div className="community-container">
        <div className="topics-grid">
          {topics.map((topic) => (
            <Link 
              key={topic.id} 
              to={`/community/${topic.slug}`}
              className="topic-card"
            >
              <div className="topic-cover">
                <img 
                  src={topic.cover_image_url} 
                  alt={topic.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop'
                  }}
                />
                <div className="topic-overlay">
                  <h2 className="topic-name">{topic.name}</h2>
                </div>
              </div>
              <div className="topic-card-content">
                <p className="topic-description">{topic.description}</p>
                <div className="topic-stats">
                  <span className="stat">
                    <span className="stat-icon">💬</span>
                    <span className="stat-value">{topic.question_count}</span>
                    <span className="stat-label">Questions</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="community-cta">
          <div className="cta-card">
            <h3>Can't find the right topic?</h3>
            <p>Create a new community topic and start the conversation!</p>
            <Link to="/community/create-topic" className="btn-primary">
              Create New Topic
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Community
