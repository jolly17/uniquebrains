import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboardStats } from '../../services/adminService'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total_courses: 0,
    total_instructors: 0,
    total_students: 0,
    total_enrollments: 0
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
        <div className="loading-state">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the UniqueBrains admin panel</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_courses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_instructors}</div>
            <div className="stat-label">Instructors</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_students}</div>
            <div className="stat-label">Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_enrollments}</div>
            <div className="stat-label">Enrollments</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn"
            onClick={() => navigate('/admin/courses')}
          >
            <span className="action-icon">📚</span>
            <span className="action-label">Manage Courses</span>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => navigate('/admin/instructors')}
          >
            <span className="action-icon">👨‍🏫</span>
            <span className="action-label">Manage Instructors</span>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => navigate('/admin/students')}
          >
            <span className="action-icon">👥</span>
            <span className="action-label">Manage Students</span>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => navigate('/admin/analytics')}
          >
            <span className="action-icon">📈</span>
            <span className="action-label">View Analytics</span>
          </button>
        </div>
      </div>

      {/* Activity Feed Placeholder */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-feed">
          <p className="activity-placeholder">Activity feed coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
