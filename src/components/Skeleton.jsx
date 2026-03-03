import './Skeleton.css'

/**
 * Skeleton Component
 * Base skeleton loading placeholder
 * 
 * @param {string} variant - Shape variant: 'text' | 'circular' | 'rectangular'
 * @param {string} width - Width (CSS value)
 * @param {string} height - Height (CSS value)
 * @param {string} className - Additional CSS classes
 */
export function Skeleton({ 
  variant = 'text', 
  width, 
  height, 
  className = '',
  style = {}
}) {
  const combinedStyle = {
    width,
    height,
    ...style
  }

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={combinedStyle}
      aria-hidden="true"
    />
  )
}

/**
 * SkeletonCard Component
 * Pre-built skeleton for course cards
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-label="Loading...">
      <Skeleton variant="rectangular" className="skeleton-card-image" />
      <div className="skeleton-card-content">
        <div className="skeleton-card-meta">
          <Skeleton variant="text" width="60px" height="14px" />
          <Skeleton variant="text" width="80px" height="14px" />
        </div>
        <Skeleton variant="text" width="90%" height="24px" className="skeleton-card-title" />
        <Skeleton variant="text" width="100%" height="16px" />
        <Skeleton variant="text" width="75%" height="16px" />
        <div className="skeleton-card-footer">
          <Skeleton variant="text" width="100px" height="16px" />
          <Skeleton variant="text" width="50px" height="20px" />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonList Component
 * Renders multiple skeleton items
 */
export function SkeletonList({ count = 3, children }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{children || <SkeletonCard />}</div>
      ))}
    </>
  )
}

/**
 * SkeletonText Component
 * Multiple lines of skeleton text
 */
export function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <div className="skeleton-text-block">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          variant="text" 
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height="16px"
        />
      ))}
    </div>
  )
}

/**
 * SkeletonAvatar Component
 * Circular skeleton for avatars
 */
export function SkeletonAvatar({ size = '40px' }) {
  return (
    <Skeleton 
      variant="circular" 
      width={size} 
      height={size}
    />
  )
}

/**
 * SkeletonButton Component
 * Skeleton for button placeholders
 */
export function SkeletonButton({ width = '120px', height = '40px' }) {
  return (
    <Skeleton 
      variant="rectangular" 
      width={width} 
      height={height}
      className="skeleton-button"
    />
  )
}

/**
 * SkeletonTable Component
 * Skeleton for table rows
 */
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex}
              variant="text" 
              width={colIndex === 0 ? '40%' : '80%'}
              height="16px"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonProfile Component
 * Skeleton for profile/user info sections
 */
export function SkeletonProfile() {
  return (
    <div className="skeleton-profile">
      <SkeletonAvatar size="80px" />
      <div className="skeleton-profile-info">
        <Skeleton variant="text" width="150px" height="24px" />
        <Skeleton variant="text" width="200px" height="16px" />
        <Skeleton variant="text" width="120px" height="14px" />
      </div>
    </div>
  )
}

export default Skeleton