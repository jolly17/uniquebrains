import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTopicBySlug, createQuestion } from '../services/communityService'
import { supabase } from '../lib/supabase'
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
    imageFile: null
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

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

  // Get topic-specific placeholder
  const getPlaceholder = () => {
    if (!topic) return 'Ask your question here...'
    
    const placeholders = {
      'food-recipes': 'e.g., What are some easy lunch ideas for picky eaters?',
      'traveling-tips': 'e.g., How do you handle airport security with a sensory-sensitive child?',
      'school-suggestions': 'e.g., What accommodations helped your child succeed in school?',
      'book-club': 'e.g., Looking for books about autism for 8-year-olds, any recommendations?',
      'unfiltered-parenting': 'e.g., How do you deal with meltdowns in public places?',
      'sensory-needs': 'e.g., My son has this rash on his skin, what could it be?'
    }
    
    return placeholders[topic.slug] || `Ask your question about ${topic.name}...`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null
    }))
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Please enter a question')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      let imageUrl = null

      // Upload image if provided
      if (formData.imageFile) {
        setUploading(true)
        const fileExt = formData.imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `community/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, formData.imageFile)

        if (uploadError) {
          throw new Error('Failed to upload image')
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
        setUploading(false)
      }

      const questionData = {
        topic_id: topic.id,
        author_id: user.id,
        title: formData.title.trim(),
        content: '', // Empty content since we only have title
        image_url: imageUrl
      }

      const newQuestion = await createQuestion(questionData)
      navigate(`/community/${slug}/question/${newQuestion.id}`)
    } catch (err) {
      console.error('Error creating question:', err)
      setError('Failed to create question. Please try again.')
      setUploading(false)
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
            <label htmlFor="title">Your Question *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={getPlaceholder()}
              maxLength={300}
              required
            />
            <span className="char-count">{formData.title.length}/300</span>
            <span className="field-hint">
              Ask your question in one clear sentence
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="image">Add Image (optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="image" className="file-upload-label">
              📷 Choose Image
            </label>
            <span className="field-hint">
              Upload an image to help illustrate your question (max 5MB)
            </span>
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" onClick={removeImage} className="btn-remove-image">
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to={`/community/${slug}`} className="btn-cancel">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting || uploading}
            >
              {uploading ? 'Uploading Image...' : submitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AskQuestion
