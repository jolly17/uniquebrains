import { 
  generateCourseTimeline, 
  getNextSessionDate, 
  getCourseStatusText,
  isCourseActive 
} from '../utils/courseScheduleUtils'

/**
 * CourseTimeline Component
 * Displays course schedule information and timeline for students
 */
function CourseTimeline({ course, showDetailed = false }) {
  if (!course) {
    return null
  }

  const timeline = generateCourseTimeline(course)
  const nextSession = getNextSessionDate(course)
  const statusText = getCourseStatusText(course)
  const isActive = isCourseActive(course)

  if (!timeline) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600">Schedule information not available</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Course Schedule</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {statusText}
        </span>
      </div>

      {timeline.type === 'self-paced' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Self-Paced Learning</h4>
          <p className="text-gray-600">Learn at your own pace, on your own schedule</p>
        </div>
      )}

      {timeline.type === 'no-schedule' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Schedule Pending</h4>
          <p className="text-gray-600">The instructor will announce the schedule soon</p>
        </div>
      )}

      {timeline.type === 'scheduled' && (
        <div className="space-y-4">
          {/* Quick Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{timeline.totalSessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{timeline.duration}</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{timeline.sessionDuration}</div>
              <div className="text-sm text-gray-600">Per Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{timeline.daysOfWeek?.length || 0}</div>
              <div className="text-sm text-gray-600">Days/Week</div>
            </div>
          </div>

          {/* Schedule Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Schedule Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Days:</span>
                <span className="font-medium">{timeline.daysOfWeek?.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{timeline.sessionTime ? 
                  new Date(`2000-01-01T${timeline.sessionTime}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }) : 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frequency:</span>
                <span className="font-medium capitalize">{timeline.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">{timeline.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium">{timeline.endDate}</span>
              </div>
            </div>
          </div>

          {/* Next Session */}
          {nextSession && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Next Session</h4>
                  <p className="text-blue-700">
                    {nextSession.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {timeline.sessionTime && (
                      <span> at {new Date(`2000-01-01T${timeline.sessionTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Schedule (if requested) */}
          {showDetailed && timeline.totalSessions > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Full Schedule</h4>
              <div className="text-sm text-gray-600">
                <p>This course runs {timeline.schedule} for {timeline.duration}.</p>
                <p>Each session is {timeline.sessionDuration} long.</p>
                <p>Total of {timeline.totalSessions} sessions scheduled.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseTimeline