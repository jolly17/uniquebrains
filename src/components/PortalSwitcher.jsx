import { Link } from 'react-router-dom'
import './PortalSwitcher.css'

function PortalSwitcher({ currentPortal, availablePortals, compact = false }) {
  // Only render if user has both portals available
  if (!availablePortals || availablePortals.length < 2) {
    return null
  }

  // Determine the opposite portal
  const oppositePortal = currentPortal === 'teach' ? 'learn' : 'teach'
  const oppositeLabel = oppositePortal === 'teach' ? 'Teaching Portal' : 'Learning Portal'
  const oppositeIcon = oppositePortal === 'teach' ? '👨‍🏫' : '📚'

  if (compact) {
    // Compact mode for footer
    return (
      <div className="portal-switcher compact">
        <Link to={`/${oppositePortal}/dashboard`} className="portal-switch-link">
          Switch to {oppositeLabel} {oppositeIcon}
        </Link>
      </div>
    )
  }

  // Full mode for profile dropdown or other locations
  return (
    <div className="portal-switcher">
      <span className="portal-switcher-label">Currently in {currentPortal === 'teach' ? 'Teaching' : 'Learning'} Portal</span>
      <Link to={`/${oppositePortal}/dashboard`} className="portal-switch-link">
        <span className="portal-switch-icon">{oppositeIcon}</span>
        <span>Switch to {oppositeLabel}</span>
        <span className="portal-switch-arrow">→</span>
      </Link>
    </div>
  )
}

export default PortalSwitcher
