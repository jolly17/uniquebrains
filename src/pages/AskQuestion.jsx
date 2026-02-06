import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTopicBySlug, createQuestion } from '../services/communityService'
import './AskQuestion.css'

function AskQuestion() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    media_url: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/community/${slug}/ask` } })
      return
    }
    fetchTopic()
  }, [slug, user])

  const fetchTopic = async () => {
    try {
      setLoading(true)
      const data = await getTopicBySlug(slug)
      setTopic(data)
    } catch (err) {
      console.error('Error fetching topic:', err)
      setError('Failed to load topic')
    } finally {
      setLoading(false)
    }
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
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const questionData = {
        topic_id: topic.id,
        author_id: user.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        media_url: formData.media_url.trim() || null
      }

      const newQuestion = await createQuestion(questionData)
      navigate(`/community/${slug}/question/${newQuestion.id}`)
    } catch (err) {
      console.error('Error creating question:', err)
      setError('Failed to create question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="ask-question-page">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error && !topic) {
    return (
      <div className="ask-question-page">
        <div className="error-message">{error}</div>
        <Link to="/community" className="btn-secondary">Back to Community</Link>
      </div>
    )
  }

  return (
    <div className="ask-question-page">
      <div className="ask-question-container">
        <div className="page-header">
          <Link to={`/community/${slug}`} className="back-link">
            ← Back to {topic?.name}
          </Link>
          <h1>Ask a Question</h1>
          <p className="page-subtitle">
            Share your question with the {topic?.name} community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Question Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your question? Be specific."
              maxLength={200}
              required
            />
            <span className="char-count">{formData.title.length}/200</span>
          </div>

          <div className="form-group">
            <label htmlFor="content">Details *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Provide more details about your question. Include any relevant context that will help others understand and answer your question."
              rows={10}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="media_url">Image or Video URL (optional)</label>
            <input
              type="url"
              id="media_url"
              name="media_url"
              value={formData.media_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <span className="field-hint">
              Add a link to an image or video to help illustrate your question
            </span>
          </div>

          <div className="form-actions">
            <Link to={`/community/${slug}`} className="btn-cancel">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AskQuestion
