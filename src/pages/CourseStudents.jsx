import { Link } from 'react-router-dom'
import './CourseStudents.css'

function CourseStudents({ course }) {
  const isGroupCourse = course.courseType === 'group'

  // Mock enrolled students
  const enrolledStudents = [
    { 
      id: '1', 
      name: 'Emma Thompson', 
      neurodiversity: ['Autism'],
      homeworkCompleted: 5,
      homeworkTotal: 6,
      nextSession: isGroupCourse ? null : 'Mon 10:00 AM'
    },
    { 
      id: '2', 
      name: 'Liam Chen', 
      neurodiversity: ['ADHD', 'Dyslexia'],
      homeworkCompleted: 4,
      homeworkTotal: 6,
      nextSession: isGroupCourse ? null : 'Mon 11:00 AM'
    },
    { 
      id: '3', 
      name: 'Sophia Rodriguez', 
      neurodiversity: ['Other'],
      homeworkCompleted: 6,
      homeworkTotal: 6,
      nextSession: isGroupCourse ? null : 'Tue 2:00 PM'
    }
  ]

  const enrolledCount = isGroupCourse ? 8 : enrolledStudents.length
  const maxCapacity = course.enrollmentLimit || 10
  const spotsRemaining = maxCapacity - enrolledCount
  const completionRate = 80 // Mock completion rate

  return (
    <div className="course-students">
      {isGroupCourse && (
        <div className="course-stats-grid">
          <div className="stat-card">
            <div className="stat-value">{enrolledCount}</div>
            <div className="stat-label">Enrolled Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{spotsRemaining}</div>
            <div className="stat-label">Spots Remaining</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Avg Completion</div>
          </div>
        </div>
      )}

      <div className="students-section">
        <div className="students-header">
          <h2>{isGroupCourse ? '👥 Enrolled Students' : '👤 Individual Students'}</h2>
          <div className="info-banner">
            <p>ℹ️ {isGroupCourse 
              ? 'All students attend the same group sessions together'
              : 'Each student has their own schedule and individual sessions'
            }</p>
          </div>
        </div>

        <div className="students-list">
          {enrolledStudents.map(student => (
            <div key={student.id} className="student-card">
              <div className="student-info">
                <div className="student-name">👤 {student.name}</div>
                <div className="student-profile">
                  {student.neurodiversity.map((need, idx) => (
                    <span key={idx} className="profile-badge">🧩 {need}</span>
                  ))}
                </div>
                {!isGroupCourse && student.nextSession && (
                  <div className="student-next-session">
                    📅 Next session: {student.nextSession}
                  </div>
                )}
                <div className="student-progress">
                  ✅ {student.homeworkCompleted}/{student.homeworkTotal} homework completed
                </div>
              </div>
              <div className="student-actions">
                <button className="btn-secondary btn-sm">View Profile</button>
                <Link 
                  to={`/instructor/course/${course.id}/manage?tab=chat`}
                  className="btn-secondary btn-sm"
                >
                  Send Message
                </Link>
                {!isGroupCourse && (
                  <Link 
                    to={`/instructor/course/${course.id}/manage?tab=sessions`}
                    className="btn-secondary btn-sm"
                  >
                    View Schedule
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CourseStudents
