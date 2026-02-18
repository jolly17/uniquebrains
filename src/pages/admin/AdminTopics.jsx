import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminTopics.css'

function AdminTopics() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTopic, setEditingTopic] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTopics(data || [])
    } catch (err) {
      console.error('Error fetching topics:', err)
      setError('Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (topic) => {
    setEditingTopic(topic)
    setImageUrl(topic.cover_image_url || '')
  }

  const handleCancelEdit = () => {
    setEditingTopic(null)
    setImageUrl('')
  }

  const handleUpdateImage = async () => {
    if (!editingTopic || !imageUrl.trim()) {
      alert('Please enter a valid image URL')
      return
    }

    try {
      setUpdating(true)
      const { error } = await supabase
        .from('topics')
        .update({ cover_image_url: imageUrl.trim() })
        .eq('id', editingTopic.id)

      if (error) throw error

      // Update local state
      setTopics(topics.map(t => 
        t.id === editingTopic.id 
          ? { ...t, cover_image_url: imageUrl.trim() }
          : t
      ))

      alert('Topic image updated successfully!')
      handleCancelEdit()
    } catch (err) {
      console.error('Error updating topic:', err)
      alert('Failed to update topic image')
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleFeatured = async (topicId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_featured: !currentStatus })
        .eq('id', topicId)

      if (error) throw error

      // Update local state
      setTopics(topics.map(t => 
        t.id === topicId 
          ? { ...t, is_featured: !currentStatus }
          : t
      ))
    } catch (err) {
      console.error('Error toggling featured status:', err)
      alert('Failed to update featured status')
    }
  }

  if (loading) {
    return (
      <div className="admin-topics">
        <div className="loading">Loading topics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-topics">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-topics">
      <div className="page-header">
        <h1>Manage Community Topics</h1>
        <p className="page-subtitle">Update topic cover images and featured status</p>
      </div>

      <div className="topics-list">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-item">
            <div className="topic-image">
              <img 
                src={topic.cover_image_url} 
                alt={topic.name}
                onError={(e) => {
                  e.target.src = 'https://uniquebrains.org/uniquebrains-logo.png.png'
                }}
              />
            </div>
            <div className="topic-info">
              <h3>{topic.name}</h3>
              <p className="topic-description">{topic.description}</p>
              <div className="topic-meta">
                <span className="topic-slug">Slug: {topic.slug}</span>
                <span className={`topic-featured ${topic.is_featured ? 'active' : ''}`}>
                  {topic.is_featured ? '⭐ Featured' : 'Not Featured'}
                </span>
              </div>
            </div>
            <div className="topic-actions">
              <button 
                onClick={() => handleEditClick(topic)}
                className="btn-edit"
              >
                Change Image
              </button>
              <button 
                onClick={() => handleToggleFeatured(topic.id, topic.is_featured)}
                className={`btn-toggle ${topic.is_featured ? 'featured' : ''}`}
              >
                {topic.is_featured ? 'Unfeature' : 'Feature'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTopic && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Cover Image</h2>
            <p className="modal-subtitle">Topic: {editingTopic.name}</p>

            <div className="form-group">
              <label htmlFor="imageUrl">Cover Image URL</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="image-url-input"
              />
              <span className="field-hint">
                Recommended size: 800x400px. Use high-quality images from Unsplash or similar.
              </span>
            </div>

            {imageUrl && (
              <div className="image-preview">
                <label>Preview:</label>
                <img 
                  src={imageUrl} 
                  alt="Preview"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block'
                  }}
                />
              </div>
            )}

            <div className="modal-actions">
              <button 
                onClick={handleCancelEdit}
                className="btn-cancel"
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateImage}
                className="btn-save"
                disabled={updating || !imageUrl.trim()}
              >
                {updating ? 'Updating...' : 'Update Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTopics
