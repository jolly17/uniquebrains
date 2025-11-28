import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { mockCourses } from '../data/mockData'
import ManageSessions from './ManageSessions'
import './ManageCourse.css'

function ManageCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const course = mockCourses.find(c => c.id === courseId)
  const activeTab = searchParams.get('tab') || 'sessions'

  if (!course) {
    return <div>Course not found</div>
  }

  const handleTabChange = (tab) => {
    setSearchParams({ tab })
  }

  return (
    <div className="manage-course">
      <div className="manage-course-header">
        <button onClick={() => navigate('/instructor/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>{course.title}</h1>
        <p className="course-subtitle">Manage your course content and students</p>
      </div>

      <div className="course-tabs">
        <button
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => handleTabChange('sessions')}
        >
          📅 Sessions
        </button>
        <button
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => handleTabChange('students')}
        >
          👥 Students
        </button>
        <button
          className={`tab-button ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => handleTabChange('homework')}
        >
          📝 Homework
        </button>
        <button
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => handleTabChange('resources')}
        >
          📚 Resources
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => handleTabChange('chat')}
        >
          💬 Chat
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'sessions' && <ManageSessions />}
        {activeTab === 'students' && <div>Students tab - Coming soon</div>}
        {activeTab === 'homework' && <div>Homework tab - Coming soon</div>}
        {activeTab === 'resources' && <div>Resources tab - Coming soon</div>}
        {activeTab === 'chat' && <div>Chat tab - Coming soon</div>}
      </div>
    </div>
  )
}

export default ManageCourse
