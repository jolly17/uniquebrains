import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboardStats } from '../../services/adminService'
import ActivityFeed from '../../components/admin/ActivityFeed'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total_courses: 0,
    total_instructors: 0,
    total_students: 0,
    total_enrollments: 0,
    total_topics: 0,
    total_care_resources: 0,
    total_questions: 0,
    total_reviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-refresh" onClick={loadStats}>
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the UniqueBrains admin panel</p>
        </div>
        <button className="btn-refresh" onClick={loadStats} title="Refresh statistics">
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => navigate('/admin/courses')}>
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_courses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/admin/instructors')}>
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_instructors}</div>
            <div className="stat-label">Instructors</div>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/admin/students')}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_students}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/admin/enrollments')}>
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_enrollments}</div>
            <div className="stat-label">Enrollments</div>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/admin/topics')}>
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_topics}</div>
            <div className="stat-label">Community Topics</div>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_questions}</div>
            <div className="stat-label">Community Questions</div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/admin/care-resources')}>
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_care_resources}</div>
            <div className="stat-label">Care Resources</div>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_reviews}</div>
            <div className="stat-label">Care Reviews</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => navigate('/teach/create-course')}>
            <span className="quick-action-icon">➕</span>
            <span className="quick-action-label">Create Course</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/community/create-topic')}>
            <span className="quick-action-icon">💬</span>
            <span className="quick-action-label">Add Topic</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/care-resources')}>
            <span className="quick-action-icon">📤</span>
            <span className="quick-action-label">Upload Resources</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/analytics')}>
            <span className="quick-action-icon">📈</span>
            <span className="quick-action-label">View Analytics</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/enrollments')}>
            <span className="quick-action-icon">📧</span>
            <span className="quick-action-label">Email Students</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/sessions')}>
            <span className="quick-action-icon">🗓️</span>
            <span className="quick-action-label">Manage Sessions</span>
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <ActivityFeed />
      </div>
    </div>
  )
}

export default AdminDashboard
