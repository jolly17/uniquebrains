import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockCourses } from '../data/mockData'
import StudentHomework from './StudentHomework'
import StudentResources from './StudentResources'
import StudentChat from './StudentChat'
import HomeworkSubmissionModal from '../components/HomeworkSubmissionModal'
import HomeworkDetailsModal from '../components/HomeworkDetailsModal'
import './StudentCourseView.css'

function StudentCourseView() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  
  const course = mockCourses.find(c => c.id === courseId)
  const activeTab = searchParams.get('tab') || 'sessions'

  // State for notification badges
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [newHomework, setNewHomework] = useState(0)
  const [newResources, setNewResources] = useState(0)

  // State for homework submission modal
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState(null)

  // State for homework details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  useEffect(() => {
    // Check for new content indicators
    checkForNewContent()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(checkForNewContent, 5000)
    return () => clearInterval(interval)
  }, [courseId, user.id, activeTab])

  useEffect(() => {
    // Listen for homework submission modal events
    const handleOpenSubmissionModal = (e) => {
      setSelectedHomework(e.detail.homework)
      setShowSubmissionModal(true)
    }

    const handleViewSubmissionDetails = (e) => {
      setSelectedHomework(e.detail.homework)
      setSelectedSubmission(e.detail.submission)
      setShowDetailsModal(true)
    }

    window.addEventListener('openSubmissionModal', handleOpenSubmissionModal)
    window.addEventListener('viewSubmissionDetails', handleViewSubmissionDetails)
    
    return () => {
      window.removeEventListener('openSubmissionModal', handleOpenSubmissionModal)
      window.removeEventListener('viewSubmissionDetails', handleViewSubmissionDetails)
    }
  }, [])

  const checkForNewContent = () => {
    // Check unread messages
    const storedMessages = localStorage.getItem(`chat_${courseId}`)
    if (storedMessages) {
      const messages = JSON.parse(storedMessages)
      const unread = messages.filter(msg => 
        msg.senderRole === 'instructor' && !msg.readBy.includes(user.id)
      ).length
      setUnreadMessages(unread)
    }

    // Check new homework
    const viewedHomework = JSON.parse(localStorage.getItem(`viewed_homework_${courseId}_${user.id}`) || '[]')
    const storedHomework = JSON.parse(localStorage.getItem(`homework_${courseId}`) || '[]')
    const newHw = storedHomework.filter(hw => !viewedHomework.includes(hw.id)).length
    setNewHomework(newHw)

    // Check new resources
    const viewedResources = JSON.parse(localStorage.getItem(`viewed_resources_${courseId}_${user.id}`) || '[]')
    const storedResources = JSON.parse(localStorage.getItem(`resources_${courseId}`) || '[]')
    const newRes = storedResources.filter(res => !viewedResources.includes(res.id)).length
    setNewResources(newRes)
  }

  const handleTabChange = (tab) => {
    setSearchParams({ tab })
    
    // Clear badges when viewing the tab
    if (tab === 'chat') {
      setUnreadMessages(0)
      // Mark messages as read
      const storedMessages = localStorage.getItem(`chat_${courseId}`)
      if (storedMessages) {
        const messages = JSON.parse(storedMessages)
        const updatedMessages = messages.map(msg => ({
          ...msg,
          readBy: msg.readBy.includes(user.id) ? msg.readBy : [...msg.readBy, user.id]
        }))
        localStorage.setItem(`chat_${courseId}`, JSON.stringify(updatedMessages))
      }
    } else if (tab === 'homework') {
      setNewHomework(0)
      // Mark homework as viewed
      const storedHomework = JSON.parse(localStorage.getItem(`homework_${courseId}`) || '[]')
      const homeworkIds = storedHomework.map(hw => hw.id)
      localStorage.setItem(`viewed_homework_${courseId}_${user.id}`, JSON.stringify(homeworkIds))
    } else if (tab === 'resources') {
      setNewResources(0)
      // Mark resources as viewed
      const storedResources = JSON.parse(localStorage.getItem(`resources_${courseId}`) || '[]')
      const resourceIds = storedResources.map(res => res.id)
      localStorage.setItem(`viewed_resources_${courseId}_${user.id}`, JSON.stringify(resourceIds))
    }
  }

  const handleHomeworkSubmit = (submission) => {
    // Save submission to localStorage
    const submissions = JSON.parse(localStorage.getItem(`submissions_${courseId}_${user.id}`) || '{}')
    submissions[submission.homeworkId] = submission
    localStorage.setItem(`submissions_${courseId}_${user.id}`, JSON.stringify(submissions))

    // Close modal
    setShowSubmissionModal(false)
    setSelectedHomework(null)

    // Trigger a re-check of new content
    checkForNewContent()
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="student-course-view">
      <div className="student-course-header">
        <button onClick={() => navigate('/my-courses')} className="back-button">
          ← Back to My Courses
        </button>
        <h1>{course.title}</h1>
        <p className="course-instructor">with {course.instructorName}</p>
      </div>

      <div className="course-tabs">
        <button
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => handleTabChange('sessions')}
        >
          📅 Sessions
        </button>
        <button
          className={`tab-button ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => handleTabChange('homework')}
        >
          📝 Homework
          {newHomework > 0 && <span className="notification-badge">{newHomework}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => handleTabChange('resources')}
        >
          📚 Resources
          {newResources > 0 && <span className="notification-badge">{newResources}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => handleTabChange('chat')}
        >
          💬 Chat
          {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'sessions' && (
          <div className="tab-panel">
            <h2>Sessions</h2>
            <div className="info-banner">
              <span className="info-icon">ℹ️</span>
              <p>Your upcoming class sessions will appear here. Check back soon!</p>
            </div>
            <p className="empty-state">Session schedule coming soon</p>
          </div>
        )}
        
        {activeTab === 'homework' && (
          <div className="tab-panel">
            <StudentHomework courseId={courseId} userId={user.id} />
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div className="tab-panel">
            <StudentResources courseId={courseId} userId={user.id} />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="tab-panel">
            <StudentChat courseId={courseId} userId={user.id} course={course} />
          </div>
        )}
      </div>

      {/* Homework Submission Modal */}
      {showSubmissionModal && selectedHomework && (
        <HomeworkSubmissionModal
          homework={selectedHomework}
          onClose={() => {
            setShowSubmissionModal(false)
            setSelectedHomework(null)
          }}
          onSubmit={handleHomeworkSubmit}
        />
      )}

      {/* Homework Details Modal */}
      {showDetailsModal && selectedHomework && selectedSubmission && (
        <HomeworkDetailsModal
          homework={selectedHomework}
          submission={selectedSubmission}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedHomework(null)
            setSelectedSubmission(null)
          }}
        />
      )}
    </div>
  )
}

export default StudentCourseView
