import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockCourses } from '../data/mockData'
import './MyCourses.css'

function MyCourses() {
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  
  // Mock enrolled courses (first 2 courses)
  const enrolledCourses = mockCourses.slice(0, 2)

  // Generate upcoming sessions for calendar view
  const generateUpcomingSessions = () => {
    const sessions = []
    
    enrolledCourses.forEach(course => {
      if (!course.isSelfPaced && course.selectedDays.length > 0) {
        // Generate next 4 weeks of sessions
        for (let week = 0; week < 4; week++) {
          course.selectedDays.forEach(day => {
            const sessionDate = getNextDayOfWeek(day, week)
            sessions.push({
              courseId: course.id,
              courseTitle: course.title,
              instructor: course.instructorName,
              date: sessionDate,
              time: course.sessionTime || '09:00',
              duration: course.sessionDuration,
              category: course.category
            })
          })
        }
      }
    })
    
    return sessions.sort((a, b) => a.date - b.date)
  }

  const getNextDayOfWeek = (dayName, weeksAhead = 0) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = new Date()
    const targetDay = days.indexOf(dayName)
    const currentDay = today.getDay()
    
    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget <= 0) daysUntilTarget += 7
    
    const resultDate = new Date(today)
    resultDate.setDate(today.getDate() + daysUntilTarget + (weeksAhead * 7))
    return resultDate
  }

  const upcomingSessions = generateUpcomingSessions()

  return (
    <div className="my-courses">
      <div className="my-courses-header">
        <h1>My Courses</h1>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="courses-list">
        {enrolledCourses.map(course => {
          // Mock progress - in real app this would come from user's progress data
          const progress = 35 // Mock 35% completion

          return (
            <div key={course.id} className="enrolled-course-card">
              <div className="course-info">
                <h3>{course.title}</h3>
                <p className="instructor">By {course.instructorName}</p>
                
                {!course.isSelfPaced && (
                  <p className="session-info">
                    📅 {course.sessionDuration} min • {course.sessionFrequency}
                    {course.selectedDays.length > 0 && course.dayTimes && (
                      <span className="session-times">
                        {' • '}
                        {course.selectedDays.map(day => `${day} ${course.dayTimes[day]}`).join(', ')}
                      </span>
                    )}
                  </p>
                )}
                {course.isSelfPaced && (
                  <p className="session-info">⏰ Self-paced learning</p>
                )}
                
                <div className="progress-section">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="progress-text">{Math.round(progress)}% Complete</span>
                </div>
              </div>
              
              <Link to={`/learn/${course.id}`} className="btn-primary">
                View Course
              </Link>
            </div>
          )
        })}
        </div>
      ) : (
        <div className="calendar-view">
          <div className="calendar-header">
            <h2>Upcoming Classes</h2>
            <p className="calendar-subtitle">Your scheduled sessions for the next 4 weeks</p>
          </div>
          
          {upcomingSessions.length > 0 ? (
            <div className="sessions-timeline">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="session-card">
                  <div className="session-date">
                    <div className="date-day">{session.date.getDate()}</div>
                    <div className="date-month">
                      {session.date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="session-details">
                    <h3 className="session-title">{session.courseTitle}</h3>
                    <div className="session-meta">
                      <span>👨‍🏫 {session.instructor}</span>
                      <span>🕐 {session.time}</span>
                      <span>⏱️ {session.duration} min</span>
                    </div>
                    <div className="session-day">
                      {session.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  
                  <Link to={`/learn/${session.courseId}`} className="btn-primary">
                    Join Class
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-sessions">
              <p>No upcoming scheduled sessions</p>
              <p className="no-sessions-subtitle">Your self-paced courses are available anytime</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MyCourses
