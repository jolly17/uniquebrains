import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1>Admin Dashboard</h1>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button className="close-sidebar-btn" onClick={closeSidebar}>×</button>
        </div>

        <div className="admin-user-info">
          <div className="admin-avatar">
            {profile?.first_name?.[0] || 'A'}
          </div>
          <div className="admin-user-details">
            <p className="admin-user-name">{profile?.first_name} {profile?.last_name}</p>
            <p className="admin-user-role">Administrator</p>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/analytics"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">📈</span>
            <span>Analytics</span>
          </NavLink>

          <NavLink 
            to="/admin/courses"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">📚</span>
            <span>Courses</span>
          </NavLink>

          <NavLink 
            to="/admin/instructors"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">👨‍🏫</span>
            <span>Instructors</span>
          </NavLink>

          <NavLink 
            to="/admin/students"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">👥</span>
            <span>Students</span>
          </NavLink>

          <NavLink 
            to="/admin/enrollments"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">📝</span>
            <span>Enrollments</span>
          </NavLink>

          <NavLink 
            to="/admin/topics"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">💬</span>
            <span>Community Topics</span>
          </NavLink>

          <NavLink 
            to="/admin/sessions"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">🗓️</span>
            <span>Sessions</span>
          </NavLink>

          <NavLink 
            to="/admin/care-resources"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <span className="nav-icon">🗺️</span>
            <span>Care Resources</span>
          </NavLink>

          <div className="nav-divider"></div>

          <button 
            className="nav-link nav-button"
            onClick={() => {
              closeSidebar()
              navigate('/')
            }}
          >
            <span className="nav-icon">🏠</span>
            <span>Back to Site</span>
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
