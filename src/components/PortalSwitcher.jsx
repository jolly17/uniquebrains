import { useAuth } from '../context/AuthContext'
import './PortalSwitcher.css'

function PortalSwitcher({ currentPortal, availablePortals, compact = false }) {
  const { switchPortal } = useAuth()
  
  // Always show portal switcher - users can switch between learning and teaching anytime
  if (!availablePortals || availablePortals.length === 0) {
    return null
  }

  // Determine the opposite portal
  const oppositePortal = currentPortal === 'teach' ? 'learn' : 'teach'
  const oppositeLabel = oppositePortal === 'teach' ? 'Teaching Portal' : 'Learning Portal'
  const oppositeIcon = oppositePortal === 'teach' ? '👨‍🏫' : '📚'

  // Handle portal switch - updates state without navigation
  const handlePortalSwitch = (e) => {
    e.preventDefault()
    switchPortal(oppositePortal)
  }

  if (compact) {
    // Compact mode for footer
    return (
      <div className="portal-switcher compact">
        <button onClick={handlePortalSwitch} className="portal-switch-link">
          Switch to {oppositeLabel} {oppositeIcon}
        </button>
      </div>
    )
  }

  // Full mode for profile dropdown or other locations
  return (
    <div className="portal-switcher">
      <span className="portal-switcher-label">Currently in {currentPortal === 'teach' ? 'Teaching' : 'Learning'} Portal</span>
      <button onClick={handlePortalSwitch} className="portal-switch-link">
        <span className="portal-switch-icon">{oppositeIcon}</span>
        <span>Switch to {oppositeLabel}</span>
        <span className="portal-switch-arrow">→</span>
      </button>
    </div>
  )
}

export default PortalSwitcher
