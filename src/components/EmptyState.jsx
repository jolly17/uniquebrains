import { Link } from 'react-router-dom'
import './EmptyState.css'

/**
 * EmptyState Component
 * Displays a friendly empty state with optional action button
 * 
 * @param {string} icon - Emoji or icon to display (default: 🧠✨)
 * @param {string} title - Main heading text
 * @param {string} description - Supporting description text
 * @param {string} actionText - Button text (optional)
 * @param {string} actionLink - Button link destination (optional)
 * @param {function} onAction - Button click handler (optional, alternative to actionLink)
 * @param {string} variant - Style variant: 'default' | 'compact' | 'card'
 */
function EmptyState({ 
  icon = '🧠✨', 
  title, 
  description, 
  actionText, 
  actionLink,
  onAction,
  variant = 'default',
  children 
}) {
  const renderAction = () => {
    if (!actionText) return null
    
    if (actionLink) {
      return (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )
    }
    
    if (onAction) {
      return (
        <button onClick={onAction} className="btn btn-primary">
          {actionText}
        </button>
      )
    }
    
    return null
  }

  return (
    <div className={`empty-state empty-state-${variant}`}>
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {renderAction()}
      {children && <div className="empty-state-children">{children}</div>}
    </div>
  )
}

// Pre-configured empty states for common use cases
export function EmptyStateCourses() {
  return (
    <EmptyState
      icon="📚"
      title="No courses yet!"
      description="Sparky is excited for you to explore something new!"
      actionText="Browse Courses"
      actionLink="/courses"
    />
  )
}

export function EmptyStateEnrollments() {
  return (
    <EmptyState
      icon="🎓"
      title="You haven't enrolled in any courses"
      description="Start your learning journey today!"
      actionText="Find a Course"
      actionLink="/courses"
    />
  )
}

export function EmptyStateStudents() {
  return (
    <EmptyState
      icon="👥"
      title="No students yet"
      description="Students will appear here once they enroll in your courses."
    />
  )
}

export function EmptyStateMessages() {
  return (
    <EmptyState
      icon="💬"
      title="No messages yet"
      description="Start a conversation to connect with others!"
      variant="compact"
    />
  )
}

export function EmptyStateSearch({ searchTerm }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={searchTerm ? `We couldn't find anything matching "${searchTerm}"` : "Try adjusting your search or filters"}
      variant="compact"
    />
  )
}

export function EmptyStateError({ onRetry }) {
  return (
    <EmptyState
      icon="😕"
      title="Something went wrong"
      description="Don't worry, mistakes help us grow! Let's try again."
      actionText="Try Again"
      onAction={onRetry}
    />
  )
}

export function EmptyStateComingSoon({ feature }) {
  return (
    <EmptyState
      icon="🚀"
      title="Coming Soon!"
      description={feature ? `${feature} is on its way. Stay tuned!` : "This feature is coming soon. Stay tuned!"}
      variant="compact"
    />
  )
}

export default EmptyState