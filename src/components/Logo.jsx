function Logo({ size = 'medium', variant = 'full' }) {
  const sizes = {
    small: { height: 40, fontSize: '1rem' },
    medium: { height: 60, fontSize: '1.5rem' },
    large: { height: 80, fontSize: '2rem' }
  }

  const { height, fontSize } = sizes[size]
  const iconSize = height

  // Brain mascot SVG
  const BrainIcon = () => (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brain outline with gradient */}
      <defs>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6978e1" />
        </linearGradient>
        <linearGradient id="brainLightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      
      {/* Main brain shape - left hemisphere */}
      <path
        d="M 30 35 Q 20 35, 20 45 Q 20 55, 25 60 Q 20 65, 25 75 Q 30 80, 40 78 Q 45 85, 50 85"
        stroke="url(#brainGradient)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Main brain shape - right hemisphere */}
      <path
        d="M 70 35 Q 80 35, 80 45 Q 80 55, 75 60 Q 80 65, 75 75 Q 70 80, 60 78 Q 55 85, 50 85"
        stroke="url(#brainGradient)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Top of brain */}
      <path
        d="M 30 35 Q 35 25, 45 22 Q 50 20, 55 22 Q 65 25, 70 35"
        stroke="url(#brainGradient)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Brain folds - left side */}
      <path
        d="M 28 45 Q 32 45, 35 48"
        stroke="url(#brainLightGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 30 55 Q 35 55, 38 58"
        stroke="url(#brainLightGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 32 65 Q 37 65, 40 68"
        stroke="url(#brainLightGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Brain folds - right side */}
      <path
        d="M 72 45 Q 68 45, 65 48"
        stroke="url(#brainLightGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 70 55 Q 65 55, 62 58"
        stroke="url(#brainLightGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 68 65 Q 63 65, 60 68"
        stroke="url(#brainLightGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Cute eyes */}
      <circle cx="38" cy="50" r="3" fill="#7c3aed" />
      <circle cx="62" cy="50" r="3" fill="#7c3aed" />
      
      {/* Eye sparkles */}
      <circle cx="39.5" cy="48.5" r="1" fill="#f2efff" />
      <circle cx="63.5" cy="48.5" r="1" fill="#f2efff" />
      
      {/* Cute smile */}
      <path
        d="M 42 62 Q 50 67, 58 62"
        stroke="#7c3aed"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )

  // Icon only variant (for favicon)
  if (variant === 'icon') {
    return <BrainIcon />
  }

  // Full logo with text
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <BrainIcon />
      <span style={{ 
        fontSize: fontSize,
        fontWeight: 700,
        background: 'linear-gradient(135deg, #7c3aed 0%, #6978e1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '-0.02em'
      }}>
        UniqueBrains
      </span>
    </div>
  )
}

export default Logo
