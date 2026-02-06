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
    description: '',
    cover_image_url: ''
  })

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
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.cover_image_url.trim()) {
      setError('Please fill in all required fields')
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
        cover_image_url: formData.cover_image_url.trim(),
        created_by: user.id,
        is_featured: false
      }

      const newTopic = await createTopic(topicData)
      navigate(`/community/${newTopic.slug}`)
    } catch (err) {
      console.error('Error creating topic:', err)
      setError('Failed to create topic. The topic name might already exist.')
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

          <div className="form-group">
            <label htmlFor="cover_image_url">Cover Image URL *</label>
            <input
              type="url"
              id="cover_image_url"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              placeholder="https://example.com/cover-image.jpg"
              required
            />
            <span className="field-hint">
              Add a beautiful cover image that represents this topic (recommended size: 800x400px)
            </span>
          </div>

          {formData.cover_image_url && (
            <div className="image-preview">
              <label>Preview:</label>
              <img 
                src={formData.cover_image_url} 
                alt="Cover preview"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
                onLoad={(e) => {
                  e.target.style.display = 'block'
                }}
              />
            </div>
          )}

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
