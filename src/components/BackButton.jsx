import { useNavigate } from 'react-router-dom'
import './BackButton.css'

/**
 * Unified BackButton Component
 * 
 * A consistent back navigation button used across the application.
 * Supports both button and link variants with consistent styling.
 * 
 * @param {string} to - The destination path (optional, defaults to navigate(-1))
 * @param {string} label - The button label text (default: "Back")
 * @param {string} variant - Style variant: "default" | "light" | "filled" (default: "default")
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Optional click handler (called before navigation)
 */
function BackButton({ 
  to, 
  label = 'Back', 
  variant = 'default',
  className = '',
  onClick 
}) {
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    
    // Call custom onClick handler if provided
    if (onClick) {
      onClick(e)
    }
    
    // Navigate to specified path or go back
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      type="button"
      className={`back-button-unified back-button-${variant} ${className}`}
      onClick={handleClick}
      aria-label={`Go back: ${label}`}
    >
      <span className="back-button-arrow" aria-hidden="true">←</span>
      <span className="back-button-label">{label}</span>
    </button>
  )
}

export default BackButton