// Google Analytics utility for tracking page views in SPA

export const trackPageView = (path, title) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-81HF8BMHMH', {
      page_path: path,
      page_title: title || document.title
    })
  }
}

export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams)
  }
}

// Track custom events
export const trackCourseView = (courseId, courseTitle) => {
  trackEvent('view_course', {
    course_id: courseId,
    course_title: courseTitle
  })
}

export const trackEnrollment = (courseId, courseTitle) => {
  trackEvent('enroll_course', {
    course_id: courseId,
    course_title: courseTitle
  })
}

export const trackInstructorView = (instructorId, instructorName) => {
  trackEvent('view_instructor', {
    instructor_id: instructorId,
    instructor_name: instructorName
  })
}

export const trackQuestionView = (questionId, topicSlug) => {
  trackEvent('view_question', {
    question_id: questionId,
    topic_slug: topicSlug
  })
}

export const trackQuestionCreate = (topicSlug) => {
  trackEvent('create_question', {
    topic_slug: topicSlug
  })
}

export const trackAnswerCreate = (questionId) => {
  trackEvent('create_answer', {
    question_id: questionId
  })
}
