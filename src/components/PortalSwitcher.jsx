import './PortalSwitcher.css'

function PortalSwitcher({ currentPortal, availablePortals, compact = false }) {
  // Always show portal switcher - users can switch between learning and teaching anytime
  if (!availablePortals || availablePortals.length === 0) {
    return null
  }

  // Determine the opposite portal
  const oppositePortal = currentPortal === 'teach' ? 'learn' : 'teach'
  const oppositeLabel = oppositePortal === 'teach' ? 'Teaching Portal' : 'Learning Portal'
  const oppositeIcon = oppositePortal === 'teach' ? '👨‍🏫' : '📚'

  // Handle portal switch with page reload
  const handlePortalSwitch = (e) => {
    e.preventDefault()
    // Use window.location to force a full page reload
    window.location.href = `/${oppositePortal}/dashboard`
  }

  if (compact) {
    // Compact mode for footer
    return (
      <div className="portal-switcher compact">
        <a href={`/${oppositePortal}/dashboard`} onClick={handlePortalSwitch} className="portal-switch-link">
          Switch to {oppositeLabel} {oppositeIcon}
        </a>
      </div>
    )
  }

  // Full mode for profile dropdown or other locations
  return (
    <div className="portal-switcher">
      <span className="portal-switcher-label">Currently in {currentPortal === 'teach' ? 'Teaching' : 'Learning'} Portal</span>
      <a href={`/${oppositePortal}/dashboard`} onClick={handlePortalSwitch} className="portal-switch-link">
        <span className="portal-switch-icon">{oppositeIcon}</span>
        <span>Switch to {oppositeLabel}</span>
        <span className="portal-switch-arrow">→</span>
      </a>
    </div>
  )
}

export default PortalSwitcher
