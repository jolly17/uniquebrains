import { useState, useEffect } from 'react'
import './ActivityFeed.css'

/**
 * ActivityFeed Component
 * Displays recent platform events with timestamps and user information
 * Shows the 20 most recent activities across the platform
 */
function ActivityFeed() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError('')
      
      // TODO: This will be implemented in subsequent tasks
      // For now, return empty array as placeholder
      setActivities([])
    } catch (err) {
      console.error('Error loading activities:', err)
      setError('Failed to load recent activities')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      'course_created': '📚',
      'enrollment': '📝',
      'session_scheduled': '📅',
      'user_registered': '👤',
      'course_updated': '✏️',
      'session_completed': '✅',
      'default': '•'
    }
    return icons[type] || icons.default
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (loading) {
    return (
      <div className="activity-feed">
        <div className="activity-loading">
          <div className="loading-spinner"></div>
          <span>Loading activities...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="activity-feed">
        <div className="activity-error">{error}</div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <div className="activity-empty">
          <span className="empty-icon">📭</span>
          <p>No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-description">{activity.description}</div>
              <div className="activity-meta">
                <span className="activity-user">{activity.user_name}</span>
                <span className="activity-separator">•</span>
                <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityFeed
