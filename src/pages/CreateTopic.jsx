import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createTopic } from '../services/communityService'
import './CreateTopic.css'

function CreateTopic() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  // Default cover image - UniqueBrains logo
  const DEFAULT_COVER_IMAGE = 'https://uniquebrains.org/uniquebrains-logo.png.png'

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/community/create-topic' } })
    }
  }, [user])

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    if (!user || !user.id) {
      setError('You must be logged in to create a topic')
      return
    }

    // Validate user.id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user.id)) {
      console.error('Invalid user ID format:', user.id)
      setError('Invalid user session. Please log out and log back in.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const slug = generateSlug(formData.name)

      const topicData = {
        name: formData.name.trim(),
        slug: slug,
        description: formData.description.trim(),
        cover_image_url: DEFAULT_COVER_IMAGE,
        created_by: user.id,
        is_featured: false
      }

      console.log('Creating topic with data:', topicData)
      const newTopic = await createTopic(topicData)
      navigate(`/community/${newTopic.slug}`)
    } catch (err) {
      console.error('Error creating topic:', err)
      setError(err.message || 'Failed to create topic. The topic name might already exist.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-topic-page">
      <div className="create-topic-container">
        <div className="page-header">
          <Link to="/community" className="back-link">
            ← Back to Community
          </Link>
          <h1>Create New Topic</h1>
          <p className="page-subtitle">
            Start a new conversation topic for the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="topic-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Topic Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Sensory-Friendly Activities"
              maxLength={100}
              required
            />
            <span className="char-count">{formData.name.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this topic is about and what kind of questions or discussions it should include."
              rows={6}
              required
            />
          </div>

          <div className="form-actions">
            <Link to="/community" className="btn-cancel">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTopic
